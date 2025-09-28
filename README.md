# Verifiable Price Oracle + Alert System

A decentralized oracle system that fetches off-chain price data (ETH/USD) inside a Trusted Execution Environment (TEE) using Oasis ROFL, verifies the data source, and submits it to an on-chain smart contract with attestation.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ROFL App      │    │  Smart Contract  │    │   Frontend      │
│   (TEE)         │───▶│  (Sapphire)      │◀───│   (React)       │
│                 │    │                  │    │                 │
│ • Fetch ETH/USD │    │ • Store prices   │    │ • Display price │
│ • Attest data   │    │ • Verify ROFL    │    │ • Show alerts   │
│ • Submit price  │    │ • Emit events    │    │ • Set thresholds│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Project Structure

- `/rofl-app/` - ROFL application for secure price fetching
- `/contracts/` - Smart contracts for price storage and verification
- `/frontend/` - React web application for user interface
- `/docs/` - Documentation and deployment guides

## Features

### Off-chain (ROFL App)
- Fetch ETH/USD from CoinGecko API
- Run inside TEE for verifiable attestation
- Submit price updates to smart contract
- Threshold-based update triggers

### On-chain (Smart Contract)
- Accept price updates only from attested ROFL app
- Store latest price and timestamp
- Emit events on updates
- Threshold breach detection

### Frontend (Web App)
- Display current verified price
- Show last updated timestamp
- Visual alerts for threshold breaches
- User-configurable thresholds

## Quick Start

1. **Setup ROFL App**
   ```bash
   cd rofl-app
   npm install
   npm run build
   ```

2. **Deploy Smart Contract**
   ```bash
   cd contracts
   npm install
   npx hardhat deploy --network sapphire-testnet
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Technology Stack

- **ROFL**: Oasis Runtime OFfchain Logic
- **Smart Contracts**: Solidity on Sapphire Testnet
- **Frontend**: React.js with ethers.js
- **Price Data**: CoinGecko API

## Success Criteria

- ✅ End-to-end price flow: API → TEE → Contract → Frontend
- ✅ Contract rejects non-attested updates
- ✅ Alert system for threshold breaches
- ✅ Working demo on testnet

## License

MIT License
# Price_Oracle
