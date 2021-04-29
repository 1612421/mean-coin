const { BlockChain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('05ac911a2b0152840959480e4945e1962987d49e86392b230ca520c513f2d717');
const myWallerAddress = myKey.getPublic('hex'); 

let meanCoin = new BlockChain();

const tx1 = new Transaction(myWallerAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
meanCoin.addTransaction(tx1);

console.log('Starting the miner...');
meanCoin.minePendingTransactions(myWallerAddress); // fake address for demo

console.log('Balance of meaner', meanCoin.getBalanceOfAddress(myWallerAddress));

