const { CryptoBlockchain, Transaction, Observer } = require('./cryptoblockchain');
const Web3 = require('web3');
const SimpleStorageArtifact = require('./build/contracts/demo.json'); // Adjust path as needed
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Configuration
const HDWalletProvider = require('@truffle/hdwallet-provider');
const provider = new HDWalletProvider({
    mnemonic: {
        phrase: 'peasant ghost club frozen example dirt catch discover floor acid there steel'
    },
    providerOrUrl: 'http://127.0.0.1:7545', // Ganache or another local blockchain instance URL
});
const web3 = new Web3(provider);

const simulateDoubleSpendingWithObservers = async (numAttacks) => {
    // Create two blockchains and observers
    const blockchain1 = new CryptoBlockchain();
    const blockchain2 = new CryptoBlockchain();
    const observer1 = new Observer();
    const observer2 = new Observer();
    
    const accounts = Array.from({ length: 6 }, (_, i) => ec.genKeyPair()); // 6 accounts: 1 attacker, 2 victims, 2 miners
    const attacker = accounts[0];
    const victim1 = accounts[1];  // Victim for Blockchain 1
    const victim2 = accounts[2];  // Victim for Blockchain 2
    const miner1 = accounts[3];  // Miner for Blockchain 1
    const miner2 = accounts[4];  // Miner for Blockchain 2

    const results = [];

    // Get the network ID
    const networkId = await web3.eth.net.getId();
    const contractAddress = SimpleStorageArtifact.networks[networkId].address;

    for (let i = 1; i <= numAttacks; i++) {
        const amount = Math.floor(Math.random() * 10) + 1; // Random amount between 1 and 10
        const fee = Math.floor(Math.random() * 3) + 1; // Random fee between 1 and 3

        // Create attack transactions for each blockchain
        const attackTx1Blockchain1 = new Transaction(attacker.getPublic('hex'), victim1.getPublic('hex'), amount, fee); // Transaction for Blockchain 1
        const attackTx1Blockchain2 = new Transaction(attacker.getPublic('hex'), victim2.getPublic('hex'), amount, fee); // Transaction for Blockchain 2

        attackTx1Blockchain1.signTransaction(attacker);
        attackTx1Blockchain2.signTransaction(attacker);

        let minerIncome1 = 0;
        let minerIncome2 = 0;

        // Observer validation and transaction handling for Blockchain 1
        if (observer1.validateTransaction(attackTx1Blockchain1)) {
            blockchain1.addTransaction(attackTx1Blockchain1);
            minerIncome1 = blockchain1.minePendingTransactions(miner1.getPublic('hex')); // Use miner1 for Blockchain 1

            // Send the first transaction to the demo contract (Blockchain 1)
            try {
                await web3.eth.sendTransaction({
                    from: attacker.getPublic('hex'), // Attacker's public key in hex
                    to: contractAddress,
                    data: SimpleStorageArtifact.abi.find(f => f.name === 'set') 
                        ? web3.eth.abi.encodeFunctionCall(
                            SimpleStorageArtifact.abi.find(f => f.name === 'set'),
                            [amount]
                        ) : ''
                });
                console.log(`Transaction sent to Blockchain 1, set amount: ${amount}`);
            } catch (error) {
                console.error('Error sending transaction to Blockchain 1:', error);
            }
        } else {
            observer1.addInvalidTransaction(attackTx1Blockchain1);
        }

        // Observer validation and transaction handling for Blockchain 2
        if (observer2.validateTransaction(attackTx1Blockchain2)) {
            blockchain2.addTransaction(attackTx1Blockchain2);
            minerIncome2 = blockchain2.minePendingTransactions(miner2.getPublic('hex')); // Use miner2 for Blockchain 2

            // Send the second transaction to the demo contract (Blockchain 2)
            try {
                await web3.eth.sendTransaction({
                    from: attacker.getPublic('hex'), // Attacker's public key in hex
                    to: contractAddress,
                    data: SimpleStorageArtifact.abi.find(f => f.name === 'set')
                        ? web3.eth.abi.encodeFunctionCall(
                            SimpleStorageArtifact.abi.find(f => f.name === 'set'),
                            [amount]
                        ) : ''
                });
                console.log(`Transaction sent to Blockchain 2, set amount: ${amount}`);
            } catch (error) {
                console.error('Error sending transaction to Blockchain 2:', error);
            }
        } else {
            observer2.addInvalidTransaction(attackTx1Blockchain2);
        }

        // Determine successful transaction counts and incomes
        const successfulTransactions1 = observer1.invalidTransactions.length === 0;
        const successfulTransactions2 = observer2.invalidTransactions.length === 0;

        const attackersIncome = (successfulTransactions1 ? 1 : 0) + (successfulTransactions2 ? 1 : 0);
        const attackersTotalIncome = attackersIncome === 2 ? 20 : attackersIncome === 1 ? 10 : 0;

        // Calculate miner's income
        minerIncome1 += successfulTransactions1 ? (attackTx1Blockchain1.fee + 10) : 0;
        minerIncome2 += successfulTransactions2 ? (attackTx1Blockchain2.fee + 10) : 0;

        // Store results for both blockchains
        results.push({
            attackNumber: i,
            attackersIncome: attackersTotalIncome,
            minersIncome1: minerIncome1,
            minersIncome2: minerIncome2,
            confirmationRate1: successfulTransactions1 ? 100 : 0,
            confirmationRate2: successfulTransactions2 ? 100 : 0,
        });
    }

    return results;
};

// Run the simulation with a given number of attack scenarios
simulateDoubleSpendingWithObservers(10).then(results => {
    console.log('Simulation results:', results);
    provider.engine.stop();
}).catch(err => {
    console.error('Error in simulation:', err);
    provider.engine.stop();
});
