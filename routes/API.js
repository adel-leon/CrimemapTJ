var express = require('express');
var router = express.Router();
var crimes = require('../api/routes/apiRoutes')

/* GET crimes listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
