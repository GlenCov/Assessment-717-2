const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
require('dotenv').config();


router.post('/', function (req, res, next) {
    console.log('Request URL:', req.originalUrl);

    // 1. Retrieve email and password from req.body
    const email = req.body.email;
    const password = req.body.password;

    // Verify body
    if (!email || !password) {
        res.status(400).json({
            error: true,
            message: "Request body incomplete - email and password needed"
        });
        return;
    }

    // 2. Determine if user already exists in table
    const queryUsers = req.db.from("users").select("*").where("email", "=", email);
    queryUsers
        .then(users => {
            if (users.length === 0) {
                res.status(401).json({
                    error: true,
                    message: "User does not exist"
                });
                return null; // Ensure no further code is executed
            }

            // Compare password hashes
            const user = users[0];
            return bcrypt.compare(password, user.hash);
        })
        .then(match => {
            if (match === null) return; // Exit if user does not exist

            if (!match) {
                res.status(401).json({
                    error: true,
                    message: "Passwords do not match"
                });
                return;
            }

            console.log("Passwords match");

            // 2.1.1 If passwords match, return JWT
            const expires_in = 60 * 60 * 24;
            const exp = Math.floor(Date.now() / 1000) + expires_in;
            const token = jwt.sign({ exp }, process.env.JWT_SECRET);
            res.status(200).json({
                token,
                token_type: "Bearer",
                expires_in
            });
        })
        .catch(error => {
            res.status(500).json({
                error: true,
                message: "Database error"
            });
            console.log(`Database error:`, error);
        });

});

module.exports = router;