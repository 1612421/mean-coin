const cron = require('node-cron');
const miningWorker = require('../blockchain/worker-mining');
const { Data } = require('../blockchain/blockchain-store');
const { Transaction } = require('../blockchain/blockchain');
const APP_CONFIG = require('../config/constant');
const { broadcastNewMinedBlock, sendNewBlockToClientRoom } = require('../blockchain/networkMaster');
const { sendNewMinedBlockToMaster } = require('../blockchain/networkClient');
var job = null;

function startMineBlockSchedule() {
    job = cron.schedule('*/2 * * * * *', async () => {
        if (Data.BlockchainStore.isMining || Data.BlockchainStore.pendingTransactions.length === 0) {
            return;
        }

        Data.BlockchainStore.isMining = true;
        const miningData = {
            transactions: Data.BlockchainStore.pendingTransactions,
            index: Data.BlockchainStore.chain.length,
            miningRewardAddress: process.env.MINER_ADDRESS,
            preHash: Data.BlockchainStore.getLatestBlock().hash,
            miningReward: Data.BlockchainStore.miningReward,
            difficulty: Data.BlockchainStore.difficulty
        };

        try {
            Data.BlockchainStore.pendingTransactions = [];
            const newMinedBlock = await miningWorker.runWorker(miningData);
            newMinedBlock.index = Data.BlockchainStore.chain.length;

            await Promise.all([
                broadcastNewMinedBlock(newMinedBlock),
                sendNewMinedBlockToMaster(newMinedBlock)
            ]);

            Data.BlockchainStore.chain.push(newMinedBlock);
            sendNewBlockToClientRoom(newMinedBlock);
        } catch (err) {
            console.log(err);
            Data.BlockchainStore.pendingTransactions.push(...miningData.transactions);
        } finally {
            Data.BlockchainStore.isMining = false;
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