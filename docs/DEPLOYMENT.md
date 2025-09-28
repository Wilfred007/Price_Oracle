# Deployment Guide

This guide walks you through deploying the Verifiable Price Oracle system on Oasis Sapphire Testnet.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (optional)
- MetaMask or compatible Web3 wallet
- Sapphire Testnet TEST tokens for gas fees

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Price_oracle
```

### 2. Deploy Smart Contract

```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your private key and configuration
npx hardhat deploy --network sapphire-testnet
```

Save the deployed contract address for the next steps.

### 3. Configure ROFL App

```bash
cd ../rofl-app
npm install
cp .env.example .env
# Edit .env with contract address and ROFL configuration
```

### 4. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with contract address and network configuration
```

### 5. Start Services

#### Option A: Local Development
```bash
# Terminal 1: Start ROFL app
cd rofl-app
npm start

# Terminal 2: Start frontend
cd frontend
npm start
```

#### Option B: Docker Compose
```bash
# From project root
docker-compose up -d
```

## Detailed Configuration

### Environment Variables

#### Smart Contracts (`contracts/.env`)
```env
PRIVATE_KEY=your_private_key_here
ROFL_APP_ID=your_rofl_app_id
```

#### ROFL App (`rofl-app/.env`)
```env
ROFL_APP_ID=your_rofl_app_id
ROFL_PRIVATE_KEY=your_private_key
RPC_URL=https://testnet.sapphire.oasis.dev
CONTRACT_ADDRESS=0x... # From deployment
COINGECKO_API_KEY=your_api_key # Optional
PRICE_UPDATE_INTERVAL=60000
THRESHOLD_PERCENTAGE=5.0
```

#### Frontend (`frontend/.env`)
```env
REACT_APP_CONTRACT_ADDRESS=0x... # From deployment
REACT_APP_CHAIN_ID=23295
REACT_APP_RPC_URL=https://testnet.sapphire.oasis.dev
REACT_APP_NETWORK_NAME=Sapphire Testnet
```

## Network Configuration

### Sapphire Testnet
- **Chain ID**: 23295 (0x5aff)
- **RPC URL**: https://testnet.sapphire.oasis.dev
- **Explorer**: https://testnet.explorer.sapphire.oasis.dev
- **Faucet**: https://faucet.testnet.oasis.dev/

### Adding to MetaMask
1. Open MetaMask
2. Click "Add Network"
3. Enter the network details above
4. Get test tokens from the faucet

## ROFL Configuration

### 1. Register ROFL App
```bash
# Follow Oasis ROFL documentation to register your app
oasis rofl register --app-id your_app_id
```

### 2. Configure TEE Environment
```bash
# Set up TEE attestation keys
oasis rofl setup-tee --app-id your_app_id
```

### 3. Deploy ROFL Container
```bash
# Build and deploy to ROFL runtime
docker build -t price-oracle-rofl ./rofl-app
oasis rofl deploy --image price-oracle-rofl --app-id your_app_id
```

## Monitoring and Maintenance

### Health Checks
- ROFL App: `http://localhost:3001/health`
- Frontend: `http://localhost:3000/health`

### Logs
```bash
# Docker logs
docker-compose logs -f rofl-app
docker-compose logs -f frontend

# Local logs
npm run logs # In respective directories
```

### Contract Verification
```bash
cd contracts
npx hardhat verify --network sapphire-testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Check private key has sufficient TEST tokens
   - Verify network configuration
   - Ensure RPC URL is accessible

2. **ROFL app can't connect to contract**
   - Verify contract address in .env
   - Check network connectivity
   - Ensure oracle address is authorized

3. **Frontend shows "No price data"**
   - Wait for first price update (up to 1 minute)
   - Check ROFL app logs for errors
   - Verify contract events are being emitted

4. **Threshold updates fail**
   - Ensure wallet is connected
   - Check if account is contract owner
   - Verify sufficient gas fees

### Debug Commands

```bash
# Check contract state
npx hardhat console --network sapphire-testnet
> const contract = await ethers.getContractAt("PriceOracle", "CONTRACT_ADDRESS")
> await contract.getLatestPrice()

# Test ROFL app locally
cd rofl-app
npm run dev

# Check frontend build
cd frontend
npm run build
```

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **API Keys**: Use environment variables for sensitive data
3. **Contract Ownership**: Transfer ownership to a multisig in production
4. **Rate Limiting**: Implement rate limiting for API calls
5. **Monitoring**: Set up alerts for system failures

## Production Deployment

### 1. Infrastructure Setup
- Use managed Kubernetes or Docker Swarm
- Set up load balancers and SSL certificates
- Configure monitoring and alerting

### 2. Security Hardening
- Use hardware security modules for keys
- Implement proper access controls
- Regular security audits

### 3. Scaling Considerations
- Multiple ROFL instances for redundancy
- Database for price history storage
- CDN for frontend assets

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Oasis ROFL documentation
3. Open an issue in the repository
4. Join the Oasis Discord community
