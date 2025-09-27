# 🚀 Retail Smart Demand & Revenue Sharing Platform (Cyberjaya Edition)

A complete full-stack application featuring **AI-powered demand forecasting** with backend API integration and modern React frontend.

## 🎯 Features

### Backend (Node.js + Express)
- ✅ **AI Forecasting**: OpenAI GPT-4o-mini integration for intelligent demand prediction
- ✅ **Statistical Fallback**: Moving average + trend analysis when AI is unavailable
- ✅ **Data Validation**: AJV schema validation for robust data integrity
- ✅ **Persistent Storage**: JSON-based forecast history and results storage
- ✅ **CORS Support**: Frontend integration ready
- ✅ **Error Handling**: Comprehensive error handling and retry mechanisms

### Frontend (React + TypeScript + TailwindCSS)
- ✅ **Modern UI**: Beautiful glassmorphism design with animations
- ✅ **Real-time Charts**: Interactive sales and customer forecasts using Recharts
- ✅ **Type Safety**: Full TypeScript integration with proper interfaces
- ✅ **State Management**: Custom React hooks for forecast data management
- ✅ **Error Handling**: User-friendly error states and retry functionality
- ✅ **Responsive Design**: Mobile-first approach with TailwindCSS

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- OpenAI API (gpt-4o-mini)
- AJV for JSON validation
- CORS for cross-origin requests
- ES Modules (modern JavaScript)

**Frontend:**
- React 18 + TypeScript
- TailwindCSS + shadcn/ui components
- Recharts for data visualization
- Custom hooks for state management
- Vite for fast development

## 📋 Prerequisites

- Node.js 18+ installed
- OpenAI API key (optional - system works with statistical fallback)
- Modern web browser
- Terminal/Command Prompt

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file (optional for OpenAI)
copy .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-api-key-here

# Start the backend server
npm start
```

The backend will start on `http://localhost:5000`

**Available Endpoints:**
- `GET /health` - Server health check
- `POST /api/forecast` - Generate demand forecast
- `GET /api/stats` - Get forecast statistics
- `GET /api/forecast/:store` - Get latest forecast for store

### 2. Frontend Setup

```bash
# Navigate to project root (where frontend is located)
cd ..

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Test the Integration

1. **Open Frontend**: Navigate to `http://localhost:5173`
2. **Go to Forecast Page**: Click on the "Forecast" navigation item
3. **Run Demo**: Click "Run Demo Forecast" to generate a sample forecast
4. **View Results**: Explore the interactive charts, KPIs, and AI insights

## 🔧 Configuration Options

### Backend Configuration

**Environment Variables (.env):**
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Without OpenAI API Key:**
The system automatically falls back to statistical forecasting using moving averages and trend analysis.

### API Request Format

**POST /api/forecast**
```json
{
  "store": "Cafe Cyber",
  "city": "Cyberjaya",
  "records": [
    {
      "date": "2025-01-01",
      "customers": 120,
      "sales_rm": 2400
    },
    {
      "date": "2025-01-02", 
      "customers": 135,
      "sales_rm": 2700
    }
  ]
}
```

**Response Format:**
```json
{
  "store": "Cafe Cyber",
  "city": "Cyberjaya",
  "forecast_horizon_days": 14,
  "forecast": [
    {
      "date": "2025-01-15",
      "predicted_sales": 2550,
      "predicted_customers": 128,
      "confidence": 87,
      "short_insight": "Normal weekday traffic expected"
    }
  ],
  "summary": "Forecast summary with 3 recommendations...",
  "metadata": {
    "processing_time_ms": 1250,
    "method": "openai",
    "forecast_id": "cafe-cyber-2025-01-14-143022"
  }
}
```

## 🧪 Testing Features

### Demo Data Generation
The frontend includes a "Run Demo Forecast" button that:
1. Generates 30 days of realistic sample data
2. Sends request to backend API
3. Displays interactive forecast results
4. Shows processing time and method used

### Error Handling Testing
- Try running forecast without backend server running
- Test retry functionality
- Observe fallback to statistical method when OpenAI is unavailable

### Data Visualization
- **Line Chart**: Shows predicted sales trend over 14 days
- **Bar Chart**: Displays expected customer traffic
- **KPI Cards**: Total revenue, average customers, confidence scores
- **AI Insights**: Strategic recommendations and daily insights

## 📁 Project Structure

```
backend/
├── server.js              # Main Express server
├── services/
│   ├── openai-service.js   # OpenAI API integration
│   ├── validation-service.js # AJV validation schemas
│   ├── fallback-service.js  # Statistical forecasting
│   └── storage-service.js   # JSON data storage
├── data/                   # Auto-generated forecast storage
└── package.json

src/
├── pages/
│   └── Forecast.tsx        # Main forecast page component
├── services/
│   └── api-service.ts      # Backend API integration
├── hooks/
│   └── use-forecast.ts     # React hook for forecast state
└── components/ui/          # Reusable UI components
```

## 🎨 UI Features

