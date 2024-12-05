const express = require('express');
const path = require('path');
const authenticateToken = require('../../middleware/authorization'); // Import the authentication middleware
const router = express.Router();

router.get('/', authenticateToken, function (req, res, next) {
    const tconstValue = req.query.tconst;

    console.log(`tconstValue: ${tconstValue}`);

    // Query the database to get the last image path
    req.db('posters')
        .select('link')
        .where({ tconst: tconstValue })
        .orderBy('id', 'desc') // Assuming 'id' is the primary key or a column that can be used to determine the order
        .first()
        .then(poster => {
            if (!poster) {
                return res.status(404).json({
                    error: true,
                    message: "Poster not found"
                });
            }

            const imagePath = path.join(__dirname, '../../', poster.link);
            res.sendFile(imagePath);
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