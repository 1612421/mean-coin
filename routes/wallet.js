const express = require('express');
const { render } = require('../app');
const router = express.Router();
const multer = require('../config/multer-memory');
const { MeanWallet } = require('../blockchain/keypair');
const isAccessWallet = require('../middleware/check-auth');
const { BlockChainStore } = require('../blockchain/blockchain');

router.get('/', isAccessWallet, (req, res) => {
    const address = req.session.wallet.address;
    let detail = BlockChainStore.getDetailOfAddress(address);
    detail.transactions = [
        {
            hash: 'test123',
            method: 'Transfer',
            timestamp: +(new Date()),
            fromAddress: address,
            toAddress: '123123',
            amount: 100
        }
    ]

    res.render('wallet', {
        address,
        balance: detail.balance,
        hasTransaction: detail.transactions.length > 0,
        transactions: detail.transactions
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

module.exports = router;