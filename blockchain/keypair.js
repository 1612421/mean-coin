const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// console.log('Public key is', publicKey);
// console.log('Private key is', privateKey);

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
    }
}