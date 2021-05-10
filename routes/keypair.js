const express = require('express');
const { render } = require('../app');
const router = express.Router();
const multer = require('../config/multer-memory');
const { MeanWallet } = require('../blockchain/keypair');

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

    const keypair = new MeanWallet(password);
    const dateString = (new Date()).toUTCString().replace(/, |:| /g, '-');
    res.writeHead(200, { 'Content-Type': 'application/force-download', 'Content-disposition': `attachment; filename=keystore-${dateString}.txt` });
    res.end(JSON.stringify(keypair.keyObject));
});

// POST /wallet/verify
router.post('/verify', multer.single('keyObject'), (req, res) => {
    let keyObject = null;
    let keypair = null;

    try {
        keyObject = JSON.parse(req.file.buffer.toString());
    } catch {
        req.flash('error', 'keystore file is invalid');
        return res.redirect('/');
    }

    try {
        const { password } = req.body;
        keypair = new MeanWallet();
        keypair.import(password, keyObject);
    } catch {
        req.flash('error', 'password is incorrect');
        return res.redirect('/');
    }

    return res.json({
        publicKey: keypair.verify()
    });
});

module.exports = router;