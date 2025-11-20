# Berties Books
Sample code for Dynamic Web Applications module.
Uses node.js with Express and EJS.

## To install and run:
- npm install
- node index.js

## dotenv 
- npm install dotenv
- require('dotenv').config() at the top of index.js
- make a new file in project's root directory called '.env' save all the credentials, using descriptive variables such as BB_USER
- use these defined variables in database connection code in index.js as 'process.env.BB_USER' etc
- lastly add the '.env' file in '.gitignore' file so it won't be pushed to remote repo, exposing credentials

## Audit Logging Process
- make a new table in database called audits
- whenever a registered user attempts to login - insert the username, current time, login_status and ip_address into the audits table
- we will store all login attempts and fetch them from the database to show them

## Online Access
https://www.doc.gold.ac.uk/usr/354/
