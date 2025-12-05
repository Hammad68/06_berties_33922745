// Create a new router
const express = require("express")
const router = express.Router()
const request = require('request')
const { query, validationResult } = require("express-validator");

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
        return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
})

router.get('/weather', function(req, res, next){       
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
        return res.redirect('/weather');
    }

    if (cityname !== ""){
        let apiKey = process.env.apiKey
        let city = cityname
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
                        
        request(url, function (err, response, body) {
            if(err){
                return next(err)
            } 
            var weather = JSON.parse(body)
            if (weather.cod && weather.cod != 200) {
                res.render('weather.ejs', {weatherData: null, error: 'Opps! Results Not Found'});
            }
            else {
                res.render('weather.ejs', {weatherData: weather, error: null});
            }
        });
    }
              
});

// Export the router object so index.js can access it
module.exports = router