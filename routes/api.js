// Create a new router
const express = require("express")
const router = express.Router()

router.get('/books', function (req, res, next) {

    // Query database to get all the books - Base Query
    let sqlquery = "SELECT * FROM books"
    // Query parameters & whereClauses - Building Dynamic Query
    let queryParams = [];
    let whereClauses = [];

    // --- Task 3 ---- Seacrhing
    const searchTerm = req.query.search;
    if(searchTerm){
        whereClauses.push("name LIKE ?");
        queryParams.push(`%${searchTerm}%`);
    }
     
    // --- Task 4 --- Price Range
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    if(minPrice && maxPrice){
        whereClauses.push("price BETWEEN ? AND ?");
        queryParams.push(minPrice, maxPrice);
    }


    // --- Helping Code For Task 3 & 4 --- Combining all the whereClauses if any filter is applied
    if(whereClauses.length > 0){
        sqlquery += ' WHERE ' + whereClauses.join(' AND ');
    }

    // --- Task 5 --- Sorting
    const sorting = req.query.sort;
    if(sorting === 'name'){
        sqlquery += ' ORDER BY name ASC';
    } else if (sorting === 'price'){
        sqlquery += ' ORDER BY price ASC';
    }


    // Execute the sql query
    db.query(sqlquery, queryParams, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err)
            next(err)
        }
        else {
            res.json(result)
        }
    })
})

// Export the router object so index.js can access it
module.exports = router