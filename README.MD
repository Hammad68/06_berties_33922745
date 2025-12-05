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

## Access Control
- userslist page containing the details of the users is only accessible if the user is signed in.
- audit page that has the login audit is only be accessible by the logged in user.
- addbook page for adding more books to the database can only be done by the user after logging in.
- login, register, about, search, bargainbooks can be accessible without logging in.

## Input Validation
- register, search and addbook pages' input feild are validated to check against the acceptable input data format.
- these input feilds include - name, email, username, password for registration. Book name, and price for adding book. And search query term for searching the database.
- based on the input validation check, errors will be displayed on the specific form page where encountered.

## Input Sanitization
- registration, search, and addbook page - input sanitization is used for to prevent the Cross site scripting attack.
- process involves escaping and sanitizing the input from malicious characters and turning it into harmless html codes.
- this also provided security against the sql injection attack where attacker tries to inject sql query tricking the website to reveal database records.

## Weather API - Response - Error Handling
The application handles errors robustly in two main ways:
- **Input Validation**: User-provided city names are validated (must be letters only) and sanitized on the server before the API call is made.

- **API Response Checking**: The application explicitly checks the API's status code (cod). If a city is not found (cod: 404), a user-friendly error message is displayed, preventing the application from crashing. Network errors are captured and handled by the global error middleware.


## Books API - Endpoint Breif
The application exposes a single primary endpoint for retrieving book data.

### Endpoint: `/api/books`
- **Method**: `GET`
- **Description**: Retrieves a list of books from the database. The results can be filtered, searched, and sorted using optional query parameters.

### Query Parameters:
You can combine any of the parameters below in a single request.

| Parameter  | Description                                                                                                                        | Example            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `search`   | Filters books by partial match within the **book name** field.                                                                     | `?search=universe` |
| `minprice` | Sets the **minimum price** in a price range filter (returns books with price ≥ this value). Usually used together with `maxprice`. | `?minprice=10`     |
| `maxprice` | Sets the **maximum price** in a price range filter (returns books with price ≤ this value). Usually used together with `minprice`. | `?maxprice=25`     |
| `sort`     | Sorts the results by `name` or `price`.                                                                                            | `?sort=price`      |


### Usage Examples:

| Description               | Example URL                                                                     |
| ------------------------- | ------------------------------------------------------------------------------- |
| **Get all books**         | `http://localhost:8000/api/books`                                               |
| **Search & Sort**         | `http://localhost:8000/api/books?search=world&sort=name`                        |
| **Filter by Price Range** | `http://localhost:8000/api/books?minprice=5&maxprice=10`                        |
| **Combined Filters**      | `http://localhost:8000/api/books?search=world&minprice=1&maxprice=15&sort=name` |



### Example JSON Response:
A successful request returns a JSON array:

    [
        {
            "id": 1,
            "name": "The Universe A to Z",
            "price": 12.99
        },
        {
            "id": 2,
            "name": "World Atlas 2024",
            "price": 24.50
        }
    ]

## Online Access
https://www.doc.gold.ac.uk/usr/354/
