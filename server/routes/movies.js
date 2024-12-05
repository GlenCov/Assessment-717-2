const express = require('express');
var router = express.Router();


/* GET home page. */
router.use('/search', require('./movies/search'));

router.use('/data', require('./movies/data'));

module.exports = router;
