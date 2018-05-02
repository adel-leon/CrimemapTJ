var mongoose = require('mongoose');
var Crimes = mongoose.model('Crimes');

exports.get_all_crimes = function(req, res) {
  Crimes.find({}, function(err, crime) {
    if (err)
      res.send(err);
    res.json(crime);
  });
};

exports.get_one_crime = function(req, res) {
  Crimes.findById(req.params.crimeId, function(err, crime) {
    if (err)
      res.send(err);
    res.json(crime);
  });
};


