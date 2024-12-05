const express = require('express');
var router = express.Router();


// GET users listing
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// Use the login route
router.use('/login', require('./users/login'));

router.use('/register', require('./users/register'));

module.exports = router;