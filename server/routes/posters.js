const express = require('express');
var router = express.Router();


/* GET home page. */
router.use('/add', require('./posters/add'));

router.use('/get', require('./posters/get'));

module.exports = router;
