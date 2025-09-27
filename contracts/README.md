# ProfitHive Smart Contracts

This directory contains the blockchain smart contracts for the ProfitHive platform.

## Contracts Overview

### 1. ProfitHiveToken.sol

- **ERC20 token** for the ProfitHive ecosystem
- **Features**: Revenue sharing rewards, staking, governance, forecast accuracy rewards
- **Supply**: 1 billion max supply, 100 million initial supply
- **Security**: OpenZeppelin based with pausable functionality

### 2. RevenueSharing.sol

- **Revenue distribution** among stakeholders
- **Features**: Staking rewards, performance-based rewards, transparent tracking
- **Distribution**: 60% to stakers, 20% to forecasters, 20% to platform
- **Staking**: Minimum 7-day lock period

### 3. ForecastData.sol

- **On-chain forecast storage** and accuracy tracking
- **Features**: Immutable predictions, accuracy verification, reward eligibility
- **Data Integrity**: IPFS hash verification, audit trails
- **Rewards**: Minimum 80% accuracy required for rewards

## Setup

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Hardhat development environment

### Installation

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file with:

```bash
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Start Local Blockchain

```bash
npm run node
```

### Deploy to Local Network

```bash
npm run deploy:local
```

### Deploy to Testnet (Sepolia)

```bash
npm run deploy:testnet
```

## Contract Interactions

### Token Operations

- **Mint**: `mint(address to, uint256 amount)`
- **Reward**: `distributeReward(address recipient, uint256 amount, string reason)`
- **Transfer**: Standard ERC20 transfers

### Revenue Sharing

- **Stake**: `stake(uint256 amount)`
- **Unstake**: `unstake(uint256 amount)`
- **Claim Rewards**: `claimStakingRewards()`
- **Deposit Revenue**: `depositRevenue()` (owner only)

### Forecast Data

- **Submit Forecast**: `submitForecast(storeId, city, start, end, dataHash, predictions)`
- **Submit Actual Data**: `submitActualData(forecastId, actualSales)` (data providers only)
- **Check Eligibility**: `isEligibleForReward(forecastId)`

## Security Features

- **OpenZeppelin Contracts**: Battle-tested security implementations
- **Access Control**: Owner and role-based permissions
- **Pausable**: Emergency pause functionality
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Input Validation**: Comprehensive parameter validation

## Gas Optimization

- **Efficient Storage**: Optimized struct packing
- **Batch Operations**: Multiple operations in single transaction
- **View Functions**: Off-chain computation where possible
- **Events**: Comprehensive event logging for off-chain indexing

## Deployment Addresses

After deployment, contract addresses will be saved in:

- `deployments/{network}.json` - Full deployment data with ABIs
- `deployments/config.json` - Simple configuration for frontend/backend

## Frontend/Backend Integration

The contracts expose the following key addresses and ABIs:

```json
{
  "ProfitHiveToken": "0x...",
  "RevenueSharing": "0x...",
  "ForecastData": "0x...",
  "network": "localhost",
  "chainId": 31337
}
```

## Testing

Comprehensive test suite covers:

- Token minting and distribution
- Revenue sharing and staking
- Forecast submission and accuracy calculation
- Integration scenarios
- Security edge cases

Run tests with:

```bash
npm test
```

## Verification

After mainnet deployment, verify contracts on Etherscan:

```bash
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

## License

MIT License - see LICENSE file for details.
