const express = require('express');
const { render } = require('../app');
const router = express.Router();
const multer = require('../config/multer-memory');
const { MeanWallet } = require('../blockchain/keypair');
const isAccessWallet = require('../middleware/check-auth');
const { BlockChainStore } = require('../blockchain/blockchain');
const Wallet = require('ethereumjs-wallet').default;

router.get('/', isAccessWallet, (req, res) => {
    const messages = req.flash('error');
    const address = req.session.wallet.address;
    const detail = BlockChainStore.getDetailOfAddress(address);

    res.render('wallet', {
        address,
        balance: detail.balance,
        hasTransaction: detail.transactions.length > 0,
        transactions: detail.transactions,
        hasError: messages.length > 0,
        messages
    });
});

// GET /wallet/generate
router.post('/create', (req, res, next) => {
    const { password } = req.body;

    if (!password) {
        res.status(400);
        return res.json({
            code: 400,
            message: "invalid password"
        });
    }

    const wallet = new MeanWallet(password);
    const dateString = (new Date()).toUTCString().replace(/, |:| /g, '-');
    res.writeHead(200, { 'Content-Type': 'application/force-download', 'Content-disposition': `attachment; filename=keystore-${dateString}.txt` });
    res.end(JSON.stringify(wallet.keyObject));
});

// POST /wallet/verify
router.post('/verify', multer.single('keyObject'), (req, res) => {
    let keyObject = null;
    let wallet = null;

    try {
        keyObject = JSON.parse(req.file.buffer.toString());
    } catch {
        req.flash('error', 'keystore file is invalid');
        return res.redirect('/');
    }

    try {
        const { password } = req.body;
        wallet = new MeanWallet();
        wallet.import(password, keyObject);
    } catch {
        req.flash('error', 'password is incorrect');
        return res.redirect('/');
    }

    req.session.wallet = wallet;
    res.redirect('/wallet');
});

// GET /wallet/exit
router.get('/exit', (req, res) => {
    req.session.wallet = null;
    res.redirect('/');
});


// POST /wallet/buy
router.post('/buy', isAccessWallet, (req, res) => {
    const { amount } = req.body;

    if (amount <= 0) {
        res.status(400);

        return res.json({
            code: 400,
            message: 'Invalid amount'
        });
    }

    const tx = BlockChainStore.createBuyTransaction(req.session.wallet.address, amount);
    const miner_address = process.env.MINER_ADDRESS;
    BlockChainStore.addTransaction(tx);
    BlockChainStore.minePendingTransactions(miner_address);

    res.redirect('/wallet');
});

// POST /wallet/buy
router.post('/send', isAccessWallet, (req, res) => {
    const { amount, address } = req.body;

    if (amount <= 0) {
        res.status(400);

        return res.json({
            code: 400,
            message: 'Invalid amount'
        });
    }
    
    try {
        const privateKey = Buffer.from(req.session.wallet.privateKey);
        const wallet = Wallet.fromPrivateKey(privateKey);
        const tx = BlockChainStore.createTransaction(wallet, address, amount, 'Transfer');
        const miner_address = process.env.MINER_ADDRESS;
        BlockChainStore.addTransaction(tx);
        BlockChainStore.minePendingTransactions(miner_address);
    } catch (e) {
        req.flash('error', e.message);
    }

    res.redirect('/wallet');
});

module.exports = router;