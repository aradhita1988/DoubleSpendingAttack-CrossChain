# Double-spending-CrossChain
To organize and execute the three different double-spending attack scenarios (Traditional Double Spending, Double Spending with an Observer, and Eclipse-based Double Spending) in a cross-chain environment, you can set up the project in a structured way with separate folders for each scenario. Here's a step-by-step guide for organizing the code into three different folders and running each attack scenario: 


# Softwares required:
    - Install **Node.js**
    - Install **Ganache**
    - Install **Truffle**
    - Install **Web3.js**
# Initialize a Node.js Project:
  Run the following command to create a package.json file:
   -npm init -y
# Install Dependencies:
   npm install web3 truffle elliptic @truffle/hdwallet-provider
# Set Up Truffle Project:
  truffle init
# Configure Ganache and Truffle
  - Start Ganache
  - Configure Truffle to Connect to Ganache:
    ![1](https://github.com/user-attachments/assets/033cbbe8-196b-4b6d-8118-37bcadb4bc9f)
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
