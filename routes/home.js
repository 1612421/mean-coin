const express = require('express');
const { render } = require('../app');
const { BlockchainStore } = require('../blockchain/blockchain-store');
const router = express.Router();

// GET /
router.get('/', (req, res) => {
    const error = req.flash('error');
    const top10Blocks = BlockchainStore.getTopLatestBlocks(10);
    const top10Tractions = BlockchainStore.getTopLatestTransactions(10);

    res.render('home', {
        hasError: error.length > 0,
        messages: error,
        hasBlocks: top10Blocks.length > 0,
        top10Blocks,
        hasTransaction: top10Tractions.length > 0,
        top10Tractions
    });
});


module.exports = router;