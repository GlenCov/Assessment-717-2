app.use((req, res, next) => {
    req.db = knex;
    next();
});

app.get("/knex", function (req, res, next) {
    req.db
        .raw("SELECT VERSION()")
        .then((version) => console.log(version[0][0]))
        .catch((err) => {
            console.log(err);
            throw err;
        });

    res.send("Version Logged successfully");
});

