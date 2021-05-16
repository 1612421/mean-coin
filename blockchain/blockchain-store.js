const { BlockChain, Block, Transaction } = require('./blockchain');

const Data = { 
    BlockchainStore: null
}


function initBlockchain() {
    const difficulty = process.env.DIFFICULTY ? parseInt(process.env.DIFFICULTY) : 2;
    const initAmountCoin = process.env.INIT_COIN ? parseInt(process.env.INIT_COIN) : 100000000000;
    Data.BlockchainStore = new BlockChain(difficulty);
    Data.BlockchainStore.createGenesisBlock(initAmountCoin);
}

function importBlockchain(dataImport) {
    Data.BlockchainStore = new BlockChain(dataImport.difficulty);
    Data.BlockchainStore.miningReward = dataImport.miningReward; 

    for (const block of dataImport.chain) {
        const transactions = [];

        for (const transaction of block.transactions) {
            const transactionObject = new Transaction(transaction.fromAddress, transaction.toAddress, transaction.amount, transaction.method);
            transactionObject.salt = transaction.salt;
            transactionObject.hash = transaction.hash;
            transactionObject.signature = transaction.signature;
            transactions.push(transactionObject);
        }

        const blockObject = new Block(block.index, transactions, block.miner, block.previousHash);
        blockObject.timestamp = block.timestamp;
        blockObject.hash = block.hash;
        blockObject.nonce = block.nonce;
        blockObject.reward = block.reward;

        Data.BlockchainStore.chain.push(blockObject);
    }
}


module.exports = { Data, initBlockchain, importBlockchain };