const express = require('express');
const multer = require('multer');
const path = require('path');
const authenticateToken = require('../../middleware/authorization'); // Import the authentication middleware
const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'posterArt/'); // Directory to save the uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save the file with a unique name
    }
});

const upload = multer({ storage: storage });

router.post('/', authenticateToken, upload.single('poster'), function (req, res, next) {
    const tconst = req.body.tconst;
    const file = req.file;

    if (!tconst || !file) {
        return res.status(400).json({
            error: true,
            message: "tconst and poster image are required"
        });
    }

    // Save the link to the database
    const link = `/posterArt/${file.filename}`;
    req.db('posters').insert({ tconst, link })
        .then(() => {
            res.status(201).json({
                success: true,
                message: "Poster uploaded and link saved",
                link: link
            });
        })
        .catch(error => {
            res.status(500).json({
                error: true,
                message: "Database error",
                details: error
            });
        });
});

module.exports = router;