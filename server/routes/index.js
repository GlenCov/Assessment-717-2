var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('This it Glen Coventon API server  Go to /docs for API documentation');
});

module.exports = router;
