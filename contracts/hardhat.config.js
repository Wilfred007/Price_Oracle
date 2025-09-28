require("@nomicfoundation/hardhat-toolbox");
require("@oasisprotocol/sapphire-hardhat");
require("dotenv").config();

// Helper function to get accounts configuration
function getAccounts() {
  if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your_private_key_here' && process.env.PRIVATE_KEY.length >= 64) {
    return [process.env.PRIVATE_KEY];
  } else if ((process.env.MNEMONIC || process.env.MNENOMICS) && 
             (process.env.MNEMONIC !== 'your_mnemonic_phrase_here') && 
             (process.env.MNENOMICS !== 'your_mnemonic_phrase_here')) {
    return {
      mnemonic: process.env.MNEMONIC || process.env.MNENOMICS,
      path: "m/44'/60'/0'/0",
      initialIndex: 0,
      count: 20,
    };
  }
  // Return empty array if no valid credentials
  return [];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    "sapphire-testnet": {
      url: "https://testnet.sapphire.oasis.dev",
      chainId: 0x5aff,
      accounts: getAccounts()
    },
    "sapphire-mainnet": {
      url: "https://sapphire.oasis.io",
      chainId: 0x5afe,
      accounts: getAccounts()
    }
  },
  etherscan: {
    apiKey: {
      "sapphire-testnet": "test",
      "sapphire-mainnet": "test"
    },
    customChains: [
      {
        network: "sapphire-testnet",
        chainId: 0x5aff,
        urls: {
          apiURL: "https://testnet.explorer.sapphire.oasis.dev/api",
          browserURL: "https://testnet.explorer.sapphire.oasis.dev"
        }
      },
      {
        network: "sapphire-mainnet",
        chainId: 0x5afe,
        urls: {
          apiURL: "https://explorer.sapphire.oasis.io/api",
          browserURL: "https://explorer.sapphire.oasis.io"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};
