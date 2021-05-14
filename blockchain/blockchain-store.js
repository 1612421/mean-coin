const { BlockChain } = require('./blockchain');

const difficulty = process.env.DIFFICULTY ? parseInt(process.env.DIFFICULTY) : 2;
const initAmountCoin = process.env.INIT_COIN ? parseInt(process.env.INIT_COIN) : 100000000000;
const BlockchainStore = new BlockChain(difficulty, initAmountCoin);
console.log(JSON.stringify(BlockchainStore));

module.exports = { BlockchainStore };