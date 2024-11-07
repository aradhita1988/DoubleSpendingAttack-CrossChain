const { CryptoBlockchain, Transaction } = require('./cryptoblockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const SimpleStorageArtifact = require('./build/contracts/demo.json'); // Adjust the path as necessary

// Set up the provider and web3 instance
const provider = new HDWalletProvider({
    mnemonic: {
        phrase: 'void chalk body wife solid report immense corn fetch wrong lunar forest'
    },
    providerOrUrl: 'http://127.0.0.1:7545', // Ganache URL
});
const web3 = new Web3(provider);

// Use a valid private key from Ganache
const attackerPrivateKey = 'df724fce66ace63d39ea4caff57f404efa084741872e14f3030f787ce12941b9'; // Example private key without '0x'
const attackerKeyPair = ec.keyFromPrivate(attackerPrivateKey);
const attackerAddress = `0x${attackerKeyPair.getPublic('hex')}`; // Get public address from the private key

const simulateDoubleSpending = async (numAttacks) => {
    const blockchains = [new CryptoBlockchain(), new CryptoBlockchain()]; // Create two blockchains
    const accounts = await web3.eth.getAccounts(); // Get accounts from Ganache
    const victim1 = accounts[1]; // Victim 1 for Blockchain 1
    const victim2 = accounts[2]; // Victim 2 for Blockchain 2
    const miner1 = accounts[3]; // Miner 1 for Blockchain 1
    const miner2 = accounts[4]; // Miner 2 for Blockchain 2
    const results = [];

    for (let i = 1; i <= numAttacks; i++) {
        const amount = 10; // Amount to send in each transaction
        const fee = Math.floor(Math.random() * 3) + 1; // Random fee between 1 and 3

        // Create transactions for both blockchains, ensuring 'from' is the attacker's address
       const attackTx1 = new Transaction(attackerAddress, victim1, amount, fee); // Target victim1 on blockchain 1
        const attackTx2 = new Transaction(attackerAddress, victim2, amount, fee); // Target victim2 on blockchain 2

      
        // Sign the transaction with the key pair
        try {
            attackTx1.signTransaction(attackerKeyPair); // Make sure this is correct
        } catch (error) {
            console.error('Signing failed for attackTx1:', error.message);
            continue; // Skip to the next attack if signing fails
        }

        try {
            attackTx2.signTransaction(attackerKeyPair); // Make sure this is correct
        } catch (error) {
            console.error('Signing failed for attackTx2:', error.message);
            continue; // Skip to the next attack if signing fails
        }
        // Arrays to track success for both blockchains
        const successfulTransactions = [false, false];
        let minerIncome = [0, 0]; // Store miner income for each blockchain
        let confirmationRate = 0; // To calculate the confirmation rate for this attack

        // Interact with the Solidity contract on both blockchains
        for (let j = 0; j < blockchains.length; j++) {
            try {
                // Send the transaction to the corresponding blockchain
                const targetVictim = (j === 0) ? victim1 : victim2; // Select the victim based on blockchain index
                const targetTransaction = (j === 0) ? attackTx1 : attackTx2; // Select the transaction
                const targetMiner = (j === 0) ? miner1 : miner2; // Select the miner based on blockchain index

                await web3.eth.sendTransaction({
                    from: attackerAddress,
                    to: targetVictim, // Send to the correct victim
                    value: web3.utils.toWei(amount.toString(), 'ether'),
                    data: SimpleStorageArtifact.contracts.demo.methods.set(amount).encodeABI()
                });

                successfulTransactions[j] = true;
                minerIncome[j] = fee + 10; // 10 is the mining reward (miner's income for each blockchain)
            } catch (error) {
                console.error(`Failed to execute transaction on Blockchain ${j + 1}:`, error);
            }
        }

        // Calculate the confirmation rate
        confirmationRate = (successfulTransactions[0] ? 1 : 0) + (successfulTransactions[1] ? 1 : 0);
        confirmationRate = confirmationRate * 50; // Convert to percentage

        // Calculate attacker income
        const attackerIncome = confirmationRate === 100 ? 20 : (confirmationRate === 50 ? 10 : 0);

        // Store results for this attack
        results.push({
            AttackNumber: i,
            ConfirmationRate: confirmationRate + "%",
            AttackerIncome: attackerIncome,
            MinerIncomeBlockchain1: minerIncome[0],
            MinerIncomeBlockchain2: minerIncome[1],
        });
    }

    // Display the results
    console.table(results);
};

// Run the simulation for 10 attacks
simulateDoubleSpending(10).then(() => provider.engine.stop());
