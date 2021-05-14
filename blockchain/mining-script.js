const { BlockChain, Block, Transaction } = require('./blockchain');
const { workerData, parentPort } = require('worker_threads');
const APP_CONFIG = require('../config/constant');

function mineBlock(data) {
    const { index, transactions, miningRewardAddress, preHash, miningReward, difficulty } = data;
    if (transactions.length === 0) {
        return;
    }

    // create transaction reward for miner
    const rewardTx = new Transaction(APP_CONFIG.meanMasterWalletAddress, miningRewardAddress, miningReward, 'Mine reward');
    transactions.push(rewardTx);


    const block = new Block(index, transactions, miningRewardAddress, preHash);
    block.reward = miningReward;
    block.mineBlock(difficulty);
    console.log('Block successfully mined!');
    
    return block;
}

const block = mineBlock(workerData);
parentPort.postMessage(block);
