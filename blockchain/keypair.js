const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const keythereum = require('keythereum');
const Wallet = require('ethereumjs-wallet').default;
const EthUtil = require('ethereumjs-util');
const SHA256 = require('crypto-js/sha256');

// console.log('Public key is', publicKey);
// console.log('Private key is', privateKey);


class MeanWallet {
    constructor(password = null) {
        if (password != null) {
            const dk = keythereum.create({ keyBytes: 32, ivBytes: 16 });

            // Note: if options is unspecified, the values in keythereum.constants are used.
            const options = {
                kdf: "pbkdf2",
                cipher: "aes-128-ctr",
                kdfparams: {
                    c: 262144,
                    dklen: 32,
                    prf: "hmac-sha256"
                }
            };

            this.privateKey = dk.privateKey;
            this.keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);
        }
    }

    import(password, keyObject) {
        this.keyObject = keyObject;
        this.privateKey = keythereum.recover(password, keyObject);
        const wallet = Wallet.fromPrivateKey(this.privateKey);
        this.publicKey = wallet.getPublicKeyString();
        this.address = wallet.getAddressString();
    }
}


module.exports = {
    generateKey: () => {
        const key = ec.genKeyPair();
        return {
            publicKey: key.getPublic('hex'),
            privateKey: key.getPrivate('hex')
        }
    },

    getPublicFromPrivateKey: (privateKey) => {
        return ec.keyFromPrivate(privateKey).getPublic();
    },

    MeanWallet
}