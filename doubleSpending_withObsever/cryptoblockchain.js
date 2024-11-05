// cryptoblockchain.js
const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount, fee) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.fee = fee;
        this.timestamp = Date.now();
        this.signature = null; // To be signed
    }

    signTransaction(senderKeyPair) {
        if (senderKeyPair.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }
        const hashTx = this.calculateHash();
        this.signature = senderKeyPair.sign(hashTx, 'base64').toString('base64');
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.fee + this.timestamp).toString();
    }
}

class CryptoBlock {
    constructor(previousHash) {
        this.previousHash = previousHash;
        this.transactions = [];
        this.timestamp = Date.now();
        this.nonce = 0;
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to addresses');
        }
        this.transactions.push(transaction);
    }

    mineBlock(minerAddress) {
        this.nonce = Math.floor(Math.random() * 10000); // Simple mining simulation
        return this.calculateHash();
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }
}

class CryptoBlockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
    }

    createGenesisBlock() {
        return new CryptoBlock("0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(minerAddress) {
        const block = new CryptoBlock(this.getLatestBlock().calculateHash());
        block.transactions = this.pendingTransactions;
        block.mineBlock(minerAddress);
        this.chain.push(block);
        this.pendingTransactions = [];
        return 10; // Mining reward
    }

    addTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }
}

class Observer {
    constructor() {
        this.invalidTransactions = [];
    }

    validateTransaction(transaction) {
        // Simple validation logic for the sake of example
        const isValid = transaction.signature && transaction.amount > 0;
        return isValid;
    }

    addInvalidTransaction(transaction) {
        this.invalidTransactions.push(transaction);
    }
}

module.exports = { CryptoBlockchain, Transaction, Observer };
