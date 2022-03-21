require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const MNEMONIC = process.env.MNEMONIC;
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

module.exports = {
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 7545,
      chainId: 1337,
      network_id: "1337",
      deploymentPollingInterval: 10
    },
    rinkeby: {
      provider: () => new HDWalletProvider(MNEMONIC, `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`),
      network_id: 4,
      gas: 8500000,
      gasPrice: 1000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true // Skip dry run before migrations? (default: false for public nets )
    }
  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  },
};
