const cron = require('node-cron');
const miningWorker = require('../blockchain/worker-mining');
const { BlockchainStore } = require('../blockchain/blockchain-store');
const { Transaction } = require('../blockchain/blockchain');
const APP_CONFIG = require('../config/constant');
var job = null;

function startMineBlockSchedule() {
    job = cron.schedule('*/2 * * * * *', async () => {
        if (BlockchainStore.isMining || BlockchainStore.pendingTransactions.length === 0) {
            return;
        }

        BlockchainStore.isMining = true;
        const miningData = {
            transactions: BlockchainStore.pendingTransactions,
            index: BlockchainStore.chain.length,
            miningRewardAddress: process.env.MINER_ADDRESS,
            preHash: BlockchainStore.getLatestBlock().hash,
            miningReward: BlockchainStore.miningReward,
            difficulty: BlockchainStore.difficulty
        };

        try {
            BlockchainStore.pendingTransactions = [];
            const newMinedBlock = await miningWorker.runWorker(miningData);
            newMinedBlock.index = BlockchainStore.chain.length;
            BlockchainStore.chain.push(newMinedBlock);
        } catch (err) {
            console.log(err);
            BlockchainStore.pendingTransactions.push(miningData.transactions);
        } finally {
            BlockchainStore.isMining = false;
        }
    });
}

function stopMiningBlockSchedule() {
    job.destroy();
}

const MiningSchedule = {
    startMineBlockSchedule,
    stopMiningBlockSchedule
}

module.exports = MiningSchedule;