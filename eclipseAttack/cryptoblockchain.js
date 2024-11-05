const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount, fee) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.fee = fee;
        this.timestamp = Date.now();
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.fee + this.timestamp).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets.');
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        return this.signature && this.fromAddress != null && this.toAddress != null;
    }
}

class CryptoBlock {
    constructor(timestamp, transactions, precedingHash = "") {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.precedingHash = precedingHash;
        this.hash = this.computeHash();
        this.nonce = 0;
    }

    computeHash() {
        return SHA256(this.precedingHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.computeHash();
        }
    }

    hasValidTransactions() {
        return this.transactions.every(tx => tx.isValid());
    }
}

class CryptoBlockchain {
    constructor() {
        this.chain = [this.startGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningReward = 10;
    }

    startGenesisBlock() {
        return new CryptoBlock(Date.now(), [], "0");
    }

    obtainLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        let block = new CryptoBlock(Date.now(), this.pendingTransactions, this.obtainLatestBlock().hash);
        block.mineBlock(this.difficulty);
        const totalFees = this.pendingTransactions.reduce((acc, tx) => acc + tx.fee, 0);
        
        // Reward miner with the total fees and mining reward
        this.pendingTransactions.push(new Transaction(null, miningRewardAddress, totalFees + this.miningReward, 0));
        
        this.chain.push(block);
        this.pendingTransactions = [];
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to blockchain');
        }
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount + trans.fee;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }
}

module.exports = { CryptoBlockchain, CryptoBlock, Transaction };
