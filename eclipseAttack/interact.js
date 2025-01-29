const { CryptoBlockchain, Transaction } = require('./cryptoblockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const SimpleStorageArtifact = require('./build/contracts/demo.json');

// Set up the provider and web3 instance for Chain X
const providerChainX = new HDWalletProvider({
    mnemonic: {
        phrase: 'peasant ghost club frozen example dirt catch discover floor acid there steel'
    },
    providerOrUrl: 'http://127.0.0.1:7545', // Ganache instance for Chain X
});
const web3ChainX = new Web3(providerChainX);

// Set up the provider and web3 instance for Chain Y
const providerChainY = new HDWalletProvider({
    mnemonic: {
        phrase: 'peasant ghost club frozen example dirt catch discover floor acid there steel'
    },
    providerOrUrl: 'http://127.0.0.1:7546', // Ganache instance for Chain Y (use different port)
});
const web3ChainY = new Web3(providerChainY);

// Fixed mining reward (baseAward)
const baseAward = 10;

// Function to simulate the double-spending attack across two chains
const simulateDoubleSpending = async (numAttacks) => {
    const chainX = new CryptoBlockchain(); // Chain X
    const chainY = new CryptoBlockchain(); // Chain Y

    // Get accounts from Chain X and Chain Y
    const accountsChainX = await web3ChainX.eth.getAccounts(); // Accounts from Chain X
    const accountsChainY = await web3ChainY.eth.getAccounts(); // Accounts from Chain Y

    const attacker = accountsChainX[0]; // The first account will be the attacker
    const victimChainX = accountsChainX[1]; // The second account will be the victim for Chain X
    const victimChainY = accountsChainY[1]; // The second account will be the victim for Chain Y
    const minerChainX = accountsChainX[3]; // The fourth account will be the miner for Chain X
    const minerChainY = accountsChainY[3]; // The fourth account will be the miner for Chain Y

    const results = [];

    for (let i = 1; i <= numAttacks; i++) {
        const amount = 10; // Amount to send in each transaction
        const fee = Math.floor(Math.random() * 3) + 1; // Random fee between 1 and 3

        // Create a transaction for Chain X (to victimChainX)
        const txChainX = new Transaction(attacker, victimChainX, amount, fee);
        txChainX.signTransaction(ec.keyFromPrivate(attacker.privateKey));

        // Simulate the first transaction on Chain X
        const chainXTransactionSuccess = Math.random() > 0.1; // 90% success rate for Chain X

        let minerIncomeChainX = 0; // Miner income for Chain X
        if (chainXTransactionSuccess) {
            await web3ChainX.eth.sendTransaction({
                from: attacker,
                to: SimpleStorageArtifact.networks[await web3ChainX.eth.net.getId()].address,
                data: SimpleStorageArtifact.contracts.demo.methods.set(amount).encodeABI()
            });
            console.log(`Transaction on Chain X from ${attacker} to ${victimChainX} of amount ${amount}`);
            minerIncomeChainX = fee + baseAward; // Miner income is the fee plus the fixed baseAward
        } else {
            console.log(`Transaction on Chain X failed.`);
        }

        // Create a conflicting transaction on Chain Y (to victimChainY)
        const conflictingTxChainY = new Transaction(attacker, victimChainY, amount, fee);
        conflictingTxChainY.signTransaction(ec.keyFromPrivate(attacker.privateKey));

        // Confirm the fraudulent transaction in isolated group G on Chain Y
        console.log(`Confirming fraudulent transaction in Chain Y from ${attacker} to ${victimChainY} of amount ${amount}`);
        chainY.addTransaction(conflictingTxChainY);

        // Now we attempt to mine on Chain Y
        let minerIncomeChainY = 0; // Miner income for Chain Y
        if (chainY.hasValidTransactions()) {
            chainY.minePendingTransactions(minerChainY); // Simulate mining the block containing the fraudulent transaction
            minerIncomeChainY = fee + baseAward; // Miner income for Chain Y is the fee plus the fixed baseAward
        }

        // Calculate confirmation rate
        const confirmationRate = `${((chainXTransactionSuccess ? 1 : 0) + (chainY.hasValidTransactions() ? 1 : 0)) / 2 * 100}.toFixed(2)}%`;

        // Calculate attacker income based on confirmation rate
        const attackerIncome = confirmationRate === '100.00%' ? 20 : confirmationRate === '50.00%' ? 10 : 0;

        // Store results for this attack
        results.push({
            AttackNumber: i,
            ConfirmationRate: confirmationRate,
            AttackerIncome: attackerIncome,
            MinerIncomeBlockchain1: minerIncomeChainX,
            MinerIncomeBlockchain2: minerIncomeChainY,
        });
    }

    // Display the results
    console.table(results);
};

// Run the simulation for a specified number of attacks
simulateDoubleSpending(10).then(() => {
    providerChainX.engine.stop();
    providerChainY.engine.stop();
});

