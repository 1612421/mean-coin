const socketIo= require('socket.io');
const { v4: uuid } = require('uuid');
const { Data } = require('../blockchain/blockchain-store');
const { sendNewMinedBlockToMasterNoWait, connectToNode } = require('./networkClient');
const { eventEmitter } = require('../common/events');

const eventConstants = {
    sendTransaction: 'TRANSACTION',
    sendNewBlockToClientRoom: 'BLOCK',
    newMinedBlock: 'NEW_MINED_BLOCK',
    clientRoom: 'client',
    nodeRoom: 'node',
    syncBlockchain: 'SYNC_BLOCKCHAIN',
    responseBlock: 'RESPONSE_BLOCK'
}

const nodeNumber = {};

async function createSocketListener (server) {
    io = socketIo(server);

    io.on('connection', (socket) => {
        socket.on('client', () => {
            socket.join(eventConstants.clientRoom);
        });

        socket.on('node', () => {
            try {
                socket.join(eventConstants.nodeRoom);
                socket.room = eventConstants.nodeRoom;

                if (nodeNumber[eventConstants.nodeRoom] == undefined) {
                    nodeNumber[socket.room] = 1;
                } else {
                    nodeNumber[socket.room]++;
                }

                console.log('has new node connected');
            } catch (error) {
                console.log(error);
            }
        });

        // receive a new mined block from node client
        socket.on(eventConstants.newMinedBlock, (data) => {
            if (Data.BlockchainStore.isNewBlockValid(data.newMinedBlock)) {
                // continue send this block to all connected node except sender
                socket.broadcast.to(eventConstants.nodeRoom).emit(eventConstants.newMinedBlock, data);

                // continue send this block to master
                sendNewMinedBlockToMasterNoWait(data.newMinedBlock);

                // send response block is valid to sender
                socket.emit(eventConstants.responseBlock , { id: data.id, code: 200, message: 'block is valid' });

                Data.BlockchainStore.chain.push(data.newMinedBlock);
                sendNewBlockToClientRoom(data.newMinedBlock);
            } else {
                // send response block is invalid to sender
                socket.emit(eventConstants.responseBlock , { id: data.id, code: 500, message: 'block is invalid' });
            }
        });

        socket.on(eventConstants.responseBlock, (data) => {
           eventEmitter.emit(data.id, data); 
        });


        socket.on(eventConstants.syncBlockchain, (data) => {
            socket.emit(data.id, Data.BlockchainStore);
        })

        socket.on('disconnect', () => {
            nodeNumber[socket.room]--;
        });
    });


}

function sendTransactionToClientRoom(timestamp, transactions) {
    io.to(eventConstants.clientRoom).emit(eventConstants.sendTransaction, {
        timestamp, transactions
    })
}

function sendNewBlockToClientRoom(newBlock) {
    io.to(eventConstants.clientRoom).emit(eventConstants.sendNewBlockToClientRoom, newBlock);
}

async function broadcastNewMinedBlock(newMinedBlock) {
    return new Promise((resolve, reject) => {
        try {
            if (!(nodeNumber[eventConstants.nodeRoom] && nodeNumber[eventConstants.nodeRoom] > 0)) {
                resolve(true);
            }

            const id = uuid();
            io.to(eventConstants.nodeRoom).emit(eventConstants.newMinedBlock, {
                newMinedBlock,
                id
            });

            eventEmitter.once(id, (data) => {

                if (+data.code !== 200) {
                    console.log(data.code, typeof(data.code));
                    reject(new Error(data.message));
                }

                resolve(true);
            });

            setTimeout(() => {
                eventEmitter.removeAllListeners(id);
                resolve(true)
            }, 30000);

        } catch (err) {
            reject(err);
        }
    });
}

function broadcastNewMinedBlockNoWait(newMinedBlock) {
    const id = uuid();
    io.to(eventConstants.nodeRoom).emit(eventConstants.newMinedBlock, {
        newMinedBlock,
        id
    });
}

module.exports = {
    sendNewBlockToClientRoom,
    createSocketListener,
    sendTransactionToClientRoom,
    broadcastNewMinedBlock,
    eventConstants,
    broadcastNewMinedBlockNoWait
}