const socketIo= require('socket.io');
const { v4: uuid } = require('uuid');
const { BlockchainStore } = require('../blockchain/blockchain-store');
const { eventEmitter } = require('../common/events');

const eventConstants = {
    sendTransaction: 'TRANSACTION',
    minedBlock: 'MINED_BLOCK',
    invalidBlock: 'INVALID_BLOCK',
    clientRoom: 'client',
    nodeRoom: 'node'
}

const nodeNumber = {};

async function createSocketListener (server) {
    io = socketIo(server);

    io.on('connection', (socket) => {
        socket.on('client', () => {
            socket.join(eventConstants.clientRoom);
        });

        socket.on('node', () => {
            socket.join(eventConstants.nodeRoom);
            socket.room = eventConstants.nodeRoom;

            if (nodeNumber[eventConstants.nodeRoom] == undefined) {
                nodeNumber[socket.room] = 1;
            } else {
                nodeNumber[socket.room]++;
            }
        });

        socket.on(eventConstants.newMinedBlock, (data) => {
            if (BlockchainStore.isNewBlockValid(data.newMinedBlock)) {
                BlockchainStore.chain.push(data.newMinedBlock);
                eventEmitter.emit(data.id, { code: 200, message: 'block is valid'});
            } else {
                eventEmitter.emit(data.id, { code: 500, message: 'block is invalid'});
            }
        });

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

async function broadcastNewMinedBlock(newMinedBlock) {
    return new Promise((resolve, reject) => {
        
        try {
            const id = uuid();
            io.to(eventConstants.nodeRoom).emit(eventConstants.minedBlock, {
                newMinedBlock,
                id
            });

            if (nodeNumber[eventConstants.nodeRoom] && nodeNumber[eventConstants.nodeRoom] > 0) {
                eventEmitter.on(id, (data) => {
                    eventEmitter.removeAllListeners(id)

                    if (data.code !== 200) {
                        reject(new Error(data.message));
                    }

                    resolve(true);
                });

                setTimeout(() => {
                    eventEmitter.removeAllListeners(id);
                    resolve(true)
                }, 30000);
            } else {
                resolve(true);
            }

        } catch (err) {
            reject(err);
        }
    });
}


module.exports = {
    createSocketListener,
    sendTransactionToClientRoom,
    broadcastNewMinedBlock,
    eventConstants
}