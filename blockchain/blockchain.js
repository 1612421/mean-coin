const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const EthUtil = require('ethereumjs-util');
const Wallet = require('ethereumjs-wallet').default;

class Transaction {
    constructor(fromAddress, toAddress, amount, method = 'transfer') {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.method = method;
        this.hash = this.calculateHash().toString('hex');
    }

    calculateHash() {
        const tx  = Buffer.from(SHA256(this.fromAddress + this.toAddress + this.amount + this.method).toString());
        return EthUtil.hashPersonalMessage(tx);
    }

    signTransaction(wallet) {
        if (wallet.getAddressString() !== this.fromAddress) {
            throw new Error("You cannot sign transactions for other wallets");
        }

        const hashTx = this.calculateHash();
        const sig = EthUtil.ecsign(hashTx, wallet.getPrivateKey());
        this.signature = EthUtil.toRpcSig(sig.v, sig.r, sig.s);
    }

    isValid() {
        try {
            if (this.fromAddress === 'MeanMasterWallet') {
                return true;
            }
    
            if (!this.signature || this.signature.length === 0) {
                throw new Error('No signature in this transaction');
            }
            
            const hashTx = this.calculateHash();
            const sig = EthUtil.fromRpcSig(this.signature);
            const publicKey = EthUtil.ecrecover(hashTx, sig.v, sig.r, sig.s);
            const address = Wallet.fromPublicKey(publicKey).getAddressString();
    
            return this.fromAddress === address;
        } catch {
            return false;
        }
        
    }
}

class Block {
    constructor(index, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = Date.now();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mine: " + this.hash);
    }

    hasValidTransaction() {
        for(const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
 
        return true;
    }
}

class BlockChain {
    constructor() {
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100; // 100 USD 
        this.chain = [this.createGenesisBlock()];
        this.isSyncing = false;
    }

    createGenesisBlock() {
        const tx = new Transaction('MeanMaster', 'MeanMasterWallet', 1000000);
        let block = new Block(0, [tx], null);
        block.mineBlock(this.difficulty);

        return block;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        if (this.pendingTransactions.length === 0) {
            return;
        }

        const rewardTx = new Transaction('MeanMasterWallet', miningRewardAddress, this.miningReward, 'Mine reward');
        this.pendingTransactions.push(rewardTx);

        let block = new Block(this.chain.length, this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);
        this.pendingTransactions = [];
    }

    createTransaction(wallet, toAddress, amount, method) {
        const transaction = new Transaction(wallet.getAddressString(), toAddress, amount, method);
        transaction.signTransaction(wallet);

        return transaction;
    }

    createBuyTransaction(toAddress, amount) {
        return new Transaction('MeanMasterWallet', toAddress, amount, 'Transfer');
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Transaction is invalid');
        }

        if (+this.getDetailOfAddress(transaction.fromAddress).balance < +transaction.amount) {
            throw new Error('Not enough balance');
        }

        this.pendingTransactions.push(transaction);
    }

    getDetailOfAddress(address) {
        let balance = 0;
        const transactions = [];
        let i = 1;

        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.fromAddress === address) {
                    balance -= (+transaction.amount);
                } else if (transaction.toAddress === address) {
                    balance += (+transaction.amount);
                } else {
                    continue;
                }

                transaction.index = i++;
                transaction.timestamp = block.timestamp;
                transactions.push(transaction);
            }
        }

        return { balance, transactions };
    }

    isChainValid() {
        const firstBlock = this.chain[0];

        if (firstBlock.hash !== firstBlock.calculateHash()) {
            return false;
        }

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i]
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransaction()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

const BlockChainStore = new BlockChain();
console.log(JSON.stringify(BlockChainStore));

module.exports.BlockChain = BlockChain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;

module.exports = {
    BlockChain, Block, Transaction, BlockChainStore
}