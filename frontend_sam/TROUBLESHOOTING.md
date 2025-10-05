# 🛠️ Troubleshooting Guide - Retail Smart Demand Platform

## Common Issues & Solutions

### 🔧 Frontend Server Crashes (ERR_CONNECTION_REFUSED)

**Symptoms:**
- Browser shows "ERR_CONNECTION_REFUSED"
- Vite shows "server connection lost"
- Frontend becomes unresponsive

**Quick Fix:**
```bash
# Method 1: Restart frontend only
cd "Y:\Demo\CSC"
npm run dev

# Method 2: Use startup scripts
# Double-click start-servers.bat (Windows)
# OR run: powershell -ExecutionPolicy Bypass -File start-servers.ps1
```

**Root Causes:**
- System resource constraints (RAM/CPU)
- File watcher limits exceeded
- Port conflicts
- Node.js process interruption

### 🔧 Backend Server Issues

**Check Backend Status:**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Should return: {"status":"healthy",...}
```

**Restart Backend:**
```bash
cd "Y:\Demo\CSC\backend"
node server.js
```

### 🔧 Port Conflicts

**Check What's Using Ports:**
```bash
# Windows Command
netstat -ano | findstr :5000
netstat -ano | findstr :8080

# Kill processes if needed
taskkill /PID <process_id> /F
```

### 🔧 OpenAI API Issues

**Check API Key:**
- File: `backend\.env`
- Should contain: `OPENAI_API_KEY=sk-proj-...`

**Test Without AI:**
- System automatically falls back to statistical forecasting
- No functionality loss, just different prediction method

### 🔧 CORS Errors

**Symptoms:**
- Browser console shows CORS policy errors
- API calls fail with "Access-Control-Allow-Origin" errors

**Solution:**
- Backend already configured for ports 8080, 8081, 5173, 3000
- If using different port, update CORS in `backend/server.js`

### 🔧 Build Errors

**Clear Cache & Reinstall:**
```bash
# Frontend
cd "Y:\Demo\CSC"
rm -rf node_modules package-lock.json
npm install

# Backend  
cd "Y:\Demo\CSC\backend"
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Startup Options

### Option 1: Manual Start (Recommended for Development)
```bash
# Terminal 1: Backend
cd "Y:\Demo\CSC\backend"
node server.js

# Terminal 2: Frontend  
cd "Y:\Demo\CSC"
npm run dev
```

### Option 2: Automated Scripts
```bash
# Windows Batch File
double-click start-servers.bat

# PowerShell Script
powershell -ExecutionPolicy Bypass -File start-servers.ps1
```

### Option 3: Stable Mode
```bash
npm run dev:stable
# Uses fixed host 0.0.0.0 and port 8080
```

## 📊 System Requirements

**Minimum:**
- Node.js 18+
- 4GB RAM
- Windows 10/11
- Modern browser

**Recommended:**
- Node.js 20+
- 8GB RAM
- SSD storage
- Chrome/Firefox latest

## 🎯 Testing Checklist

**Backend Health:**
- [ ] `curl http://localhost:5000/health` returns 200 OK
- [ ] OpenAI status shows "configured" or "not_configured" 
- [ ] All services show "active"

**Frontend Health:**
- [ ] `http://localhost:8080` loads React app
- [ ] Navigation menu works
- [ ] No console errors

**API Integration:**
- [ ] Forecast page loads without errors
- [ ] "Run Demo Forecast" button works
- [ ] Charts and KPIs display correctly
- [ ] Processing time shows in metadata

## 🔍 Debug Mode

**Enable Detailed Logging:**
```bash
# Frontend debug mode
npm run dev:debug

# Backend with environment variables
NODE_ENV=development node server.js
```

**Browser Developer Tools:**
- Open F12
- Check Console for JavaScript errors
- Check Network tab for API call status
- Monitor Performance tab for resource usage

## 📞 Support

If issues persist:
1. Check all requirements are met
2. Verify file permissions
3. Try on different port numbers
4. Check Windows Defender/Firewall
5. Restart computer if system resources are low

**Log Locations:**
- Frontend: Browser console (F12)
- Backend: Terminal output
- System: Windows Event Viewer (if needed)

---
**💡 Pro Tip:** Keep both terminal windows visible so you can monitor real-time logs and catch issues early!