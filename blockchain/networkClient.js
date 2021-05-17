const io = require('socket.io-client');
const { v4: uuid} = require('uuid');
//const { broadcastNewMinedBlockNoWait,sendNewBlockToClientRoom } = require('./networkMaster');
const { importBlockchain, Data } = require('./blockchain-store');
const { eventEmitter } = require('../common/events');
var ready = false;

var socket = null;

const eventConstants = {
    syncBlockchain: 'SYNC_BLOCKCHAIN',
    joinNodeRoom: 'node',
    newMinedBlock: 'NEW_MINED_BLOCK',
    responseBlock: 'RESPONSE_BLOCK'
}

function connectToNode(targetUrl) {
    socket =  io(targetUrl);

    socket.on('connect', async () => {
        try {
            console.log('connected to network blockchain');
            if (!ready) {
                await syncBlockchainAsync();
            }
            
            ready = true;
            socket.emit(eventConstants.joinNodeRoom);
        } catch (err) {
            console.log(err);
            process.exit(0);
        }
    });

    // receive a new mined block from node master
    socket.on(eventConstants.newMinedBlock, (data) => {
        if (Data.BlockchainStore.isNewBlockValid(data.newMinedBlock)) {
            console.log('receive valid mined block');

            // continue send this block to all connected node except sender
            broadcastNewMinedBlockNoWait(data.newMinedBlock);

            // send response block is valid to sender
            socket.emit(eventConstants.responseBlock , { id: data.id, code: 200, message: 'block is valid' });

            Data.BlockchainStore.chain.push(data.newMinedBlock);
            sendNewBlockToClientRoom(data.newMinedBlock);
        } else {
            console.log('receive invalid mined block');

            // send response block is invalid to sender
            socket.emit(eventConstants.responseBlock , { id: data.id, code: 500, message: 'block is invalid' });
        }
    });

    socket.on(eventConstants.responseBlock, (data) => {
        eventEmitter.emit(data.id, data); 
     });
}

function syncBlockchainAsync() {
    return new Promise((resolve, reject) => {
        try {
            const id = uuid();
            socket.emit(eventConstants.syncBlockchain, { id });
            console.log('wait for syncing blockchain ...')

            socket.on(id, (blockchain) => {
                try {
                    importBlockchain(blockchain);
                    console.log('sync blockchain successful');
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            });

        } catch (err) {
            reject(err);
        }
    });
}

function sendNewMinedBlockToMasterNoWait(block) {
    if (socket) {
        socket.emit(eventConstants.newMinedBlock, { id: 'no need', newMinedBlock: block});
    }
} 

function sendNewMinedBlockToMaster(block) {
    return new Promise((resolve, reject) => {
        try {
            if (!socket) {
                resolve(true);
            }

            const id = uuid();
            socket.emit(eventConstants.newMinedBlock, {
                newMinedBlock: block,
                id
            });

            eventEmitter.once(id, (data) => {
                if (+data.code !== 200) {
                    reject(new Error(data.message));
                }

                resolve(true);
            });

            setTimeout(() => {
                eventEmitter.removeAllListeners(id);
                resolve(true)
            }, 3000);

        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    connectToNode,
    syncBlockchainAsync,
    sendNewMinedBlockToMaster,
    sendNewMinedBlockToMasterNoWait
}

const { broadcastNewMinedBlockNoWait,sendNewBlockToClientRoom } = require('./networkMaster');