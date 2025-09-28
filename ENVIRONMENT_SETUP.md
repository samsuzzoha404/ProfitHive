# 🔐 ProfitHive Environment Configuration Guide

This document provides comprehensive guidance for setting up all environment variables needed for the ProfitHive AI-powered demand forecasting platform.

## 📋 Quick Setup Checklist

- [ ] Copy `.env.example` to `.env` in each service directory
- [ ] Set up API keys for external services
- [ ] Configure database connections
- [ ] Set up blockchain network credentials
- [ ] Configure Python AI services
- [ ] Test all integrations

## 🗂️ Environment Files Structure

```
ProfitHive/
├── .env.example                    # Main environment template
├── backend/.env                    # Backend Node.js service
├── frontend/.env                   # Frontend React app
├── contracts/.env                  # Blockchain/Hardhat config
└── backend/python/.env             # Python AI services (optional)
```

## 🔑 Required API Keys & Services

### ✅ **Blockchain Integration (CONFIGURED!)**

- **Etherscan API Key**: `Y2Y3KWZPMPMG3TUWRVKAZXXYIVJDKPJ63S`
- **Infura Project ID**: `95485f9d99be48e0819de957474c858f`
- **Networks**: Ethereum Mainnet, Sepolia Testnet, Polygon
- **Status**: Ready for smart contract deployment! 🚀

### 1. **OpenWeatherMap API** (Weather Data)

- **Website:** https://openweathermap.org/api
- **Plan:** Free tier (1000 calls/day)
- **Usage:** Real-time weather impact analysis for Cyberjaya
- **Variable:** `OPENWEATHERMAP_API_KEY`

**Setup Steps:**

1. Create account at OpenWeatherMap
2. Go to API keys section
3. Generate new API key
4. Add to `.env` file

### 2. **Google Maps API** (Foot Traffic Data)

- **Website:** https://console.cloud.google.com/
- **Required APIs:** Places API, Maps JavaScript API
- **Usage:** Foot traffic analysis and location intelligence
- **Variable:** `GOOGLE_MAPS_API_KEY`

**Setup Steps:**

1. Create/select Google Cloud project
2. Enable Places API and Maps JavaScript API
3. Create credentials (API Key)
4. Restrict key to your domains (recommended)

### 3. **Kaggle API** (Transportation Data)

- **Website:** https://www.kaggle.com/settings
- **Dataset:** `shahmirvarqha/transportation-in-cyberjaya-malaysia`
- **Usage:** Real Cyberjaya transport data (99K+ records)
- **Variables:** `KAGGLE_USERNAME`, `KAGGLE_KEY`

**Setup Steps:**

1. Create Kaggle account
2. Go to Account settings
3. Click "Create New API Token"
4. Download `kaggle.json` file
5. Extract username and key for `.env`

### 4. **Firebase** (Optional - Authentication)

- **Website:** https://console.firebase.google.com/
- **Usage:** User authentication and real-time database
- **Variables:** `VITE_FIREBASE_*` (multiple config values)

## 🚀 Service-Specific Configuration

### **Backend (.env)**

```bash
# Core Configuration
NODE_ENV=development
PORT=5000

# API Keys
OPENWEATHERMAP_API_KEY=your_api_key_here
GOOGLE_MAPS_API_KEY=your_api_key_here
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_api_key

# Security
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
CORS_ORIGIN=http://localhost:8080

# File Paths
STORAGE_PATH=./data
LOGS_PATH=./logs
```

### **Frontend (.env)**

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:5000

# Firebase (Optional)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### **Contracts (.env)**

```bash
# Ethereum Network
PRIVATE_KEY=your_ethereum_private_key_for_deployment
INFURA_PROJECT_ID=your_infura_project_id

# Network URLs
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# API Keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🐍 Python AI Services Configuration

The Python services can use environment variables for configuration:

```bash
# Optional Python Service Config
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key
PROPHET_CACHE_DURATION=3600
KAGGLE_CACHE_DURATION=21600
```

**Alternative:** Python services can also use `~/.kaggle/kaggle.json` for Kaggle authentication.

## 🔒 Security Best Practices

### **JWT Secret Generation**

```bash
# Generate a secure JWT secret (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use online generator (ensure HTTPS):
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

### **Environment File Security**

- ✅ **Never commit `.env` files** to version control
- ✅ **Add `.env` to `.gitignore`**
- ✅ **Use different keys** for development/production
- ✅ **Rotate keys regularly** in production
- ✅ **Use strong, unique passwords**

### **Production Considerations**

```bash
# Production overrides
NODE_ENV=production
SECURE_COOKIES=true
ENABLE_HTTPS_REDIRECT=true
TRUST_PROXY=true

# Use environment-specific URLs
PRODUCTION_FRONTEND_URL=https://your-app.vercel.app
PRODUCTION_BACKEND_URL=https://your-api.railway.app
```

## 🧪 Testing Your Configuration

### **1. Test Backend APIs**

```bash
# Test weather API
curl "http://localhost:5000/api/health"

# Test forecast endpoint
curl -X POST http://localhost:5000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{"store":"Test","city":"Cyberjaya","records":[...]}'
```

### **2. Test Python Services**

```bash
# Navigate to Python directory
cd backend/python

# Test Kaggle service
python kaggle_transport_service.py --action status

# Test Prophet service
echo '{"history":[...], "predict_periods":7}' | python prophet_service.py predict
```

### **3. Test Frontend Integration**

- Open http://localhost:8080
- Try uploading sample data
- Check browser console for API calls
- Verify weather/transport data loading

## 🚨 Troubleshooting Common Issues

### **API Key Issues**

```bash
# Check if API key is loaded
echo $OPENWEATHERMAP_API_KEY

# Test API key directly
curl "https://api.openweathermap.org/data/2.5/weather?q=Cyberjaya&appid=YOUR_API_KEY"
```

### **Kaggle Authentication**

```bash
# Verify Kaggle setup
kaggle datasets list

# Check if credentials are working
python -c "import kagglehub; print('Kaggle setup working!')"
```

### **CORS Issues**

- Ensure `CORS_ORIGIN=http://localhost:8080` in backend `.env`
- Check frontend is running on port 8080
- Verify no proxy/firewall blocking requests

## 📈 Deployment Environment Variables

### **Vercel (Frontend)**

Add these in Vercel dashboard → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_FIREBASE_API_KEY=...
```

### **Railway/Heroku (Backend)**

Add these in platform dashboard:

```
NODE_ENV=production
OPENWEATHERMAP_API_KEY=...
GOOGLE_MAPS_API_KEY=...
KAGGLE_USERNAME=...
KAGGLE_KEY=...
```

## 🔗 Useful Links

- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [Google Maps Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Kaggle API Documentation](https://www.kaggle.com/docs/api)
- [Firebase Console](https://console.firebase.google.com/)
- [Infura Ethereum API](https://infura.io/)
- [JWT.io Debugger](https://jwt.io/)

## 💡 Pro Tips

1. **Use different API keys** for development and production
2. **Set up monitoring** for API usage limits
3. **Enable billing alerts** for paid services
4. **Document your keys** securely (password manager)
5. **Test integrations regularly** to catch API changes
6. **Use environment-specific configurations** for different deployment stages

---

**⚠️ Important:** Never share or commit actual API keys. Always use `.env.example` for documentation and `.env` for actual secrets!
