const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["The Dark Knight"]
  },
];

let movies = [
  {
    "Title": "The Dark Knight",
    "Description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    "Genre": {
      "Name": "Action",
      "Description": "Movies in the action genre are fast-paced and include a lot of action like fight scenes, chase scenes, and slow-motion shots."
    },
    "Director": {
      "Name": "Christopher Nolan",
      "Bio" : "Best known for his cerebral, often nonlinear, storytelling, acclaimed writer-director Christopher Nolan was born on July 30, 1970, in London, England. Over the course of 15 years of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made.",
      "Birth": 1970
    },
    "ImageURL": "https://m.media-amazon.com/images/I/91KkWf50SoL._AC_UF894,1000_QL80_.jpg",
    "Featured": false
  },
  {
    "Title": "Pulp Fiction",
    "Description": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    "Genre": {
      "Name": "Crime",
      "Description": "Crime film is a genre that revolves around the action of a criminal mastermind. A Crime film will often revolve around the criminal himself, chronicling his rise and fall"
    },
    "Director": {
      "Name": "Quentin Tarantino",
      "Bio" : "Quentin Jerome Tarantino was born in Knoxville, Tennessee. His father, Tony Tarantino, is an Italian-American actor and musician from New York, and his mother, Connie (McHugh), is a nurse from Tennessee. Quentin moved with his mother to Torrance, California, when he was four years old.",
      "Birth": 1963
    },
    "ImageURL": "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    "Featured": false
  },
  {
    "Title": "Arrival",
    "Description": "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    "Genre": {
      "Name": "Drama",
      "Description": "The drama genre features stories with high stakes and many conflicts. They're plot-driven and demand that every character and scene move the story forward."
    },
    "Director": {
      "Name": "Denis Villeneuve",
      "Bio" : "Denis Villeneuve is a French Canadian film director and writer. He was born in 1967, in Trois-Rivières, Québec, Canada. He started his career as a filmmaker at the National Film Board of Canada. He is best known for his feature films Arrival (2016), Sicario (2015), Prisoners (2013), Enemy (2013), and Incendies (2010). He is married to Tanya Lapointe.",
      "Birth": 1967
    },
    "ImageURL": "https://m.media-amazon.com/images/I/91UusfCtQaL._AC_UF894,1000_QL80_.jpg",
    "Featured": false
  },
  {
    "Title": "Moonlight",
    "Description": "A young African-American man grapples with his identity and sexuality while experiencing the everyday struggles of childhood, adolescence, and burgeoning adulthood.",
    "Genre": {
      "Name": "Drama",
      "Description": "The drama genre features stories with high stakes and many conflicts. They're plot-driven and demand that every character and scene move the story forward."
    },
    "Director": {
      "Name": "Barry Jenkins",
      "Bio" : "Barry Jenkins was born on 19 November 1979 in Miami, Florida, USA. He is a producer and director, known for If Beale Street Could Talk (2018), Moonlight (2016) and Aftersun (2022).",
      "Birth": 1979
    },
    "ImageURL": "https://m.media-amazon.com/images/M/MV5BNzQxNTIyODAxMV5BMl5BanBnXkFtZTgwNzQyMDA3OTE@._V1_.jpg",
    "Featured": false
  },
  {
    "Title": "Manchester by the Sea",
    "Description": "A depressed uncle is asked to take care of his teenage nephew after the boy's father dies.",
    "Genre": {
      "Name": "Drama",
      "Description": "The drama genre features stories with high stakes and many conflicts. They're plot-driven and demand that every character and scene move the story forward."
    },
    "Director": {
      "Name": "Kenneth Lonergan",
      "Bio" : "Kenneth Lonergan is a playwright, screenwriter and director. His film, You Can Count on Me (2000), which he wrote and directed, was nominated for an Academy Award for Best Screenplay, won the Sundance 2000 Grand Jury Prize and the Waldo Salt Screenwriting Award, the NY Film Critics Circle, LA Film Critics Circle, Writers Guild of America and National Board of Review awards for Best Screenplay of 2001, the AFI awards for Best Film and Best New Writer.",
      "Birth": 1962
    },
    "ImageURL": "https://m.media-amazon.com/images/M/MV5BMTYxMjk0NDg4Ml5BMl5BanBnXkFtZTgwODcyNjA5OTE@._V1_.jpg",
    "Featured": false
  },
  {
    "Title": "Star Wars Episode III - Revenge of the Sith",
    "Description": "Three years into the Clone Wars, Obi-Wan pursues a new threat, while Anakin is lured by Chancellor Palpatine into a sinister plot to rule the galaxy.",
    "Genre": {
      "Name": "Action",
      "Description": "Movies in the action genre are fast-paced and include a lot of action like fight scenes, chase scenes, and slow-motion shots."
    },
    "Director": {
      "Name": "George Lucas",
      "Bio" : "George Walton Lucas, Jr. was raised on a walnut ranch in Modesto, California. His father was a stationery store owner and he had three siblings. During his late teen years, he went to Thomas Downey High School and was very much interested in drag racing. He planned to become a professional racecar driver. However, a terrible car accident just after his high school graduation ended that dream permanently. The accident changed his views on life.",
      "Birth": 1944
    },
    "ImageURL": "https://m.media-amazon.com/images/M/MV5BNTc4MTc3NTQ5OF5BMl5BanBnXkFtZTcwOTg0NjI4NA@@._V1_FMjpg_UX1000_.jpg",
    "Featured": false
  },
  {
    "Title": "Harry Potter and the Goblet of Fire",
    "Description": "Harry Potter finds himself competing in a hazardous tournament between rival schools of magic, but he is distracted by recurring nightmares.",
    "Genre": {
      "Name": "Adventure",
      "Description": "Adventure film is a genre that revolves around the conquests and explorations of a protagonist. The purpose of the conquest can be to retrieve a person or treasure, but often the main focus is simply the pursuit of the unknown."
    },
    "Director": {
      "Name": "Mike Newell",
      "Bio" : "Attended Cambridge University. Three year training course at Granada Television, with intention of going into theatre. Graduated to directing TV plays, building strong reputation for work with David Hare, David Edgar, Hohn, John Osborne, Jack Rosenthal.",
      "Birth": 1942
    },
    "ImageURL": "https://m.media-amazon.com/images/M/MV5BMTI1NDMyMjExOF5BMl5BanBnXkFtZTcwOTc4MjQzMQ@@._V1_FMjpg_UX1000_.jpg",
    "Featured": false
  },
  {
    "Title": "Anchorman: The Legend of Ron Burgundy",
    "Description": "In the 1970s, an anchorman's stint as San Diego's top-rated newsreader is challenged when an ambitious newswoman becomes his co-anchor.",
    "Genre": {
      "Name": "Comedy",
      "Description": "A comedy film is a category of film which emphasizes on humor. These films are designed to make the audience laugh in amusement."
    },
    "Director": {
      "Name": "Adam McKay",
      "Bio" : "Adam McKay (born April 17, 1968) is an American screenwriter, director, comedian, and actor. McKay has a comedy partnership with Will Ferrell, with whom he co-wrote the films Anchorman, Talladega Nights, and The Other Guys. Ferrell and McKay also founded their comedy website Funny or Die through their production company Gary Sanchez Productions. He has been married to Shira Piven since 1999. They have two children.",
      "Birth": 1968
    },
    "ImageURL": "https://m.media-amazon.com/images/I/51gbWRaL0IL._AC_UF894,1000_QL80_.jpg",
    "Featured": false
  },
  {
    "Title": "Elf",
    "Description": "Raised as an oversized elf, Buddy travels from the North Pole to New York City to meet his biological father, Walter Hobbs, who doesn't know he exists and is in desperate need of some Christmas spirit.",
    "Genre": {
      "Name": "Comedy",
      "Description": "A comedy film is a category of film which emphasizes on humor. These films are designed to make the audience laugh in amusement."
    },
    "Director": {
      "Name": "Jon Favreau",
      "Bio" : "Initially an indie film favorite, actor Jon Favreau has progressed to strong mainstream visibility into the millennium and, after nearly two decades in the business, is still enjoying character stardom as well as earning notice as a writer/producer/director.",
      "Birth": 1966
    },
    "ImageURL": "https://m.media-amazon.com/images/M/MV5BMzUxNzkzMzQtYjIxZC00NzU0LThkYTQtZjNhNTljMTA1MDA1L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    "Featured": false
  },
  {
    "Title": "Men In Black",
    "Description": "A police officer joins a secret organization that polices and monitors extraterrestrial interactions on Earth.",
    "Genre": {
      "Name": "Action",
      "Description": "Movies in the action genre are fast-paced and include a lot of action like fight scenes, chase scenes, and slow-motion shots."
    },
    "Director": {
      "Name": "Barry Sonnenfeld",
      "Bio" : "Barry Sonnenfeld was born and raised in New York City. He graduated from New York University Film School in 1978. He started work as director of photography on the Oscar-nominated In Our Water (1982). Then Joel Coen and Ethan Coen hired him for Blood Simple (1984). This film began his collaboration with the Coen Bros., who used him for their next two pictures, Raising Arizona (1987) and Miller's Crossing (1990).",
      "Birth": 1966
    },
    "ImageURL": "https://m.media-amazon.com/images/M/MV5BMzUxNzkzMzQtYjIxZC00NzU0LThkYTQtZjNhNTljMTA1MDA1L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    "Featured": false
  },
];

//CREATE a new user 
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('Users need names');
  }
});

//READ list of all movies 
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//READ a single movie by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params; //uses Object Destructuring to set title equal to req.params.title
  const movie = movies.find( movie => movie.Title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie');
  }
});

//READ a single genre by name
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre; //without the .Genre at the end, it would return the whole movie object, not just the Genre object within it

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre');
  }
});

//READ a single director by name
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName ).Director; //without the .Genre at the end, it would return the whole movie object, not just the Genre object within it

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director');
  }
});

//UPDATE usernames
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id ); //we use two and not three equals signs here because on ID is a number and one is a string, with 3 equals signs they would not be equal 

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('user not found');
  }
});

//CREATE favorite movies
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id ); 

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('user not found');
  }
});

//DELETE favorite movies
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id ); 

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('user not found');
  }
});

//DELETE user email
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id ); 

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`user ${id} has been deleted.`);
  } else {
    res.status(400).send('user not found');
  }
});

//LISTEN
app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
