const mongoose = require('mongoose'),
  Models = require('./models.js'),
  bodyParser = require('body-parser'),
  express = require('express'),
  app = express(),
  Movies = Models.Movie,
  Users = Models.User,
  Genres = Models.Genre,
  Directors = Models.Director;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { check, validationResult } = require('express-validator');

const cors = require('cors');

//list of domains allowed access to the API
let allowedOrigins = ['http://localhost8080', 'http://testsite.com', 'http://localhost:1234']
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
require('./passport');

// mongoose.connect('mongodb://0.0.0.0:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true }); //allows Mongoose to connect to the database you created in MongoDB
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }); //uses an environment variable generated in heroku to connect to MongoDB Atlas without exposing the URL 

//An initial welcome message that displays on the index page of the app
app.get('/', (req, res) => {
  res.send('Welcome to MyFlix Movie Database!');
})

//Add a user
/* We'll expect JSON in this format
{
  ID: Integer,
  Username: String, 
  Password: String,
  Email: String, 
  Birthday: Date
}*/
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
/* We'll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', 
  [
    check('Username', 'Username is required(5 or more characters').isLength({min: 5}),
    check('Username', 'Username must contain only alpha-numeric characters').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
passport.authenticate('jwt', { session: false }), (req, res) => {
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

//GET Movie by Title
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

//GET Genre Info by Name
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

//POST Favorite Movie to User's List
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

//DELETE Favorite Movie to User's List
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

//DELETE a user by username
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

//This will search for a pre-configured port number in the environment variable, and if nothing is found, sets the port to a certain port number. 
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});
