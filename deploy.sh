#!/bin/bash
# Deployment script for ProfitHive contracts

echo "🚀 Starting ProfitHive deployment process..."

# Navigate to contracts directory
cd contracts

# Start Hardhat node in background (Windows PowerShell version)
echo "📡 Starting local blockchain..."
start powershell -WindowStyle Hidden -Command "npx hardhat node"

# Wait for node to start
echo "⏳ Waiting for blockchain to start..."
sleep 5

# Deploy contracts
echo "🏗️  Deploying smart contracts..."
npx hardhat run scripts/deploy.js --network localhost

echo "✅ Deployment complete!"
echo "📋 Contract addresses saved to deployments/config.json"
echo ""
echo "🎯 Next steps:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Visit http://localhost:8080 and connect your wallet"
echo ""
echo "💡 Use MetaMask with these settings:"
echo "   - Network: Localhost 8545"
echo "   - Chain ID: 31337"
echo "   - RPC URL: http://127.0.0.1:8545"