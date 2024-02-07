const mongoose = require('mongoose'),
  Models = require('./models.js'),
  bodyParser = require('body-parser'),
  express = require('express'),
  app = express(),
  Movies = Models.Movie,
  Users = Models.User,
  Genres = Models.Genre,
  Directors = Models.Director;
 
const multer = require('multer');
const { Readable } = require('stream');
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fileUpload = require('express-fileupload')

app.use(fileUpload());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { check, validationResult } = require('express-validator');

const cors = require('cors');

//list of domains allowed access to the API
let allowedOrigins = ['http://localhost8080', 'http://testsite.com', 'http://localhost:1234', 'https://meyersmovies.netlify.app', 'http://localhost:4200']
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ //If a specific origin isn't found on the list of allowed origins 
      let message = 'The CORS Policy for this application doesn\'t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app); //this must be placed after the above bodyParser middleware functions. (app) ensures that Express is available in auth.js file as well. 

const passport = require('passport');
const { read } = require('fs');
require('./passport');

// mongoose.connect('mongodb://0.0.0.0:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true }); //allows Mongoose to connect to the database you created in MongoDB
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }); //uses an environment variable generated in heroku to connect to MongoDB Atlas without exposing the URL 

//An initial welcome message that displays on the index page of the app
app.get('/', (req, res) => {
  res.send('Welcome to MyFlix Movie Database!');
})

/**
 * @function
 * POST a user into the database
 * @param {number} ID - the id of the user
 * @param {string} Username - username displayed for the user
 * @param {string} Password - password to be hashed
 * @param {string} Email - valid email for the user
 * @param {date} Birthday - valid birthday for the user
 * @returns {user}
 */
app.post('/users',
  //all of the validation logic for the request 
  [
    check('Username', 'Username is required(5 or more characters').isLength({min: 5}),
    check('Username', 'Username must contain only alpha-numeric characters').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {  
    //check the validation object for errors
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  let hashedPassword = Users.hashPassword(req.body.Password); //hash the submitted password using bcrypt
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword, //store the hashed password, not the original submitted one
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {
            res.status(201).json(user) 
          })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//UPDATE a user's info, by username
/**
 * @function
 * UPDATE a user's info, by username.
 * Expects JSON in the below format
 * @param {number} ID - the id of the user
 * @param {string} Username - username displayed for the user
 * @param {string} Password - password to be hashed
 * @param {string} Email - valid email for the user
 * @param {date} Birthday - valid birthday for the user
 * @returns {user}
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  //Ensure that one user cannot edit another user's data
  if(req.user.Username !== req.params.Username){ 
    return res.status(400).send('Permission Denied');
  }
  //Check validation object for errors
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set: 
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  }, 
  { new: true })
  .then(updatedUser => {
    res.json(updatedUser);
  })
  .catch(err => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//GET all Movies
/**
 * @function
 * GET all movies from the database. 
 * @returns
 * Array of movies 
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @function
 * GET Movie by Title
 * @param {string} movieTitle - the title of the selected movie
 * @returns
 * A single movie object
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @function
 * GET Genre Info by Name
 * @param {string} genreName - the name of the selected genre
 * @returns
 * A single genre object 
 */
app.get('/genre/:GenreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  const genreName = req.params.GenreName;
  Movies.findOne({'Genre.Name' : genreName}, { 'Genre' : 1 }) // Use dot notation to access the Genre subdocument's Name property
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET Director Info by Name
/**
 * @function
 * GET Director Info by Name
 * @param {string} directorName - the name of the selected director
 * @returns
 * A single director object
 */
app.get('/director/:DirectorName', passport.authenticate('jwt', { session: false }), (req, res) => {
  const directorName = req.params.DirectorName;
  Movies.findOne({ 'Director.Name': directorName }, {'Director' : 1}) // Use dot notation to access the Director subdocument's Name property
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @function
 * POST Favorite Movie to User's List
 * @param {string} Username - add to the favorite movie list of this user
 * @param {string} movieID - the unique identifier of the movie to be added to the list
 * @returns
 * The user object with the updated favorite movies list 
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.Username){ //this if statement ensures that one user cannot edit another user's data
    return res.status(400).send('Permission Denied');
  }
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $addToSet: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }) //This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
  res.status(500).send('Error: ' + err);
  });
});

/**
 * @function
 * DELETE Favorite Movie to User's List
 * @param {string} Username - remove from the favorite movie list of this user
 * @param {string} movieID - the unique identifier of the movie to be removed from the list
 * @returns
 * The user object with the updated favorite movies list 
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.Username){ //this if statement ensures that one user cannot edit another user's data
    return res.status(400).send('Permission Denied');
  }
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }) //This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
  res.status(500).send('Error: ' + err);
  });
});

/**
 * @function
 * DELETE a user by username
 * @param {string} Username - the user to be deleted
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found.');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//these functions were added for AWS integration, for downloading/uploading photos to an S3 bucket

//Instantiate an S3 Client object from the S3Client class
//here is where you would also pass in AWS Credentials if they were necessary, you could use Environment Variables for this to uphold anonymity
const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

//Configure Multer to use S3
const upload = multer({
  storage: multerS3Storage(),
});

function multerS3Storage() {
  return multer.memoryStorage();
}

//Instantiate a command from the ListObjectsV2Command class
let listObjectParams = {
  Bucket: 'ach-2-images'
};

listObjectsCmd = new ListObjectsV2Command(listObjectParams); //not sure this is necessary?

//gets a list of objects from a specific S3 bucket 
app.get('/imageslist', (req, res) => {
  listObjectParams = {
    Bucket: 'ach-2-images'
  }
  s3Client.send(new ListObjectsV2Command(listObjectParams)) //.send will execute the command
    .then((listObjectsResponse) => {
      res.send(listObjectsResponse)
    })
});

//uploads an image to a specific S3 Bucket
app.post('/images', async (req, res) => {
  const file = req.files.file //does not work with req.files.image
  const fileName = req.files.file.name //does not work with req.files.image.name

  const bucketParams = {
    Bucket: 'ach-2-images',
    Key: fileName,
    Body: file.data,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    res.send(data)
  } catch (err) {
    console.log("Error", err);
    res.status(500).send('Error uploading file to S3 Bucket');
  }
});

//upload an imagev2 where the browser will prompt you
app.post('/imagesupload', upload.single('file'), async (req, res) => {
  try{
    if (!req.file) {
      return res.status(400)/json({ error: 'No File Provided '});
    }

    const fileData = req.file.buffer;
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const bucketName = 'ach-2-images';

    //convert buffer to Readable Stream
    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(fileData);
    readableStream.push(null);

    //upload the image to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: readableStream,
      ACL: 'public-read',
    };

    await s3Client.send( new PutObjectCommand(uploadParams));

    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
    console.log('Image uploaded to:', imageUrl);

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image: ' + error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/images/:filename', async (req, res) => {
  const fileName = req.params.filename;

  const getObjectParams = {
    Bucket: 'ach-2-images',
    Key: fileName,
  };

  try {
    const { Body, ContentType } = await s3Client.send(new GetObjectCommand(getObjectParams));

    res.setHeader('Content-disposition', `attachment; filename=${fileName}`); //this causes the browser to prompt a download, and identifies the file as an attachment to be downloaded, with the filename from the S3 bucket
    res.setHeader('Content-type', ContentType || 'application/octet-stream');

    Body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(404).send('File not Found');
  }
});

//This will search for a pre-configured port number in the environment variable, and if nothing is found, sets the port to a certain port number. 
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});
