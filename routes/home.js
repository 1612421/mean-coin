const express = require('express');
const { render } = require('../app');
const { BlockChainStore } = require('../blockchain/blockchain');
const router = express.Router();

// GET /
router.get('/', (req, res) => {
    const error = req.flash('error');
    const top10Blocks = BlockChainStore.getTopLatestBlocks(10);
    console.log(top10Blocks);
    const top10Tractions = BlockChainStore.getTopLatestTransactions(10);

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