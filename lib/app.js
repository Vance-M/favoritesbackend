const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const md5 = require('md5');
const request = require('superagent');
const { formatCharacters } = require('../mungeUtils');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/characters', async(req, res) =>{
  try {
    const ts = Date.now();
    const hashKey = md5(`${ts}${process.env.PRIVATE_KEY}${process.env.PUBLIC_KEY}`);
    // const characterName = req.query.search;
    const characterData = await request.get(`https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${process.env.PUBLIC_KEY}&hash=${hashKey}`);
    // const formattedResponse = formatLocation(locationData.body);
    const finalResponse = formatCharacters(characterData.body);
    res.json(finalResponse);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;

// const characterData = await request.get(`https://gateway.marvel.com:443/v1/public/characters?name=${characterName}&ts=${ts}&apikey=${process.env.PUBLIC_KEY}&hash=${hashKey}`);
