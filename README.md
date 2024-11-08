# Double-spending-CrossChain
To organize and execute the three different double-spending attack scenarios (Traditional Double Spending, Double Spending with an Observer, and Eclipse-based Double Spending) in a cross-chain environment, you can set up the project in a structured way with separate folders for each scenario. Here's a step-by-step guide for organizing the code into three different folders and running each attack scenario: 

cross-chain-double-spending/
│
├── traditional-double-spending/
│   ├── contracts/
│   ├── migrations/
│   ├── simulate.js
│   ├── cryptoblockchain.js
│   ├── truffle-config.js
│   └── package.json
│
├── double-spending-with-observer/
│   ├── contracts/
│   ├── migrations/
│   ├── simulate.js
│   ├── cryptoblockchain.js
│   ├── truffle-config.js
│   └── package.json
│
├── eclipse-based-double-spending/
│   ├── contracts/
│   ├── migrations/
│   ├── simulate.js
│   ├── cryptoblockchain.js
│   ├── truffle-config.js
│   └── package.json
# Softwares required:
-Node.js: Make sure you have Node.js installed. You can download it from here.

-Ganache: You will need Ganache, which is a personal Ethereum blockchain for development purposes. Download and install Ganache from here.

- Truffle Framework: Truffle is a development framework for Ethereum
     -npm install -g truffle
1. Compile your Solidity contract:
    truffle compile
2. Migrate the contract to Ganache:
   truffle migrate --network development   
3. Interact with the Contract via Web3 
   npm install web3 @truffle/hdwallet-provider
4.  Run the script to interact with the smart contract:
    node depoly.js   
5.Install the required dependencies (crypto-js, elliptic):
  npm install crypto-js elliptic  
6. Simulate the Double-Spending Attack 
   intearct.js       


# apple
**guava**

- banana
- grapes
