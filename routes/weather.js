// Create a new router
const express = require("express");
const { query, validationResult } = require("express-validator");
const router = express.Router()
const request = require('request')

router.get('/forcast', function(req, res, next){       
    res.render('weather.ejs', {weatherData: null, error: null})
});


router.get('/forcast-search', 
    [
        query('search-box')
            .matches(/^[A-Za-z\s]+$/) // Allows letters AND spaces (\s)
            .withMessage('City name must contain only letters and spaces.')
            .isLength({ max: 50 })
            .withMessage('City name cannot be longer than 50 characters.')
            .trim() 
            .escape() 
    ],
    function(req, res, next){
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there are validation errors, render the page again and pass the first error message to the 'error' variable
        return res.render('weather.ejs', { 
            weatherData: null, 
            error: errors.array()[0].msg
        });
    }

    let cityname = req.query['search-box'];

    if (cityname === ""){
        // Handle empty search immediately
        return res.redirect('/forcast');
    }

    if (cityname !== ""){
        let apiKey = '34a44597ddf44159712d546c9f1a0594'
        let city = cityname
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
                        
        request(url, function (err, response, body) {
            if(err){
                next(err)
            } 
            var weather = JSON.parse(body)
            if (weather.cod && weather.cod != 200) {
                res.render('weather.ejs', {weatherData: null, error: 'Opps! unvalid city'});
            }
            else {
                res.render('weather.ejs', {weatherData: weather, error: null});
            }
        });
    }
              
});




// Export the router object so index.js can access it
module.exports = router