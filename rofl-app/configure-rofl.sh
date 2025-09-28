#!/bin/bash
echo "Configuring ROFL app..."

# Update the .env file with correct values
cat > .env << 'ENVEOF'
# ROFL Configuration
ROFL_APP_ID=demo-price-oracle-rofl
ROFL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Blockchain Configuration
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
CHAIN_ID=1337

# Price Oracle Configuration
COINGECKO_API_KEY=
PRICE_UPDATE_INTERVAL=30000
THRESHOLD_PERCENTAGE=2.0

# Logging
LOG_LEVEL=info
ENVEOF

echo "ROFL app configured successfully!"