### Design System
- **Glassmorphism**: Modern glass-effect cards and components
- **Color Themes**: Consistent primary, accent, and semantic colors
- **Animations**: Smooth hover effects and loading states
- **Typography**: Clear hierarchy with gradient text effects

### Interactive Elements
- **Loading States**: Animated spinners during API calls
- **Error States**: Clear error messages with retry buttons
- **Success States**: Visual feedback for successful operations
- **Charts**: Interactive tooltips and responsive design

## 🔍 Troubleshooting

### Backend Issues
```bash
# Check if server is running
curl http://localhost:5000/health

# View server logs for errors
npm start

# Check data directory permissions
ls -la data/
```

### Frontend Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install

# Check TypeScript compilation
npm run build
```

### API Integration Issues
- Verify backend is running on port 5000
- Check browser network tab for request/response details
- Confirm CORS is working (no CORS errors in console)

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Configure proper OpenAI API key
3. Use process manager (PM2) for server management
4. Set up reverse proxy (nginx) for production

### Frontend
1. Build production version: `npm run build`
2. Serve static files with web server
3. Configure API base URL for production backend
4. Enable HTTPS for secure API communication

## 🎯 Next Steps

### Potential Enhancements
- **Database Integration**: Replace JSON files with PostgreSQL/MongoDB
- **User Authentication**: Add login system for multiple stores
- **Real-time Updates**: WebSocket integration for live forecast updates
- **Advanced Analytics**: More sophisticated ML models and metrics
- **Mobile App**: React Native version for mobile access

### API Extensions
- **Batch Processing**: Handle multiple stores in single request
- **Historical Accuracy**: Track forecast accuracy over time
- **Custom Models**: Allow users to train custom forecasting models
- **Integration Hooks**: Webhooks for external system integration

## 💡 Sample API Usage

```javascript
// Frontend API integration example
import { forecastAPI } from '@/services/api-service';

const sampleData = {
  store: "Cafe Cyber",
  city: "Cyberjaya",
  records: [
    { date: "2025-01-01", customers: 120, sales_rm: 2400 },
    { date: "2025-01-02", customers: 135, sales_rm: 2700 }
  ]
};

const result = await forecastAPI.generateForecast(sampleData);
if (result.success) {
  console.log('Forecast:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## 🔮 Facebook Prophet Time Series Forecasting

The platform now includes advanced **Facebook Prophet** time-series forecasting integration for superior prediction accuracy with external regressors.

### 🌟 Prophet Features

- ✅ **Advanced Time Series**: Facebook Prophet for professional-grade forecasting
- ✅ **External Regressors**: Weather, transport, and foot traffic impact integration
- ✅ **Model Persistence**: Trained models saved per retailer for performance
- ✅ **Intelligent Caching**: 10-minute forecast caching with automatic invalidation
- ✅ **Fallback System**: Automatic fallback to enhanced AI if Prophet fails
- ✅ **Performance Optimized**: Concurrent processing with timeout handling

### 🛠️ Prophet Setup

#### 1. Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Install required Python packages
pip install prophet pandas numpy joblib

# Or using conda (recommended)
conda install -c conda-forge prophet pandas numpy joblib
```

#### 2. Environment Configuration

```bash
# Set Python executable path (optional)
export PYTHON_PATH="python3"  # or "conda run -n your_env python" for conda

# For Windows PowerShell
$env:PYTHON_PATH = "python3"
```

### 📊 Prophet API Usage

#### Basic Prophet Forecast

```javascript
// POST /api/forecast with Prophet enabled
const prophetRequest = {
  store: "Tech Cafe Prophet",
  city: "Cyberjaya",
  retailerId: "prophet_001",
  records: [
    { date: "2025-09-01", sales_rm: 2100, customers: 105 },
    { date: "2025-09-02", sales_rm: 2350, customers: 118 },
    // ... at least 10 historical records
  ],
  use_prophet: true,        // Force Prophet usage
  predict_periods: 14       // Forecast 14 days
};

const response = await fetch('/api/forecast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(prophetRequest)
});

const forecast = await response.json();
console.log('Prophet Forecast:', forecast);
```

#### Prophet with External Regressors

```javascript
// Enhanced forecast with external impacts
const enhancedRequest = {
  store: "Smart Mall Cafe",
  city: "Cyberjaya",
  retailerId: "prophet_enhanced_001",
  records: [...], // Historical sales data
  
  // Weather impact regressor
  weatherImpact: {
    impact: {
      temperature: 32,
      condition: 'sunny',
      score: 0.85
    }
  },
  
  // Transport accessibility regressor
  transportImpact: {
    impact: {
      accessibility: 90,
      score: 0.90
    }
  },
  
  // Foot traffic regressor
  footTrafficImpact: {
    impact: {
      level: 85,
      popular_times: [
        { hour: 12, level: 95 },
        { hour: 13, level: 90 },
        { hour: 18, level: 80 }
      ]
    }
  },
  
  use_prophet: true,
  predict_periods: 7
};
```

#### Manual Model Training

```javascript
// POST /api/prophet/train - Admin endpoint
const trainingRequest = {
  retailerId: "my_retailer_001",
  history: [
    { date: "2025-01-01", sales_rm: 2000, customers: 100 },
    { date: "2025-01-02", sales_rm: 2150, customers: 108 },
    // ... minimum 10 records for training
  ]
};

const trainingResult = await fetch('/api/prophet/train', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(trainingRequest)
});
```

### 🗄️ Cache Management

```javascript
// Get cache statistics
const cacheStats = await fetch('/api/prophet/cache/stats');
console.log(await cacheStats.json());

