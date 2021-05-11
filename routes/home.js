const express = require('express');
const { render } = require('../app');
const router = express.Router();

// GET /
router.get('/', (req, res) => {
    const error = req.flash('error');

    res.render('home', {
        hasError: error.length > 0,
        messages: error
    });
});


module.exports = router;