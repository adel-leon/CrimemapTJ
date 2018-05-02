var express = require('express');
var router = express.Router();
var api = require('../controllers/apiController');

  // api Routes
  router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });

  router.get('/crimes',api.get_all_crimes);

  router.get('/crimes/:crimeId',api.get_one_crime);
      
  module.exports = router;