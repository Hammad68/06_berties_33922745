// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
    const saltRounds = 10;
    const plainPassword = req.body.password;
    const username = req.body.username;
    const firstname = req.body.first;
    const lastname = req.body.last;
    const email = req.body.email;

    // Check if the username or email already exists
    let userExists = "SELECT username, email FROM users WHERE username = ? OR email = ?"
    db.query(userExists, [username, email], (err, result) => {
        if(err){
            return next(err);
        }

        // If a record exists, return a specific error
        if(result.length > 0){
            let errMessage = "This username or email already exists";
            if(result[0].username === username) errMessage = "User with this username already exists";
            if(result[0].email === email) errMessage = "User with this email already exists";
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
});

// List all registered users (no passwords shown)
router.get('/list', function (req, res, next) {
    let sqlquery = "SELECT firstname, lastname, username, email FROM users";
    
    db.query(sqlquery, (err, result) => {
        if (err) return next(err);
        res.render('userslist.ejs', {registeredUsers: result})
    });
})

router.get('/login', function (req, res, next) {
    res.render('userslogin.ejs')
})

router.post('/loggedin', function (req, res, next) {
    const plainPassword = req.body.password;
    const username = req.body.username;
    const ipAddress = req.ip;

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
                res.status(200).send('Login Successful...')
            }
            else {
                // Incorrect password
                auditlogin(username, false, ipAddress);
                res.status(401).send('Invalid username or password')
            }
        });
    });
})

// Display login audit history
router.get('/audit', function (req, res, next) {
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