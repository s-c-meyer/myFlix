const express = require('express'), 
  morgan = require('morgan');

const app = express();

app.use(morgan('common'));

//JSON Object containing top 10 movies
let topMovies = [
  {
    title: 'The Dark Knight',
    director: 'Christopher Nolan'
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino'
  },
  {
    title: 'Arrival',
    director: 'Denis Villeneuve'
  },
  {
    title: 'Moonlight',
    director: 'Barry Jenkins'
  },
  {
    title: 'Manchester by the Sea',
    director: 'Kenneth Lonergan'
  },
  {
    title: 'Star Wars Episode III - Revenge of the Sith',
    director: 'George Lucas'
  },
  {
    title: 'Harry Potter and the Goblet of Fire',
    director: 'Mike Newell'
  },
  {
    title: 'Anchorman: The Legend of Ron Burgundy',
    director: 'Adam McKay'
  },
  {
    title: 'Elf',
    director: 'Jon Favreau'
  },
  {
    title: 'Men In Black',
    director: 'Barry Sonnenfeld'
  }
];

app.get('/', (req, res) => {
  res.send('Welcome to my movie app, MyFlix!');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.use(express.static('public'));

//error handling middleware should always be defined last in a chain of middleware, but before the app.listen()
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something has gone wrong!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});