# ProfitHive Deployment Script for Windows PowerShell
Write-Host "🚀 Starting ProfitHive deployment process..." -ForegroundColor Green

# Navigate to contracts directory
Set-Location contracts

# Check if Hardhat node is already running
$nodeRunning = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue
if ($nodeRunning) {
    Write-Host "📡 Blockchain already running on port 8545" -ForegroundColor Yellow
} else {
    Write-Host "📡 Starting local blockchain..." -ForegroundColor Cyan
    
    # Start Hardhat node in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx hardhat node" -WindowStyle Normal
    
    Write-Host "⏳ Waiting for blockchain to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
}

# Deploy contracts
Write-Host "🏗️  Deploying smart contracts..." -ForegroundColor Cyan
npx hardhat run scripts/deploy.js --network localhost

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "📋 Contract addresses saved to deployments/config.json" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start backend: cd backend && npm start" -ForegroundColor White
    Write-Host "2. Start frontend: cd frontend && npm run dev" -ForegroundColor White
    Write-Host "3. Visit http://localhost:8080 and connect your wallet" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 MetaMask Configuration:" -ForegroundColor Magenta
    Write-Host "   - Network Name: Localhost" -ForegroundColor White
    Write-Host "   - RPC URL: http://127.0.0.1:8545" -ForegroundColor White
    Write-Host "   - Chain ID: 31337" -ForegroundColor White
    Write-Host "   - Currency Symbol: ETH" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Test Account (for development):" -ForegroundColor Magenta
    Write-Host "   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
    Write-Host "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the console output above for errors." -ForegroundColor Red
}

# Navigate back to root
Set-Location ..