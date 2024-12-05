const bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();

router.post('', function (req, res, next) {
    console.log("Register");
    const email = req.body.email;
    const password = req.body.password;

    console.log("Email:", email);

    // Verify body
    if (!email || !password) {
        res.status(400).json({
            error: true,
            message: "Request body incomplete - email and password needed"
        });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({
            error: true,
            message: "Invalid email format"
        });
        return;
    }

    // Determine if user already exists in table
    const queryUsers = req.db.from("users").select("*").where("email", "=", email);
    queryUsers.then(users => {
        if (users.length > 0) {
            res.status(409).json({
                error: true,
                message: "User already exists"
            });
            return; // Ensure no further code is executed
        }

        // Insert user into DB
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);
        //const userId = uuidv4(); // Generate a unique ID

        return req.db.from("users").insert({ email, hash })
            .then(() => {
                res.status(201).json({ success: true, message: "User created" });
            })
            .catch(error => {
                res.status(500).json({
                    error: true,
                    message: "Database error - user not created"
                });
                console.log(`Database error:`, error);
            });
    });
});

module.exports = router;