# ProfitHive 2.0 - Cyberjaya Smart Retail Platform

A revolutionary AI-powered demand forecasting and blockchain revenue sharing platform designed for retailers in Cyberjaya.

## 🚀 Features

- **AI-Powered Demand Forecasting** - Advanced statistical algorithms with pattern recognition
- **Blockchain Revenue Sharing** - Tokenization and transparent revenue distribution
- **Real-time Analytics** - Comprehensive dashboards and insights
- **Smart City Integration** - Designed specifically for Cyberjaya's tech ecosystem

## 🛠️ Technologies

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express
- **AI/ML**: OpenAI integration with custom algorithms
- **Data Storage**: JSON-based persistent storage
- **Validation**: AJV schema validation

## 📁 Project Structure

```
ProfitHive 2.0/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Application pages
│   │   ├── services/   # API services
│   │   └── hooks/      # React hooks
├── backend/            # Node.js backend server
│   ├── services/       # Business logic services
│   ├── data/          # Data storage
│   └── server.js      # Main server file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Backend Setup**
   ```powershell
   cd backend
   npm install
   ```

2. **Frontend Setup**
   ```powershell
   cd frontend
   npm install
   ```

### Running the Application

#### Option 1: Manual Start
Start backend and frontend separately:

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Option 2: Using PowerShell Script
```powershell
cd frontend
powershell -ExecutionPolicy Bypass -File start-servers.ps1
```

### Access URLs

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Forecast API**: http://localhost:5000/api/forecast

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

## 📊 API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/forecast` - Generate demand forecast
- `GET /api/stats` - Get forecast statistics

## 🌟 Key Features

### AI-Powered Forecasting
- Advanced statistical algorithms
- Pattern recognition and trend analysis
- Market-specific insights for Cyberjaya tech sector

### Blockchain Integration
- Revenue tokenization
- Transparent profit sharing
- Smart contract compatibility

### User Interface
- Modern, responsive design
- Real-time data visualization
- Intuitive dashboard interface

## 🛠️ Development

### Environment Setup
The application uses environment-based configuration. Check the respective `package.json` files for available scripts and dependencies.

### Code Structure
- **Components**: Modular UI components using shadcn/ui
- **Services**: Business logic and API integration
- **Hooks**: Custom React hooks for state management
- **Pages**: Main application routes and views

## 📈 Deployment

Build the frontend for production:
```powershell
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the development team.

---

**ProfitHive 2.0** - Transforming retail through AI and blockchain technology in Cyberjaya's smart city ecosystem.
