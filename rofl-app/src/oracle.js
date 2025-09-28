const axios = require('axios');
const { ethers } = require('ethers');
const { Logger } = require('./utils/logger');
const { ROFLAttestation } = require('./attestation');

class PriceOracle {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('PriceOracle');
    this.isRunning = false;
    this.intervalId = null;
    this.lastPrice = null;
    this.lastUpdateTime = null;
    
    // Initialize blockchain connection
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    this.wallet = new ethers.Wallet(config.rofl.privateKey, this.provider);
    
    // Initialize ROFL attestation
    this.attestation = new ROFLAttestation(config.rofl.appId);
    
    // Contract ABI (will be loaded from deployed contract)
    this.contractABI = [
      "function updatePrice(uint256 price, uint256 timestamp, bytes calldata attestation) external",
      "function getLatestPrice() external view returns (uint256 price, uint256 timestamp)",
      "function setThreshold(uint256 upperBound, uint256 lowerBound) external",
      "event PriceUpdated(uint256 indexed price, uint256 indexed timestamp, address indexed oracle)",
      "event ThresholdBreached(uint256 indexed price, bool indexed isUpper)"
    ];
  }
  
  async start() {
    if (this.isRunning) {
      this.logger.warn('Oracle is already running');
      return;
    }
    
    try {
      this.logger.info('Initializing Price Oracle...');
      
      // Initialize contract connection
      this.contract = new ethers.Contract(
        this.config.blockchain.contractAddress,
        this.contractABI,
        this.wallet
      );
      
      // Verify contract connection
      await this.verifyContractConnection();
      
      // Start price monitoring
      this.isRunning = true;
      await this.fetchAndUpdatePrice(); // Initial fetch
      
      // Set up periodic updates
      this.intervalId = setInterval(
        () => this.fetchAndUpdatePrice(),
        this.config.oracle.updateInterval
      );
      
      this.logger.info(`Oracle started with ${this.config.oracle.updateInterval}ms update interval`);
      
    } catch (error) {
      this.logger.error('Failed to start oracle:', error);
      throw error;
    }
  }
  
  async stop() {
    if (!this.isRunning) {
      return;
    }
    
    this.logger.info('Stopping Price Oracle...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.logger.info('Oracle stopped');
  }
  
  async verifyContractConnection() {
    try {
      // Test contract call
      const [price, timestamp] = await this.contract.getLatestPrice();
      this.logger.info(`Contract connected. Latest price: ${ethers.formatUnits(price, 8)} at ${new Date(Number(timestamp) * 1000)}`);
    } catch (error) {
      this.logger.error('Contract connection failed:', error);
      throw new Error('Unable to connect to price oracle contract');
    }
  }
  
  async fetchPriceFromCoinGecko() {
    try {
      const url = `${this.config.oracle.baseUrl}/simple/price`;
      const params = {
        ids: 'ethereum',
        vs_currencies: 'usd',
        precision: 8
      };
      
      // Add API key if available
      if (this.config.oracle.coinGeckoApiKey) {
        params.x_cg_demo_api_key = this.config.oracle.coinGeckoApiKey;
      }
      
      const response = await axios.get(url, { 
        params,
        timeout: 10000,
        headers: {
          'User-Agent': 'PriceOracle-ROFL/1.0'
        }
      });
      
      const ethPrice = response.data.ethereum?.usd;
      if (!ethPrice) {
        throw new Error('Invalid response from CoinGecko API');
      }
      
      // Convert to fixed-point representation (8 decimals)
      const priceWei = ethers.parseUnits(ethPrice.toString(), 8);
      
      this.logger.debug(`Fetched ETH price: $${ethPrice}`);
      return {
        price: priceWei,
        timestamp: Math.floor(Date.now() / 1000),
        source: 'coingecko'
      };
      
    } catch (error) {
      this.logger.error('Failed to fetch price from CoinGecko:', error);
      throw error;
    }
  }
  
  shouldUpdatePrice(newPrice) {
    if (!this.lastPrice) {
      return true; // First price update
    }
    
    // Calculate percentage change
    const oldPrice = Number(ethers.formatUnits(this.lastPrice, 8));
    const currentPrice = Number(ethers.formatUnits(newPrice, 8));
    const percentageChange = Math.abs((currentPrice - oldPrice) / oldPrice) * 100;
    
    const shouldUpdate = percentageChange >= this.config.oracle.thresholdPercentage;
    
    if (shouldUpdate) {
      this.logger.info(`Price change ${percentageChange.toFixed(2)}% exceeds threshold ${this.config.oracle.thresholdPercentage}%`);
    } else {
      this.logger.debug(`Price change ${percentageChange.toFixed(2)}% below threshold`);
    }
    
    return shouldUpdate;
  }
  
  async fetchAndUpdatePrice() {
    if (!this.isRunning) {
      return;
    }
    
    try {
      this.logger.debug('Fetching latest ETH price...');
      
      // Fetch price data
      const priceData = await this.fetchPriceFromCoinGecko();
      
      // Check if update is needed
      if (!this.shouldUpdatePrice(priceData.price)) {
        return;
      }
      
      // Generate attestation for the price data
      const attestation = await this.attestation.generateAttestation({
        price: priceData.price.toString(),
        timestamp: priceData.timestamp,
        source: priceData.source
      });
      
      // Submit to smart contract
      await this.submitPriceUpdate(priceData.price, priceData.timestamp, attestation);
      
      // Update local state
      this.lastPrice = priceData.price;
      this.lastUpdateTime = priceData.timestamp;
      
      this.logger.info(`Price updated: $${ethers.formatUnits(priceData.price, 8)}`);
      
    } catch (error) {
      this.logger.error('Failed to fetch and update price:', error);
      // Continue running despite errors
    }
  }
  
  async submitPriceUpdate(price, timestamp, attestation) {
    try {
      this.logger.debug('Submitting price update to contract...');
      
      // Estimate gas
      const gasEstimate = await this.contract.updatePrice.estimateGas(
        price,
        timestamp,
        attestation
      );
      
      // Submit transaction with some gas buffer
      const tx = await this.contract.updatePrice(
        price,
        timestamp,
        attestation,
        {
          gasLimit: gasEstimate * 120n / 100n, // 20% buffer
        }
      );
      
      this.logger.info(`Price update submitted: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      this.logger.info(`Price update confirmed in block ${receipt.blockNumber}`);
      
      return receipt;
      
    } catch (error) {
      this.logger.error('Failed to submit price update:', error);
      throw error;
    }
  }
}

module.exports = { PriceOracle };
