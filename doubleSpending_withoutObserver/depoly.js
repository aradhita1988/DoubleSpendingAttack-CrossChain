const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const SimpleStorageArtifact = require('./build/contracts/demo.json'); // Adjust the path as necessary

// Configuration
const provider = new HDWalletProvider({
    mnemonic: {
        phrase: 'peasant ghost club frozen example dirt catch discover floor acid there steel'
    },
    providerOrUrl: 'http://127.0.0.1:7545', // Ganache URL
});
const web3 = new Web3(provider);

const interact = async () => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = SimpleStorageArtifact.networks[networkId];
    const instance = new web3.eth.Contract(SimpleStorageArtifact.abi, deployedNetwork && deployedNetwork.address);
    const accounts = await web3.eth.getAccounts();

    // Set and get the value from the contract
    await instance.methods.set(42).send({ from: accounts[0] });
    console.log('Value set to 42');
    const value = await instance.methods.get().call();
    console.log('Stored value:', value);
};

interact().then(() => provider.engine.stop());
