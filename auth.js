const jwtSecret = 'your_jwt_secret' //this must match the jwtsecret used in the JWT Strategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); //your local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, //This is the username that is being encoded in the JWT
    expiresIn: '7d', //This specifies that the token will expire in 7 days
    algorithm: 'HS256' //This is the algorithm used to 'sign' or encode the values of the JWT
  });
}

//POST Login
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token }); //this is ES6 shorthand for res.json({ user: user, token: token })
      });
    })(req, res);
  });
}