// Clear Prophet cache
const clearResult = await fetch('/api/prophet/cache', { method: 'DELETE' });
console.log(await clearResult.json());
```

### 🧪 Testing Prophet Integration

#### Run Integration Tests

```bash
# Navigate to backend
cd backend

# Run Prophet integration tests
node services/test_prophet_integration.js
```

#### Run API Examples

```bash
# Start the server first
npm start

# In another terminal, run examples
node prophet_api_examples.js
```

#### Test Data Format

```json
{
  "retailer_id": "test_retailer_001",
  "history": [
    {
      "ds": "2025-09-01",
      "y": 2100.50,
      "weather_score": 0.8,
      "transport_score": 0.9,
      "foot_traffic_score": 0.7
    }
  ],
  "predict_periods": 14,
  "freq": "D"
}
```

### 🏗️ Prophet File Structure

```
backend/
├── python/
│   └── prophet_service.py          # Python Prophet service
├── services/
│   ├── prophet-wrapper.js          # Node.js Prophet wrapper
│   ├── enhanced-ai-service.js      # Updated with Prophet integration
│   └── test_prophet_integration.js # Integration tests
├── data/
│   ├── prophet_model_*.joblib      # Trained Prophet models
│   ├── forecast_cache.json         # Prophet forecast cache
│   └── temp/                       # Temporary files
├── test_prophet_input.json         # Test data
└── prophet_api_examples.js         # API usage examples
```

### ⚙️ Prophet Configuration

#### Hyperparameters (in prophet_service.py)

```python
model = Prophet(
    daily_seasonality=True,           # Daily patterns
    weekly_seasonality=True,          # Weekly patterns
    yearly_seasonality=True,          # Yearly patterns
    changepoint_prior_scale=0.05,     # Trend flexibility
    interval_width=0.8                # 80% confidence interval
)

# External regressors
model.add_regressor('weather_score')
model.add_regressor('transport_score')
model.add_regressor('foot_traffic_score')
```

#### Caching Configuration (in prophet-wrapper.js)

```javascript
const CACHE_TTL_MS = 10 * 60 * 1000;  // 10 minutes
const TIMEOUT_MS = 120000;             // 2 minutes timeout
const MAX_RETRIES = 3;                 // Retry attempts
```

### 🔍 Prophet Troubleshooting

#### Common Issues

1. **Prophet Installation Issues**
   ```bash
   # For Windows users with conda
   conda install -c conda-forge prophet
   
   # For macOS users
   brew install gcc
   pip install prophet
   
   # For Linux users
   sudo apt-get install python3-dev
   pip install prophet
   ```

2. **Python Path Issues**
   ```bash
   # Check Python executable
   which python3
   
   # Set environment variable
   export PYTHON_PATH="/usr/local/bin/python3"
   ```

3. **Insufficient Training Data**
   - Prophet requires minimum 10 historical data points
   - Ensure consistent date format (YYYY-MM-DD)
   - Check for missing values in regressors

4. **Performance Issues**
   - Use model caching for repeated forecasts
   - Train models manually for heavy usage retailers
   - Monitor cache hit rates via `/api/prophet/cache/stats`

#### Debug Mode

```bash
# Enable debug logging
export NODE_ENV=development

# Check Prophet service logs
tail -f backend/data/prophet_service.log
```

### 📈 Prophet vs Enhanced AI Comparison

| Feature | Enhanced AI | Facebook Prophet |
|---------|-------------|------------------|
| Setup Complexity | Low | Medium |
| Prediction Accuracy | Good | Excellent |
| External Regressors | Basic | Advanced |
| Seasonality Detection | Manual | Automatic |
| Training Time | Fast | Medium |
| Memory Usage | Low | Medium |
| Scalability | High | Medium |

### 🚀 Production Deployment

#### Docker Configuration

```dockerfile
# Add to your Dockerfile
RUN pip install prophet pandas numpy joblib
COPY backend/python/ /app/backend/python/
```

#### Environment Variables

```bash
PYTHON_PATH=/usr/local/bin/python3
PROPHET_CACHE_TTL=600000
PROPHET_TIMEOUT=120000
PROPHET_MAX_RETRIES=3
```

#### CI/CD Pipeline

```yaml
# Add to your CI pipeline
- name: Install Prophet
  run: |
    pip install prophet pandas numpy joblib
    
- name: Test Prophet Integration
  run: |
    cd backend
    node services/test_prophet_integration.js
```

---

**🎉 Congratulations!** You now have a fully integrated AI-powered demand forecasting platform with **Facebook Prophet time-series forecasting**, modern frontend, and robust backend APIs. The system includes advanced external regressor support, intelligent caching, and comprehensive fallback mechanisms for production-grade reliability.