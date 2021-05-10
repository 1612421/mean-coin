const express = require('express');
const { render } = require('../app');
const router = express.Router();

const { MeanWallet } = require('../blockchain/keypair');

// GET /wallet/generate
router.post('/register', (req, res, next) => {
    const { password } = req.body;

    if (!password) {
        res.status(400);
        return res.json({
            code: 400,
            message: "invalid password"
        });
    }

    const keypair = new MeanWallet(password);
    res.json({ data: keypair.keyObject});
});

// POST /wallet/verify
router.post('/login', (req, res) => {
    const { keyObject1, password1 } = req.body;
    const keypair = new MeanWallet();
    keypair.import(password1, keyObject1);

    return res.json({
        publicKey: keypair.verify()
    });
});




module.exports = router;