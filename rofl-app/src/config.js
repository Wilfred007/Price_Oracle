require('dotenv').config();

const config = {
  // ROFL Configuration
  rofl: {
    appId: process.env.ROFL_APP_ID,
    privateKey: process.env.ROFL_PRIVATE_KEY,
  },
  
  // Blockchain Configuration
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'https://testnet.sapphire.oasis.dev',
    contractAddress: process.env.CONTRACT_ADDRESS,
    chainId: parseInt(process.env.CHAIN_ID) || 23295,
  },
  
  // Price Oracle Configuration
  oracle: {
    coinGeckoApiKey: process.env.COINGECKO_API_KEY,
    updateInterval: parseInt(process.env.PRICE_UPDATE_INTERVAL) || 60000, // 1 minute
    thresholdPercentage: parseFloat(process.env.THRESHOLD_PERCENTAGE) || 5.0,
    baseUrl: 'https://api.coingecko.com/api/v3',
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Validate required configuration
function validateConfig() {
  const required = [
    'blockchain.contractAddress',
    'rofl.appId',
    'rofl.privateKey'
  ];
  
  for (const path of required) {
    const value = path.split('.').reduce((obj, key) => obj?.[key], config);
    if (!value) {
      throw new Error(`Missing required configuration: ${path}`);
    }
  }
}

// Only validate in production
if (process.env.NODE_ENV === 'production') {
  validateConfig();
}

module.exports = config;
