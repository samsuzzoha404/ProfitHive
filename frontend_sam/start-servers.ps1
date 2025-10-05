# PowerShell script to start the Retail Smart Demand Platform
# Run this with: powershell -ExecutionPolicy Bypass -File start-servers.ps1

Write-Host "🚀 Starting Retail Smart Demand Platform..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Check ports
if (Test-Port 5000) {
    Write-Host "⚠️  Warning: Port 5000 is already in use" -ForegroundColor Yellow
}

if (Test-Port 8080) {
    Write-Host "⚠️  Warning: Port 8080 is already in use" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📡 Starting backend server..." -ForegroundColor Cyan

# Start backend server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Green; node server.js"

# Wait for backend to start
Start-Sleep -Seconds 3

Write-Host "🎨 Starting frontend server..." -ForegroundColor Cyan

# Start frontend server in new window  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '⚡ Frontend Server Starting...' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host "🔧 Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "🎨 Frontend: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tip: Keep both terminal windows open to maintain the servers"
Write-Host ""
Write-Host "Press any key to exit this launcher..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")