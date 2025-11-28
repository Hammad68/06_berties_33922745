// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/register', function (req, res, next) {
    res.render('register.ejs', {
    errors: [],
    formData: {}
    });
})

router.post('/registered', 
    [
    check('email').isEmail().normalizeEmail().withMessage('Please add a valid email.').trim().escape(), 
    check('username').isLength({ min: 5, max: 20}).isAlphanumeric().withMessage('Username can only contain letters and numbers.').trim().escape(), 
    check('password').isLength({min: 8}).withMessage('Password needs to be at least 8 character long.').trim().escape(), 
    check('first').isLength({max: 20}).isAlpha().withMessage('First name has to be string and less than 20 characters.').trim().escape(),
    check('last').isLength({max: 20}).isAlpha().withMessage('Last name has to be string and less than 20 characters.').trim().escape()
    ], 
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('./register', {errors: errors.array(), formData : req.body});
            return;
        }
        else { 
            const saltRounds = 10;
            const plainPassword = req.sanitize(req.body.password);
            const username = req.sanitize(req.body.username);
            const firstname = req.sanitize(req.body.first);
            const lastname = req.sanitize(req.body.last);
            const email = req.sanitize(req.body.email);

            // Check if the username or email already exists
            let userExists = "SELECT username, email FROM users WHERE username = ? OR email = ?"
            db.query(userExists, [username, email], (err, result) => {
                if(err){
                    return next(err);
                }

                // If a record exists, return a specific error
                if(result.length > 0){
                    let errMessage = "This username or email already exists";
                    if(result[0].username === username) errMessage = "User with this username already exists. ";
                    if(result[0].email === email) errMessage += "User with this email already exists";
                    return res.status(401).send(errMessage);
                }

                // Insert new user after hashing password
                let sqlquery = 'INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)'

                bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                    if (err) return next(err);

                    db.query(sqlquery, [firstname, lastname, username, email, hashedPassword], (err) => {
                        if (err) return next(err);

                        // Simple confirmation response
                        let result = 'Hello '+ firstname + ' '+ lastname +' you are now registered!  We will send an email to you at ' + email
                        result += ' Your password is: '+ plainPassword +' and your hashed password is: '+ hashedPassword
                        res.send(result);
                    });
                });
            });
        }
});

// List all registered users (no passwords shown)
router.get('/list', redirectLogin, function (req, res, next) {
    let sqlquery = "SELECT firstname, lastname, username, email FROM users";
    
    db.query(sqlquery, (err, result) => {
        if (err) return next(err);
        res.render('userslist.ejs', {registeredUsers: result})
    });
})

router.get('/login', function (req, res, next) {
    res.render('userslogin.ejs')
})

router.post('/loggedin', 
    [
    check('username').isLength({ min: 1, max: 20 }).isAlphanumeric().withMessage('Username can only contain letters and numbers. Atleast 1 and atmost 20 characters.').trim().escape(), // Sanitize input immediately
    check('password').isLength({ min: 1 }).withMessage('Password cannot be empty.').trim().escape() // Sanitize input immediately
    ],
    function (req, res, next) {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('userslogin', {errors: errors.array(), formData: req.body})
        return;
    }
    else {
        const plainPassword = req.sanitize(req.body.password);
        const username = req.sanitize(req.body.username);
        const ipAddress = req.ip;
        // Save user session here, when login is successful
        req.session.userId = req.body.username;


        // Fetch hashed password for that username
        let sqlquery = 'SELECT username, password FROM users WHERE username = ?'

        db.query(sqlquery, [username], (err, result) => {

            if(err){
                return next(err);
            }

            // User not found
            if(result.length === 0){
                return res.status(401).send('User not found');
            }

            const user = result[0];
            const passwordFromDB = user.password;

            // Compare plain password with hashed password
            bcrypt.compare(plainPassword, passwordFromDB, function(err, isMatch) {

                if (err){
                    return next(err);
                }

                // Password correct
                if(isMatch){
                    auditlogin(username, true, ipAddress);
                    res.status(200).send('Login Successful... <a href='+'/'+'>Home</a>')
                }
                else {
                    // Incorrect password
                    auditlogin(username, false, ipAddress);
                    res.status(401).send('Invalid username or password... <a href='+'login'+'>Home</a>')
                }
            });
        });      
    };
});

// Display login audit history
router.get('/audit', redirectLogin, function (req, res, next) {
    let sqlquery = "SELECT * FROM audits ORDER BY login_time DESC"; 
    
    db.query(sqlquery, (err, result) => {
        if (err) return next(err);
        res.render('audit.ejs', { auditHistory: result });
    });
});

// Insert login attempt into audit table
function auditlogin(username, success, ipAddress){
    const auditQuery = "INSERT INTO audits (username, success, ip_address) VALUES (?, ?, ?)";
    global.db.query(auditQuery, [username, success, ipAddress], (err) => {
        if(err) console.log(err);
    });
}

// Export router to be used in index.js
module.exports = router