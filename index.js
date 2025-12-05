// Import express and ejs
require('dotenv').config()
var session = require('express-session')
var express = require ('express')
var ejs = require('ejs')
const path = require('path')
var mysql = require('mysql2')

// Create the express application object
const app = express()
const port = 8000
const expressSanitizer = require('express-sanitizer');

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

// Define our application-specific data
app.locals.shopData = {shopName: "Bertie's Books"}

// Define the database connection pool
const db = mysql.createPool({
    host: process.env.BB_HOST,
    user: process.env.BB_USER,
    password: process.env.BB_PASSWORD,
    database: process.env.BB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}))

// Create an input sanitizer
app.use(expressSanitizer());

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /books
const booksRoutes = require('./routes/books')
app.use('/books', booksRoutes)

// Load the route handlers for /weather
const weatherRoutes = require('./routes/weather')
app.use('/weather', weatherRoutes)

// Load the route handlers for /api
const apiRoutes = require('./routes/api')
app.use('/api', apiRoutes)

// Start the web app listening
const host = "0.0.0.0";
app.listen(port, host, () => console.log(`Example app listening on port http://${host}:${port}/`));