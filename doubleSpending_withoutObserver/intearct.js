const { CryptoBlockchain, Transaction } = require('./cryptoblockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const SimpleStorageArtifact = require('./build/contracts/demo.json'); // Adjust the path as necessary

// Ganache configurations for cross-chain
const ganacheInstance1 = 'http://127.0.0.1:7545'; // First Ganache instance
const ganacheInstance2 = 'http://127.0.0.1:8545'; // Second Ganache instance

// Set up providers and web3 instances
const provider1 = new HDWalletProvider({
    mnemonic: {
        phrase: 'void chalk body wife solid report immense corn fetch wrong lunar forest',
    },
    providerOrUrl: ganacheInstance1,
});
const provider2 = new HDWalletProvider({
    mnemonic: {
        phrase: 'void chalk body wife solid report immense corn fetch wrong lunar forest',
    },
    providerOrUrl: ganacheInstance2,
});

const web3Instance1 = new Web3(provider1);
const web3Instance2 = new Web3(provider2);

// Use a valid private key from Ganache
const attackerPrivateKey = 'df724fce66ace63d39ea4caff57f404efa084741872e14f3030f787ce12941b9';
const attackerKeyPair = ec.keyFromPrivate(attackerPrivateKey);
const attackerAddress = `0x${attackerKeyPair.getPublic('hex')}`;

const simulateDoubleSpending = async (numAttacks) => {
    const blockchains = [new CryptoBlockchain(), new CryptoBlockchain()];
    const accounts1 = await web3Instance1.eth.getAccounts();
    const accounts2 = await web3Instance2.eth.getAccounts();

    const victim1 = accounts1[1];
    const victim2 = accounts2[1];
    const miner1 = accounts1[2];
    const miner2 = accounts2[2];
    const results = [];

    for (let i = 1; i <= numAttacks; i++) {
        const amount = 10; 
        const fee = Math.floor(Math.random() * 3) + 1;

        const attackTx1 = new Transaction(attackerAddress, victim1, amount, fee);
        const attackTx2 = new Transaction(attackerAddress, victim2, amount, fee);

        try {
            attackTx1.signTransaction(attackerKeyPair);
            attackTx2.signTransaction(attackerKeyPair);
        } catch (error) {
            console.error('Transaction signing failed:', error.message);
            continue;
        }

        const successfulTransactions = [false, false];
        let minerIncome = [0, 0];
        let confirmationRate = 0;

        const web3Instances = [web3Instance1, web3Instance2];
        const victims = [victim1, victim2];
        const miners = [miner1, miner2];
        const transactions = [attackTx1, attackTx2];

        for (let j = 0; j < blockchains.length; j++) {
            try {
                const targetWeb3 = web3Instances[j];
                const targetVictim = victims[j];
                const targetTransaction = transactions[j];
                const targetMiner = miners[j];

                await targetWeb3.eth.sendTransaction({
                    from: attackerAddress,
                    to: targetVictim,
                    value: targetWeb3.utils.toWei(amount.toString(), 'ether'),
                    data: SimpleStorageArtifact.contracts.demo.methods.set(amount).encodeABI(),
                });

                successfulTransactions[j] = true;
                minerIncome[j] = fee + 10;
            } catch (error) {
                console.error(`Transaction failed on Blockchain ${j + 1}:`, error);
            }
        }

        confirmationRate = (successfulTransactions[0] ? 1 : 0) + (successfulTransactions[1] ? 1 : 0);
        confirmationRate *= 50;

        const attackerIncome = confirmationRate === 100 ? 20 : (confirmationRate === 50 ? 10 : 0);

        results.push({
            AttackNumber: i,
            ConfirmationRate: confirmationRate + "%",
            AttackerIncome: attackerIncome,
            MinerIncomeBlockchain1: minerIncome[0],
            MinerIncomeBlockchain2: minerIncome[1],
        });
    }

    console.table(results);
};

// Run the simulation for 10 attacks
simulateDoubleSpending(10).then(() => {
    provider1.engine.stop();
    provider2.engine.stop();
});

