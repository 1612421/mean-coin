const express = require('express');
const { render } = require('../app');
const router = express.Router();

// GET /
router.get('/', (req, res) => {
    const error = req.flash('error');
    console.log(error.length > 0);
    res.render('home', {
        hasError: error.length > 0,
        messages: error
    });
});


module.exports = router;