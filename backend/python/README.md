# ProfitHive Python AI Services

This directory contains the Python-based AI services for advanced forecasting capabilities in ProfitHive.

## Services

### 1. Prophet Forecasting Service (`prophet_service.py`)

Facebook Prophet-based time series forecasting with external regressors.

**Features:**

- Advanced time series forecasting using Facebook Prophet
- External regressors support (weather, transport, foot traffic)
- Model training and persistence
- Confidence scoring
- Multi-retailer support

**Usage:**

```bash
# Generate predictions from stdin
echo '{"history": [...], "predict_periods": 14, "retailer_id": "abc123"}' | python prophet_service.py predict

# Train a model with data file
python prophet_service.py train --data training_data.json
```

### 2. Kaggle Transport Service (`kaggle_transport_service.py`)

Real transportation data fetching from Kaggle API for Cyberjaya, Malaysia.

**Features:**

- Real-time transportation data from Kaggle
- Bus route analysis and availability scoring
- Traffic congestion patterns
- Peak hour identification
- Data caching for performance

**Usage:**

```bash
# Fetch current transportation data
python kaggle_transport_service.py --action fetch

# Force refresh from Kaggle API
python kaggle_transport_service.py --action fetch --force-refresh

# Get summary format
python kaggle_transport_service.py --action fetch --format summary
```

## Installation

### 1. Install Python Dependencies

```bash
# Navigate to python directory
cd backend/python

# Install all required packages
pip install -r requirements.txt
```

### 2. Setup Kaggle API (Optional)

For real transportation data access:

1. Create Kaggle account at https://kaggle.com
2. Go to Account settings and create API token
3. Download `kaggle.json` and place in `~/.kaggle/` directory
4. Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

### 3. Environment Variables

The Python services integrate with the following environment variables:

```bash
# Optional: Kaggle credentials (if not using ~/.kaggle/kaggle.json)
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_api_key
```

## Integration with Node.js Backend

The Python services are called by the Node.js backend through the `prophet-wrapper.js` service:

### Prophet Integration

```javascript
// In enhanced-ai-service.js
const prophetResult = await this.getProphetForecast(history, {
  predict_periods: 14,
  retailer_id: businessData.id,
});
```

### Transport Data Integration

```javascript
// In external-data-service.js - Enhanced with Kaggle support
const transportData = await this.loadCyberjayanTransportData();
```

## Data Flow

1. **Node.js Request** → `enhanced-ai-service.js`
2. **Prophet Forecast** → `prophet-wrapper.js` → `prophet_service.py`
3. **Transport Data** → `external-data-service.js` → `kaggle_transport_service.py`
4. **Combined Results** → Enhanced AI predictions

## File Structure

```
backend/python/
├── prophet_service.py          # Facebook Prophet forecasting
├── kaggle_transport_service.py # Kaggle transport data
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Troubleshooting

### Common Issues

1. **Import Errors**

   ```bash
   # Install missing packages
   pip install prophet pandas numpy joblib kagglehub
   ```

2. **Kaggle API Issues**

   ```bash
   # Verify API setup
   kaggle datasets list
   ```

3. **Prophet Model Issues**
   ```bash
   # Clear model cache if corrupted
   rm -rf ../data/prophet_model_*.joblib
   ```

### Log Files

- Prophet service logs: `../data/prophet_service.log`
- Kaggle service uses console logging

## Performance Notes

- Prophet models are cached for each retailer
- Kaggle data is cached for 6 hours by default
- First Prophet prediction may be slow due to model training
- Subsequent predictions use cached models for speed

## API Examples

### Prophet Service Input

```json
{
  "history": [
    {
      "ds": "2025-01-01",
      "y": 123.4,
      "weather_score": 0.8,
      "transport_score": 0.3,
      "foot_traffic_score": 0.6
    }
  ],
  "predict_periods": 14,
  "freq": "D",
  "retailer_id": "abc123"
}
```

### Prophet Service Output

```json
{
  "predictions": [
    {
      "ds": "2025-10-01",
      "yhat": 120.5,
      "yhat_lower": 110.0,
      "yhat_upper": 131.0
    }
  ],
  "model_meta": {
    "trained_on": "2025-09-28",
    "method": "prophet",
    "retailer_id": "abc123"
  },
  "confidence": 0.85
}
```

### Kaggle Service Output

```json
{
  "bus_availability": 85.0,
  "train_frequency": 90.0,
  "congestion_level": 45.0,
  "impact_score": 78.5,
  "peak_hour": true,
  "real_data": true,
  "source": "kaggle_api",
  "timestamp": "2025-01-20T10:30:00"
}
```
