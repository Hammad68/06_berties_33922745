// Create a new router
const express = require("express")
const router = express.Router()
const { check, validationResult, query } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      return res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}


router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

router.get('/search-result', 
    query('search-box').isLength({ min: 1, max: 30}).isAlpha().withMessage('Search term must be string, atleast 1 and atmost 30 characters').trim().escape(),
    function (req, res, next) {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.render('search', {errors: errors.array()});
            return;
        }
        else {
            //searching in the database
            // query database to get all the books based on the search keyword
            let sqlquery = "SELECT * FROM books WHERE name LIKE ?"; 
            let bookname = req.sanitize(req.query['search-box']);
            // include everything before and after the search keyword
            let searchPattren = ['%' + bookname + '%']
            // execute sql query
            db.query(sqlquery, searchPattren, (err, result) => {
                if (err) {
                    return next(err);
                }
                res.render('searchResults.ejs', {availableBooks: result});
            });
        }
});

router.get('/list', function(req, res, next) {
    // query database to get all the books
    let sqlquery = "SELECT * FROM books"; 
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err)
        }
        res.render('list.ejs', {availableBooks: result})
    });
});

router.get('/add-book', redirectLogin, function (req, res, next) {
    res.render('addbook.ejs');
});

router.post('/bookadded', 
    [
    check('bookname').isLength({ min: 1, max: 30 }).isAlpha().withMessage('Book name has to be string, atleast 1 & atmost 30 characters.').trim().escape(), 
    check('price').isLength({ min: 1, max: 5 }).isDecimal().withMessage('Price has to be numeric, atleast 1 & atmost 5 characters').trim().escape()
    ], 
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('addbook', {errors: errors.array()});
            return;
        }
        else { 
            // saving data in database
            let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
            // execute sql query
            let newrecord = [req.sanitize(req.body.bookname), req.sanitize(req.body.price)]
            db.query(sqlquery, newrecord, (err) => {
                if (err) {
                    return next(err)
                }
                else
                    res.send(' This book is added to database, name: '+ req.body.bookname + ' price '+ req.body.price);
            });
        }
}); 

router.get('/bargainbooks', function(req, res, next) {
    // query database to get all the books if their price is less than £20
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err)
        }
        res.render('bargainbooks.ejs', {availableBooks: result})
    });
});


// Export the router object so index.js can access it
module.exports = router
