const { PriceOracle } = require('./oracle');
const { Logger } = require('./utils/logger');
const config = require('./config');

const logger = new Logger('ROFL-Main');

async function main() {
  try {
    logger.info('Starting Price Oracle ROFL App...');
    
    // Initialize the price oracle
    const oracle = new PriceOracle(config);
    
    // Start the oracle service
    await oracle.start();
    
    logger.info('Price Oracle ROFL App started successfully');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await oracle.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await oracle.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start Price Oracle ROFL App:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

main();
