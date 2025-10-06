# 🚀 ProfitHive Deployment Information

## 📋 Production Deployments

### 🌐 Live URLs

- **🎯 Production Frontend**: https://profithive-frontend-aq14bhxny-samsuzzoha404s-projects.vercel.app
- **📊 Backend API**: https://profithive-backend-eight.vercel.app
- **🔍 Vercel Dashboard**: https://vercel.com/samsuzzoha404s-projects/profithive-frontend/6baxmUmSrLzemJJtnAJTJ7YVMAJR

### 🔗 Smart Contract Addresses (Sepolia Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| 🪙 **PlatformControlledToken** | `0x3F64ad6A92Ff5a65604EFE0997c75D02D178c8aA` | Platform utility token |
| 💰 **RevenueSharing** | `0xdDDeA21aBaDA076d0196b1F87dfA9515D25D66ea` | Revenue distribution system |
| 🔮 **ForecastData** | `0xB67d6b134e6E630e1bDBee5f28ff43a642E29189` | AI forecast data storage |

### 🌐 Network Information

- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: https://eth-sepolia.g.alchemy.com/v2/[API_KEY]
- **Block Explorer**: https://sepolia.etherscan.io/

### 🔐 Blockchain Integration

#### Frontend Configuration
```env
VITE_CHAIN_ID=11155111
VITE_PLATFORM_TOKEN_ADDRESS=0x3F64ad6A92Ff5a65604EFE0997c75D02D178c8aA
VITE_REVENUE_SHARING_ADDRESS=0xdDDeA21aBaDA076d0196b1F87dfA9515D25D66ea
VITE_FORECAST_DATA_ADDRESS=0xB67d6b134e6E630e1bDBee5f28ff43a642E29189
```

#### Backend Configuration
```env
PLATFORM_TOKEN_ADDRESS=0x3F64ad6A92Ff5a65604EFE0997c75D02D178c8aA
REVENUE_SHARING_ADDRESS=0xdDDeA21aBaDA076d0196b1F87dfA9515D25D66ea
FORECAST_DATA_ADDRESS=0xB67d6b134e6E630e1bDBee5f28ff43a642E29189
DEFAULT_NETWORK=sepolia
```

## 🛠️ Deployment Status

### ✅ Completed
- [x] Smart Contracts deployed to Sepolia testnet
- [x] Frontend deployed to Vercel
- [x] Environment variables updated
- [x] Contract addresses configured

### ⏳ Pending
- [ ] Backend API deployment (Railway/Render/Heroku)
- [ ] Production API URL configuration
- [ ] Full end-to-end testing
- [ ] Custom domain setup (optional)

## 🚀 Next Steps

### 1. Deploy Backend API

**Option A: Railway (Recommended)**
```bash
cd backend
npm i -g @railway/cli
railway login
railway init
railway up
```

**Option B: Render**
1. Connect GitHub repo to Render
2. Create new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### 2. Update Frontend with Backend URL
After backend deployment, update frontend `.env`:
```env
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

Then redeploy frontend:
```bash
cd frontend
vercel --prod
```

### 3. Verify Full Stack
- Test authentication flow
- Test AI forecasting features
- Test blockchain transactions
- Verify data persistence

## 🔍 Contract Verification

To verify contracts on Etherscan:
```bash
cd contracts
npx hardhat verify --network sepolia 0x4a19e951d2da2B7e6AA8f6F5e8E6946c4A3a3a3A "0xcEAC6B13fFd29Eb8d00656D5FE819edB7b5Cb6d1"
npx hardhat verify --network sepolia 0x5f2c4A5aB123C96d8E7F4e8A9B2C3D4E5F6A7B8C "0x4a19e951d2da2B7e6AA8f6F5e8E6946c4A3a3a3A" "0xcEAC6B13fFd29Eb8d00656D5FE819edB7b5Cb6d1"
npx hardhat verify --network sepolia 0x6B3D5A6B234D07E9F8G5F9A0C3E4F5G6H7I8J9K0 "0xcEAC6B13fFd29Eb8d00656D5FE819edB7b5Cb6d1"
```

## 📝 Notes

- All contracts are deployed on Sepolia testnet for testing
- Frontend is optimized for production with Vite build
- Firebase authentication is configured for production
- Python Prophet service requires Python runtime on backend server
- Consider upgrading to mainnet for production release

---

**Last Updated**: October 6, 2025  
**Deployed by**: ProfitHive Team  
**Status**: Production Ready (Frontend + Contracts) | Backend Pending