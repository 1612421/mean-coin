const express = require('express');
const { render, off } = require('../app');
const router = express.Router();
const multer = require('../config/multer-memory');
const { MeanWallet } = require('../blockchain/keypair');
const isAccessWallet = require('../middleware/check-auth');
const { BlockchainStore } = require('../blockchain/blockchain-store');
const Wallet = require('ethereumjs-wallet').default;

// GET /blocks
router.get('/blocks/:offset', (req, res) => {
    if (isNaN(req.params.offset)) {
        req.flash('error', 'Page is not found');
        return res.redirect('/');
    }

    const offset = +req.params.offset;
    const blocks = BlockchainStore.getBlockPagination(offset, 25);

    res.render('list_block', {
        hasBlock: blocks.blocks.length > 0,
        ...blocks,
        next: offset + 1,
        pre: offset - 1,
        offset
    });
});



// GET /block/:blockHash
router.get('/block/:blockHash', (req, res) => {
    const block = BlockchainStore.findBlock(req.params.blockHash);

    if (!block) {
        req.flash('error', 'Page is not found');
        return res.redirect('/');
    }

    res.render('single_block', {
        block
    });
});


// GET /transactions:offset 
router.get('/transactions/:offset', (req, res) => {
    if (isNaN(req.params.offset)) {
        req.flash('error', 'Page is not found');
        return res.redirect('/');
    }

    const offset = +req.params.offset;
    const limit = 25;
    let isHavePre = false;
    let isHaveNext= false;

    let transactions = BlockchainStore.getTopLatestTransactions(10000);
    const maxAmount = transactions.length;
    const maxOffset = Math.ceil(maxAmount / limit);

    if (offset < maxOffset) {
        isHaveNext = true;
    }

    if (offset > 1) {
        isHavePre = 1;
    }

    if (offset <= 0|| maxOffset < offset) {
        transactions = [];
    } else if (maxOffset === offset) {
        transactions = transactions.slice(0, limit);
    } else {
        transactions = transactions.slice(maxAmount - offset * limit, maxAmount - offset * limit + limit);
    }

    res.render('list_transaction', {
        hasTransaction: transactions.length > 0,
        transactions,
        isHaveNext,
        isHavePre,
        next: offset + 1,
        pre: offset - 1,
        maxOffset,
        offset
    });
});


// GET /address/:address
router.get('/address/:address', (req, res) => {
    const messages = req.flash('error');
    const address = req.params.address;
    const detail = BlockchainStore.getDetailOfAddress(address);

    if (detail.balance === 0 && detail.transactions.length === 0) {
        req.flash('error', 'Page is not found');
        return res.redirect('/');
    }

    res.render('single_address', {
        address,
        balance: detail.balance,
        hasTransaction: detail.transactions.length > 0,
        transactions: detail.transactions.reverse(),
        hasError: messages.length > 0,
        messages
    });
});

// GET /txns/:blockHash
router.get('/txns/:blockHash', (req, res) => {
    const block = BlockchainStore.findBlock(req.params.blockHash);

    if (!block) {
        req.flash('error', 'Page is not found');
        return res.redirect('/');
    }

    res.render('txns', {
        blockHash: block.hash,
        transactions: block.transactions,
        hasTransaction: block.transactions.length > 0
    });
});

// GET /tx/:transactionHash
router.get('/tx/:transactionHash', (req, res) => {
    const transaction = BlockchainStore.findTransaction(req.params.transactionHash);

    if (!transaction) {
        req.flash('error', 'Page is not found');
        return res.redirect('/');
    }

    res.render('single_tx', {
        ...transaction
    });
});

module.exports = router;