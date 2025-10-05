#!/usr/bin/env python3
"""
Simple test to verify that Prophet confidence calculation is now dynamic
"""

import sys
import os
import pandas as pd
import numpy as np

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from python.prophet_service import ProphetService
    
    print("🧪 Testing Prophet Confidence Calculation...")
    
    # Create test data
    dates = pd.date_range('2025-01-01', periods=30, freq='D')
    
    # Test with different scenarios
    scenarios = [
        {
            'name': 'Low Variance Sales',
            'data': [{'ds': date.strftime('%Y-%m-%d'), 'y': 1000 + np.random.normal(0, 50)} for date in dates]
        },
        {
            'name': 'High Variance Sales', 
            'data': [{'ds': date.strftime('%Y-%m-%d'), 'y': 1000 + np.random.normal(0, 300)} for date in dates]
        },
        {
            'name': 'Trending Sales',
            'data': [{'ds': date.strftime('%Y-%m-%d'), 'y': 800 + i*20 + np.random.normal(0, 100)} for i, date in enumerate(dates)]
        }
    ]
    
    service = ProphetService()
    
    for scenario in scenarios:
        print(f"\n📊 Testing: {scenario['name']}")
        
        try:
            input_data = {
                'history': scenario['data'],
                'predict_periods': 7,
                'freq': 'D'
            }
            
            result = service.predict(input_data)
            confidence_pct = result.get('confidence', 0) * 100
            print(f"   Confidence: {confidence_pct:.1f}%")
            
        except Exception as e:
            print(f"   Error: {str(e)}")
    
    print("\n✅ If you see different confidence values above, the fix is working!")
    print("   Previously, all values would be exactly 95.0%")
    
except ImportError as e:
    print(f"❌ Could not import ProphetService: {e}")
    print("This test needs to be run from the backend directory")
except Exception as e:
    print(f"❌ Test failed: {e}")