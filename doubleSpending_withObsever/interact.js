const { CryptoBlockchain, Transaction, Observer } = require('./cryptoblockchain');
const Web3 = require('web3');
const SimpleStorageArtifact = require('./build/contracts/demo.json'); // Adjust path as needed
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Configuration for two Ganache instances
const HDWalletProvider = require('@truffle/hdwallet-provider');
const provider1 = new HDWalletProvider({
    mnemonic: {
        phrase: 'void chalk body wife solid report immense corn fetch wrong lunar forest',
    },
    providerOrUrl: 'http://127.0.0.1:7545', // Ganache instance 1
});
const provider2 = new HDWalletProvider({
    mnemonic: {
        phrase: 'void chalk body wife solid report immense corn fetch wrong lunar forest',
    },
    providerOrUrl: 'http://127.0.0.1:8545', // Ganache instance 2
});

const web3Chain1 = new Web3(provider1);
const web3Chain2 = new Web3(provider2);

// Use a valid private key from Ganache
const attackerPrivateKey = 'df724fce66ace63d39ea4caff57f404efa084741872e14f3030f787ce12941b9'; // Example private key
const attackerKeyPair = ec.keyFromPrivate(attackerPrivateKey);
const attackerAddress = `0x${attackerKeyPair.getPublic('hex').slice(2)}`; // Get public address from private key (with 0x prefix)

// Set up victims and miners for both chains
const simulateDoubleSpending = async (numAttacks) => {
    const blockchain1 = new CryptoBlockchain();
    const blockchain2 = new CryptoBlockchain();
    const observer1 = new Observer();
    const observer2 = new Observer();

    // Get accounts from both Ganache instances
    const accountsChain1 = await web3Chain1.eth.getAccounts();
    const accountsChain2 = await web3Chain2.eth.getAccounts();

    const victim1 = accountsChain1[1]; // Victim 1 on Blockchain 1
    const victim2 = accountsChain2[1]; // Victim 2 on Blockchain 2
    const miner1 = accountsChain1[2]; // Miner 1 on Blockchain 1
    const miner2 = accountsChain2[2]; // Miner 2 on Blockchain 2

    const results = [];

    // Get the network IDs for both chains
    const networkId1 = await web3Chain1.eth.net.getId();
    const networkId2 = await web3Chain2.eth.net.getId();

    // Get contract addresses for both chains
    const contractAddress1 = SimpleStorageArtifact.networks[networkId1].address;
    const contractAddress2 = SimpleStorageArtifact.networks[networkId2].address;

    for (let i = 1; i <= numAttacks; i++) {
        const amount = Math.floor(Math.random() * 10) + 1; // Random transaction amount between 1 and 10
        const fee = Math.floor(Math.random() * 3) + 1; // Random fee between 1 and 3

        // Create transaction for both blockchains
        const attackTx1Blockchain1 = new Transaction(attackerAddress, victim1, amount, fee);
        const attackTx1Blockchain2 = new Transaction(attackerAddress, victim2, amount, fee);

        attackTx1Blockchain1.signTransaction(attackerKeyPair);
        attackTx1Blockchain2.signTransaction(attackerKeyPair);

        let minerIncome1 = 0;
        let minerIncome2 = 0;

        // Handle Blockchain 1
        if (observer1.validateTransaction(attackTx1Blockchain1)) {
            blockchain1.addTransaction(attackTx1Blockchain1);
            minerIncome1 = blockchain1.minePendingTransactions(miner1);

            try {
                await web3Chain1.eth.sendTransaction({
                    from: attackerAddress,
                    to: contractAddress1,
                    data: SimpleStorageArtifact.abi.find(f => f.name === 'set')
                        ? web3Chain1.eth.abi.encodeFunctionCall(
                            SimpleStorageArtifact.abi.find(f => f.name === 'set'),
                            [amount]
                        ) : '',
                });
                console.log(`Transaction sent to Blockchain 1, set amount: ${amount}`);
            } catch (error) {
                console.error('Error sending transaction to Blockchain 1:', error);
            }
        } else {
            observer1.addInvalidTransaction(attackTx1Blockchain1);
        }

        // Handle Blockchain 2
        if (observer2.validateTransaction(attackTx1Blockchain2)) {
            blockchain2.addTransaction(attackTx1Blockchain2);
            minerIncome2 = blockchain2.minePendingTransactions(miner2);

            try {
                await web3Chain2.eth.sendTransaction({
                    from: attackerAddress,
                    to: contractAddress2,
                    data: SimpleStorageArtifact.abi.find(f => f.name === 'set')
                        ? web3Chain2.eth.abi.encodeFunctionCall(
                            SimpleStorageArtifact.abi.find(f => f.name === 'set'),
                            [amount]
                        ) : '',
                });
                console.log(`Transaction sent to Blockchain 2, set amount: ${amount}`);
            } catch (error) {
                console.error('Error sending transaction to Blockchain 2:', error);
            }
        } else {
            observer2.addInvalidTransaction(attackTx1Blockchain2);
        }

        const successfulTransactions1 = observer1.invalidTransactions.length === 0;
        const successfulTransactions2 = observer2.invalidTransactions.length === 0;

        const attackersIncome = (successfulTransactions1 ? 1 : 0) + (successfulTransactions2 ? 1 : 0);
        const attackersTotalIncome = attackersIncome === 2 ? 20 : attackersIncome === 1 ? 10 : 0;

        minerIncome1 += successfulTransactions1 ? (attackTx1Blockchain1.fee + 10) : 0;
        minerIncome2 += successfulTransactions2 ? (attackTx1Blockchain2.fee + 10) : 0;

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

// Run the simulation
simulateDoubleSpending(10).then(results => {
    console.log('Simulation results:', results);
    provider1.engine.stop();
    provider2.engine.stop();
}).catch(err => {
    console.error('Error in simulation:', err);
    provider1.engine.stop();
    provider2.engine.stop();
});

