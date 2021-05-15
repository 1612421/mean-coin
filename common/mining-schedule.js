const cron = require('node-cron');
const miningWorker = require('../blockchain/worker-mining');
const { BlockchainStore } = require('../blockchain/blockchain-store');
const { Transaction } = require('../blockchain/blockchain');
const APP_CONFIG = require('../config/constant');
const { sendTransactionToClientRoom, broadcastNewMinedBlock } = require('../blockchain/networkMaster');
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
        
        let newMinedBlock = null;

        try {
            BlockchainStore.pendingTransactions = [];
            newMinedBlock = await miningWorker.runWorker(miningData);
            newMinedBlock.index = BlockchainStore.chain.length;

            if (BlockchainStore.isNewBlockValid(newMinedBlock)) {
                BlockchainStore.chain.push(newMinedBlock);
            } else {
                throw new Error('block is valid');
            }

            await broadcastNewMinedBlock(newMinedBlock);
        } catch (err) {
            console.log(err);
            newMinedBlock = null;
            BlockchainStore.pendingTransactions.push(miningData.transactions);
        } finally {
            BlockchainStore.isMining = false;
        }

        if (newMinedBlock) {
            sendTransactionToClientRoom(newMinedBlock.timestamp,  newMinedBlock.transactions);
            
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