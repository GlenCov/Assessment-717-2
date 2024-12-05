var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    // Get parameters from the query string
    const imdbID = req.query.imdbID;

    // Check there is a value in the query string
    if (!imdbID) {
        res.status(400).json({
            error: true,
            message: "Request query incomplete - movie needed"
        });
        return;
    }
    console.log(imdbID);


    // Search for movies where the title contains the specified string and order by title in ascending order
    const movie = req.db.from("basics")
        .select(
            "basics.primaryTitle as title",
            "basics.startYear as year",
            "basics.tconst as imdbID",
            "basics.runtimeMinutes as runtime",
            "basics.genres as genres",
            req.db.raw("GROUP_CONCAT(DISTINCT directors.primaryName ORDER BY directors.primaryName ASC SEPARATOR ', ') as Director"),
            req.db.raw("GROUP_CONCAT(DISTINCT writers.primaryName ORDER BY writers.primaryName ASC SEPARATOR ', ') as Writer"),
            req.db.raw("GROUP_CONCAT(DISTINCT actors.primaryName ORDER BY actors.primaryName ASC SEPARATOR ', ') as Actors"),
            "ratings.averageRating as Rating"
        )
        .leftJoin("principals as directors_principals", function () {
            this.on("basics.tconst", "=", "directors_principals.tconst")
                .andOn("directors_principals.category", "=", req.db.raw("'director'"));
        })
        .leftJoin("names as directors", "directors_principals.nconst", "directors.nconst")
        .leftJoin("principals as writers_principals", function () {
            this.on("basics.tconst", "=", "writers_principals.tconst")
                .andOn("writers_principals.category", "=", req.db.raw("'writer'"));
        })
        .leftJoin("names as writers", "writers_principals.nconst", "writers.nconst")
        .leftJoin("principals as actors_principals", function () {
            this.on("basics.tconst", "=", "actors_principals.tconst")
                .andOn("actors_principals.category", "=", req.db.raw("'actor'"));
        })
        .leftJoin("names as actors", "actors_principals.nconst", "actors.nconst")
        .leftJoin("ratings", "basics.tconst", "ratings.tconst")
        .where("basics.tconst", "=", imdbID)
        .groupBy("basics.primaryTitle", "basics.startYear", "basics.tconst", "basics.runtimeMinutes", "basics.genres", "ratings.averageRating")
        .orderBy("basics.tconst", "asc");

    movie
        .then(data => {
            if (data.length === 0) {
                res.status(401).json({
                    error: true,
                    message: "No movies found"
                });
                return null; // Ensure no further code is executed
            }

            res.status(200).json(data);
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