// server.js or app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
// const OpenIDConnectStrategy = require('passport-openidconnect');

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add express-session middleware
app.use(session({
    secret: process.env.CLIENT_SECRET, // Replace with a secure secret key
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    cookie: { secure: false } // Set 'true' in production with HTTPS
  }));
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  

// // Configure Passport OIDC strategy
// passport.use(
//   new OpenIDConnectStrategy(
//     {
//       issuer: process.env.ISSUER_URL,
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: process.env.REDIRECT_URI,
//       scope: ['profile', 'email'], // Request user profile and email
//     },
//     (issuer, profile, cb) => {
//       // You can save user info to DB or session here
//       return cb(null, profile);
//     }
//   )
// );


// const passport = require('passport');
const OpenIDConnectStrategy = require('passport-openidconnect').Strategy;

passport.use('onelogin', new OpenIDConnectStrategy({
    issuer: process.env.ISSUER_URL, // Your OneLogin OpenID Issuer
    authorizationURL: 'https://telus.onelogin.com/oidc/authorize',
    tokenURL: 'https://telus.onelogin.com/oidc/token',
    // userInfoURL: 'https://<YOUR_ONELOGIN_DOMAIN>/oidc/me',
    clientID: process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI, // Your redirect URI
    scope: 'openid profile email' // Add appropriate scopes
  },
  (issuer, sub, profile, accessToken, refreshToken, done) => {
    // Custom verification callback
    return done(null, profile);
  }
));


passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/login', passport.authenticate('openidconnect'));
app.get(
  '/home',
  passport.authenticate('openidconnect', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/profile'); // Redirect to frontend or profile page
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));
