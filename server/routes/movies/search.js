var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    // Get parameters from the query string
    const title = req.query.movie;
    const year = req.query.year;
    const page = req.query.page;

    // Check there is a value in the query string
    if (!title) {
        res.status(400).json({
            error: true,
            message: "Request query incomplete - movie needed"
        });
        return;
    }

    // Validate title is a string
    if (typeof title !== 'string') {
        res.status(400).json({
            error: true,
            message: "Invalid type - title must be a string"
        });
        return;
    }

    // Validate year is a number if provided
    if (year && isNaN(Number(year))) {
        res.status(400).json({
            error: true,
            message: "Invalid type - year must be a number"
        });
        return;
    }

    // Validate page is a number if provided
    if (page && isNaN(Number(page))) {
        res.status(400).json({
            error: true,
            message: "Invalid type - page must be a number"
        });
        return;
    }

    console.log(title);

    // Search for movies where the title contains the specified string and order by title in ascending order
    const movieList = req.db.from("basics")
        .select("*")
        .where("primaryTitle", "like", `%${title}%`)
        .orderBy("primaryTitle", "asc");

    if (year) {
        movieList.andWhere("startYear", "=", year);
    };


    if (page && page > 0) {
        movieList.limit(5);
        movieList.offset((page - 1) * 2);
    }
    
    movieList
        .then(data => {
            if (data.length === 0) {
                res.status(401).json({
                    error: true,
                    message: "No movies found"
                });
                return null; // Ensure no further code is executed
            }
            const formattedData = data.map(movie => ({
                Title: movie.primaryTitle,
                Year: movie.startYear,
                imdbID: movie.tconst,
                Type: movie.titleType
            }));


            res.status(200).json(formattedData);
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