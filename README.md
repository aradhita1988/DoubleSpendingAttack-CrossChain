# Double-spending-CrossChain
To organize and execute the three different double-spending attack scenarios (Traditional Double Spending, Double Spending with an Observer, and Eclipse-based Double Spending) in a cross-chain environment, you can set up the project in a structured way with separate folders for each scenario. Here's a step-by-step guide for organizing the code into three different folders and running each attack scenario: 


# Softwares required:
    - Install Node.js 
    - Install Ganache(npm install -g ganache-cli)
    - Install Truffle
    - Install Web3.js
# Initialize a Node.js Project:
 Run the following command to create a package.json file:
   - npm init -y
# Install Dependencies:
   - npm install web3 truffle elliptic @truffle/hdwallet-provider
# Set Up Truffle Project:
   - truffle init
# Configure Ganache and Truffle:
  - Start Ganache
     
  - Configure Truffle to Connect to Ganache:
  
  ![Image](https://github.com/user-attachments/assets/a24ebabe-fcc2-4141-a13a-e6dfd099b7b1)
   
   Replace each mnemonic phrase with the one from your Ganache instance.
# Write the Smart Contract:
 - Create a contracts/ folder and add  demo.sol contract file.
# Write the Migration Script:
  - Create a migration script in the migrations/ folder.
# Compile and Deploy the Contract:
  - truffle compile
  - truffle migrate --network development
# Implement the Simulation Code:
 - cryptoblockchain.js: Contains blockchain simulation and transaction handling.
 - interact.js: Contains the logic to interact with the deployed contract and simulate attacks.
   ![Image](https://github.com/user-attachments/assets/659c9777-f5fe-48b9-b949-c26750c6b3c0)
   
   Put proper Providerurl,Providermnemonic,NetworkId.
# Running the Simulation :
 - node  interact.js
      -Output (Double spending without observer(only for two attacks))
     ![Screenshot from 2024-11-06 17-05-44](https://github.com/user-attachments/assets/4f16409d-6510-490a-8ec7-0a31d8fa67f2)

# Authors' Information :

Aradhita Mukherjee

Ca’ Foscari University of Venice, Venice, Italy

E-mail: aradhita.mukherjee@unive.it

Luca Olivieri

Ca’ Foscari University of Venice, Venice, Italy

E-mail: luca.olivieri@unive.it 

Nabendu Chaki 

University of Calcutta, Kolkata, West Bengal, India

E-mail: nabendu@ieee.org

Agostino Cortesi

Ca’ Foscari University of Venice, Venice, Italy

E-mail: cortesi@unive.it 


      
