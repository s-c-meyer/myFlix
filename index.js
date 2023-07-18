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


mongoose.connect('mongodb://0.0.0.0:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true }); //allows Mongoose to connect to the database you created in MongoDB

//Add a user
/* We'll expect JSON in this format
{
  ID: Integer,
  Username: String, 
  Password: String,
  Email: String, 
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
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
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, //this line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err)
    } else {
      res.json(updatedUser);
    }
  });
});

//GET all Movies
app.get('/movies', (req, res) => {
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
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Returns the first movie with that specific genre
app.get('/movies/genre/:Name', (req, res) => {
  Movies.findOne({ Name: req.params.Name })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//How the code is setup in the example from Exercise 2.7
app.get('/genre/:Name', (req, res) => {
  Genres.findOne({ Name: req.params.Name })
    .then((genre) => {
      res.json(genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});




//code from previous exercises

// const express = require('express'), 
//   morgan = require('morgan');

// const app = express();

// app.use(morgan('common'));

// //JSON Object containing top 10 movies
// let topMovies = [
//   {
//     title: 'The Dark Knight',
//     director: 'Christopher Nolan'
//   },
//   {
//     title: 'Pulp Fiction',
//     director: 'Quentin Tarantino'
//   },
//   {
//     title: 'Arrival',
//     director: 'Denis Villeneuve'
//   },
//   {
//     title: 'Moonlight',
//     director: 'Barry Jenkins'
//   },
//   {
//     title: 'Manchester by the Sea',
//     director: 'Kenneth Lonergan'
//   },
//   {
//     title: 'Star Wars Episode III - Revenge of the Sith',
//     director: 'George Lucas'
//   },
//   {
//     title: 'Harry Potter and the Goblet of Fire',
//     director: 'Mike Newell'
//   },
//   {
//     title: 'Anchorman: The Legend of Ron Burgundy',
//     director: 'Adam McKay'
//   },
//   {
//     title: 'Elf',
//     director: 'Jon Favreau'
//   },
//   {
//     title: 'Men In Black',
//     director: 'Barry Sonnenfeld'
//   }
// ];

// app.get('/', (req, res) => {
//   res.send('Welcome to my movie app, MyFlix!');
// });

// app.get('/movies', (req, res) => {
//   res.json(topMovies);
// });

// app.use(express.static('public'));

// //error handling middleware should always be defined last in a chain of middleware, but before the app.listen()
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something has gone wrong!');
// });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});