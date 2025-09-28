#!/usr/bin/env python3
"""
Kaggle Transportation Data Service for Cyberjaya
Fetches real transportation data from Kaggle API for enhanced forecasting

Author: Cyberjaya Team
Dataset: shahmirvarqha/transportation-in-cyberjaya-malaysia
Features: Real bus routes, schedules, traffic patterns, congestion data
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime, time
import pandas as pd
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Default constants
DEFAULT_CACHE_HOURS = 6  # Cache data for 6 hours
CACHE_FILE = 'data/kaggle_transport_cache.json'

class KaggleTransportService:
    """Service for fetching and processing Cyberjaya transportation data from Kaggle"""
    
    def __init__(self):
        self.dataset_name = "shahmirvarqha/transportation-in-cyberjaya-malaysia"
        self.cache_file = CACHE_FILE
        self.cache_duration_hours = DEFAULT_CACHE_HOURS
        
    def load_transport_data(self, force_refresh=False):
        """
        Load transportation data from Kaggle API with caching
        
        Args:
            force_refresh (bool): Force refresh from Kaggle API
            
        Returns:
            dict: Processed transportation data with metrics
        """
        try:
            # Check cache first (unless force refresh)
            if not force_refresh and self._is_cache_valid():
                logger.info("Loading transportation data from cache")
                return self._load_from_cache()
            
            logger.info("Fetching fresh transportation data from Kaggle API...")
            
            # Import kagglehub (install if needed)
            try:
                import kagglehub
            except ImportError:
                logger.error("kagglehub not installed. Run: pip install kagglehub[pandas-datasets]")
                return self._get_fallback_data()
            
            # Download the dataset from Kaggle
            dataset_path = kagglehub.dataset_download(self.dataset_name)
            logger.info(f"Dataset downloaded to: {dataset_path}")
            
            # List available files in the dataset
            import glob
            csv_files = glob.glob(f"{dataset_path}/*.csv")
            logger.info(f"Available CSV files: {csv_files}")
            
            if not csv_files:
                logger.error("No CSV files found in dataset")
                return self._get_fallback_data()
            
            # Load the main transportation data file
            # Use the kumpool.csv file which has the ridership and route data
            kumpool_file = None
            tryke_file = None
            bus_stops_file = None
            
            for file in csv_files:
                if 'kumpool' in file.lower():
                    kumpool_file = file
                elif 'tryke' in file.lower():
                    tryke_file = file
                elif 'bus_stops' in file.lower() or 'cyberview' in file.lower():
                    bus_stops_file = file
            
            # Load the main ridership data
            if kumpool_file:
                df = pd.read_csv(kumpool_file)
                logger.info(f"Loaded kumpool data with {len(df)} ridership records")
            else:
                logger.warning("kumpool.csv not found, using first available file")
                df = pd.read_csv(csv_files[0])
            
            logger.info(f"Loaded dataset with {len(df)} records")
            logger.info("First 5 records:")
            print(df.head())
            
            # Process the data for ProfitHive usage
            processed_data = self._process_transport_data(df, kumpool_file, tryke_file, bus_stops_file)
            
            # Cache the processed data
            self._save_to_cache(processed_data)
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Failed to load transportation data from Kaggle: {str(e)}")
            return self._get_fallback_data()
    
    def _process_transport_data(self, df, kumpool_file=None, tryke_file=None, bus_stops_file=None):
        """
        Process raw Kaggle data into ProfitHive format
        
        Args:
            df: Raw pandas DataFrame from Kaggle
            kumpool_file: Path to kumpool.csv with ridership data
            tryke_file: Path to tryke.csv with ride-sharing data  
            bus_stops_file: Path to bus stops location data
            
        Returns:
            dict: Processed transportation metrics
        """
        try:
            current_hour = datetime.now().hour
            current_day = datetime.now().weekday()  # 0=Monday, 6=Sunday
            
            # Load additional dataset files for comprehensive analysis
            kumpool_data = pd.read_csv(kumpool_file) if kumpool_file else None
            tryke_data = pd.read_csv(tryke_file) if tryke_file else None
            bus_stops_data = pd.read_csv(bus_stops_file) if bus_stops_file else None
            
            # Convert datetime column for time-based analysis
            if kumpool_data is not None and 'datetime' in kumpool_data.columns:
                kumpool_data['datetime'] = pd.to_datetime(kumpool_data['datetime'])
                kumpool_data['hour'] = kumpool_data['datetime'].dt.hour
                kumpool_data['day_of_week'] = kumpool_data['datetime'].dt.dayofweek
                logger.info(f"Processed {len(kumpool_data)} kumpool records with datetime")
            
            if tryke_data is not None and 'pickup_datetime' in tryke_data.columns:
                tryke_data['pickup_datetime'] = pd.to_datetime(tryke_data['pickup_datetime'])
                tryke_data['hour'] = tryke_data['pickup_datetime'].dt.hour
                tryke_data['day_of_week'] = tryke_data['pickup_datetime'].dt.dayofweek
                logger.info(f"Processed {len(tryke_data)} tryke records with datetime")
            
            # Extract key metrics from the datasets
            bus_routes = self._analyze_bus_routes_real(kumpool_data, bus_stops_data, current_hour, current_day)
            ride_sharing = self._analyze_ride_sharing(tryke_data, current_hour, current_day)
            congestion_data = self._analyze_congestion_real(kumpool_data, tryke_data, current_hour, current_day)
            peak_hours = self._analyze_peak_hours_real(kumpool_data, tryke_data)
            
            # Calculate real-time metrics from actual data
            bus_availability = self._calculate_bus_availability_real(bus_routes, kumpool_data, current_hour, current_day)
            ride_service_level = self._calculate_ride_service_real(ride_sharing, tryke_data, current_hour, current_day)
            congestion_level = self._calculate_current_congestion_real(congestion_data, current_hour, current_day)
            
            # Calculate overall transportation impact score using real data
            transport_score = self._calculate_transport_score_real(
                bus_availability, ride_service_level, congestion_level, 
                len(kumpool_data) if kumpool_data is not None else 0,
                len(tryke_data) if tryke_data is not None else 0
            )
            
            return {
                'bus_availability': round(bus_availability, 1),
                'train_frequency': round(ride_service_level, 1),  # Using ride-sharing as proxy for train
                'congestion_level': round(congestion_level, 1),
                'impact_score': round(transport_score, 1),
                'peak_hour': self._is_peak_hour_real(current_hour, peak_hours),
                'bus_routes': bus_routes,
                'ride_sharing_stats': ride_sharing,
                'peak_patterns': peak_hours,
                'data_summary': {
                    'kumpool_records': len(kumpool_data) if kumpool_data is not None else 0,
                    'tryke_records': len(tryke_data) if tryke_data is not None else 0,
                    'bus_stops': len(bus_stops_data) if bus_stops_data is not None else 0
                },
                'real_data': True,
                'source': 'kaggle_api',
                'dataset': self.dataset_name,
                'timestamp': datetime.now().isoformat(),
                'cache_expires': (datetime.now().timestamp() + (self.cache_duration_hours * 3600))
            }
            
        except Exception as e:
            logger.error(f"Error processing transportation data: {str(e)}")
            return self._get_fallback_data()
    
    def _analyze_bus_routes_real(self, kumpool_data, bus_stops_data, hour, day):
        """Analyze bus route data from real Kaggle dataset"""
        try:
            if kumpool_data is None or len(kumpool_data) == 0:
                return self._get_default_bus_routes(hour, day)
            
            # Analyze route popularity from ridership data
            route_analysis = kumpool_data.groupby(['from_stop', 'to_stop']).agg({
                'riders': ['count', 'sum', 'mean'],
                'total_km': 'mean'
            }).reset_index()
            
            # Get top 5 most popular routes
            route_analysis['total_rides'] = route_analysis[('riders', 'sum')]
            top_routes = route_analysis.nlargest(5, 'total_rides')
            
            routes = []
            for idx, route in top_routes.iterrows():
                from_stop = route[('from_stop', '')]
                to_stop = route[('to_stop', '')]
                total_rides = route[('riders', 'sum')]
                avg_distance = route[('total_km', 'mean')]
                
                # Calculate service metrics based on real data
                frequency = max(5, min(30, 60 - (total_rides / 100)))  # More rides = higher frequency
                reliability = 75 + min(20, total_rides / 500)  # More usage = more reliable
                
                routes.append({
                    'route': f"{from_stop[:15]}→{to_stop[:15]}" if isinstance(from_stop, str) else f"Route {idx+1}",
                    'frequency': round(frequency, 1),
                    'reliability': round(reliability, 1),
                    'total_rides': int(total_rides),
                    'avg_distance': round(avg_distance, 2) if not pd.isna(avg_distance) else 5.0,
                    'current_service_level': self._get_service_level_by_time_real(hour, day, total_rides)
                })
            
            return routes[:3]  # Return top 3 routes
            
        except Exception as e:
            logger.warning(f"Error analyzing real bus routes: {e}")
            return self._get_default_bus_routes(hour, day)
    
    def _analyze_ride_sharing(self, tryke_data, hour, day):
        """Analyze ride-sharing data from tryke dataset"""
        try:
            if tryke_data is None or len(tryke_data) == 0:
                return self._get_default_ride_sharing(hour, day)
            
            # Analyze ride patterns
            current_hour_rides = tryke_data[tryke_data['hour'] == hour] if 'hour' in tryke_data.columns else tryke_data.sample(100)
            
            # Calculate metrics
            avg_duration = current_hour_rides['total_duration'].mean() if 'total_duration' in current_hour_rides.columns else 900
            total_rides_today = len(tryke_data[tryke_data['day_of_week'] == day]) if 'day_of_week' in tryke_data.columns else len(tryke_data)
            
            return {
                'avg_ride_duration': round(avg_duration / 60, 1) if avg_duration > 0 else 15.0,  # Convert to minutes
                'rides_current_hour': len(current_hour_rides),
                'total_rides_today': total_rides_today,
                'service_availability': min(95, 60 + (total_rides_today / 100)),
                'peak_demand_hours': self._get_peak_ride_hours(tryke_data)
            }
            
        except Exception as e:
            logger.warning(f"Error analyzing ride sharing data: {e}")
            return self._get_default_ride_sharing(hour, day)
    
    def _analyze_congestion_real(self, kumpool_data, tryke_data, hour, day):
        """Analyze traffic congestion from real ridership patterns"""
        try:
            congestion_indicators = []
            
            if kumpool_data is not None and 'hour' in kumpool_data.columns:
                # High ridership = higher congestion
                hourly_ridership = kumpool_data.groupby('hour')['riders'].sum()
                max_ridership = hourly_ridership.max() if len(hourly_ridership) > 0 else 100
                
                hourly_congestion = {}
                for h in range(24):
                    ridership = hourly_ridership.get(h, 0)
                    # Convert ridership to congestion level (0-100)
                    congestion = min(80, (ridership / max_ridership) * 60) if max_ridership > 0 else 25
                    hourly_congestion[h] = congestion
                
                congestion_indicators.append(hourly_congestion.get(hour, 25))
            
            if tryke_data is not None and 'hour' in tryke_data.columns:
                # High ride demand = congestion
                hourly_rides = tryke_data.groupby('hour').size()
                max_rides = hourly_rides.max() if len(hourly_rides) > 0 else 50
                
                current_rides = hourly_rides.get(hour, 0)
                ride_congestion = min(70, (current_rides / max_rides) * 50) if max_rides > 0 else 20
                congestion_indicators.append(ride_congestion)
            
            # Average the indicators
            avg_congestion = sum(congestion_indicators) / len(congestion_indicators) if congestion_indicators else 30
            
            return {
                'current_level': round(avg_congestion, 1),
                'peak_congestion_hours': [7, 8, 9, 17, 18, 19],  # Standard peak hours
                'data_source': 'real_ridership_patterns'
            }
            
        except Exception as e:
            logger.warning(f"Error analyzing real congestion data: {e}")
            return {'current_level': 35.0, 'peak_congestion_hours': [7, 8, 17, 18, 19]}
    
    def _analyze_peak_hours_real(self, kumpool_data, tryke_data):
        """Analyze peak transportation hours from real data"""
        try:
            all_peak_hours = set()
            
            if kumpool_data is not None and 'hour' in kumpool_data.columns:
                # Find peak ridership hours
                hourly_ridership = kumpool_data.groupby('hour')['riders'].sum()
                peak_threshold = hourly_ridership.quantile(0.7)
                bus_peaks = hourly_ridership[hourly_ridership >= peak_threshold].index.tolist()
                all_peak_hours.update(bus_peaks)
            
            if tryke_data is not None and 'hour' in tryke_data.columns:
                # Find peak ride hours
                hourly_rides = tryke_data.groupby('hour').size()
                ride_threshold = hourly_rides.quantile(0.7)
                ride_peaks = hourly_rides[hourly_rides >= ride_threshold].index.tolist()
                all_peak_hours.update(ride_peaks)
            
            peak_hours = sorted(list(all_peak_hours))
            
            return {
                'morning_peak': [h for h in peak_hours if 6 <= h <= 10],
                'lunch_peak': [h for h in peak_hours if 11 <= h <= 14],
                'evening_peak': [h for h in peak_hours if 16 <= h <= 20],
                'all_peaks': peak_hours,
                'data_source': 'real_ridership_analysis'
            }
            
        except Exception as e:
            logger.warning(f"Error analyzing real peak hours: {e}")
            return {
                'morning_peak': [7, 8, 9],
                'lunch_peak': [12, 13],
                'evening_peak': [17, 18, 19],
                'all_peaks': [7, 8, 9, 12, 13, 17, 18, 19]
            }
    
    def _calculate_bus_availability_real(self, routes, kumpool_data, hour, day):
        """Calculate bus availability from real route data"""
        try:
            if not routes:
                return 70.0
            
            # Base availability from route service levels
            service_levels = [route.get('current_service_level', 75) for route in routes]
            base_availability = sum(service_levels) / len(service_levels)
            
            # Adjust based on real ridership data
            if kumpool_data is not None and 'hour' in kumpool_data.columns:
                current_hour_data = kumpool_data[kumpool_data['hour'] == hour]
                if len(current_hour_data) > 0:
                    # More rides = better availability (people can actually catch buses)
                    ride_boost = min(15, len(current_hour_data) / 10)
                    base_availability += ride_boost
            
            # Time-based adjustments
            if self._is_peak_hour_real(hour):
                base_availability *= 1.1  # 10% boost during peak
            elif 22 <= hour or hour <= 6:
                base_availability *= 0.6  # Night service reduction
            
            return min(100, max(20, base_availability))
            
        except Exception as e:
            logger.warning(f"Error calculating real bus availability: {e}")
            return 75.0
    
    def _calculate_ride_service_real(self, ride_data, tryke_data, hour, day):
        """Calculate ride service level from real tryke data"""
        try:
            if not ride_data:
                return 75.0
            
            base_service = ride_data.get('service_availability', 75)
            
            # Adjust based on current hour demand
            current_rides = ride_data.get('rides_current_hour', 0)
            if current_rides > 20:
                base_service += 10  # High demand = good availability
            elif current_rides < 5:
                base_service -= 10  # Low demand = reduced service
            
            return min(100, max(30, base_service))
            
        except Exception as e:
            logger.warning(f"Error calculating ride service: {e}")
            return 75.0
    
    def _calculate_current_congestion_real(self, congestion_data, hour, day):
        """Calculate current congestion from real data"""
        try:
            base_congestion = congestion_data.get('current_level', 35)
            
            # Weekend adjustment
            if day >= 5:  # Weekend
                base_congestion *= 0.8
            
            return min(100, max(0, base_congestion))
            
        except Exception as e:
            logger.warning(f"Error calculating real congestion: {e}")
            return 35.0
    
    def _calculate_transport_score_real(self, bus_avail, ride_service, congestion, bus_records, ride_records):
        """Calculate transportation score using real data volume as quality indicator"""
        try:
            # Base score calculation
            positive_impact = (bus_avail + ride_service) / 2
            negative_impact = congestion
            
            base_score = (positive_impact * 0.6) + ((100 - negative_impact) * 0.4)
            
            # Data quality bonus (more data = more reliable score)
            data_quality_bonus = 0
            if bus_records > 1000:
                data_quality_bonus += 5
            if ride_records > 1000:
                data_quality_bonus += 5
            
            final_score = base_score + data_quality_bonus
            
            return min(100, max(0, final_score))
            
        except Exception as e:
            logger.warning(f"Error calculating transport score: {e}")
            return 75.0
    
    def _is_peak_hour_real(self, hour, peak_data=None):
        """Check if current hour is peak based on real data"""
        try:
            if peak_data and 'all_peaks' in peak_data:
                return hour in peak_data['all_peaks']
            return hour in [7, 8, 9, 12, 13, 17, 18, 19]
        except:
            return hour in [7, 8, 9, 12, 13, 17, 18, 19]
    
    def _get_service_level_by_time_real(self, hour, day, ridership_volume):
        """Get service level based on time and ridership volume"""
        try:
            base_level = 75
            
            # Time adjustments
            if self._is_peak_hour_real(hour):
                base_level += 15
            elif 22 <= hour or hour <= 6:
                base_level -= 20
            
            # Ridership volume adjustment (more riders = better service)
            volume_bonus = min(10, ridership_volume / 100)
            base_level += volume_bonus
            
            return min(100, max(30, base_level + np.random.randint(-5, 5)))
            
        except:
            return 75
    
    def _get_peak_ride_hours(self, tryke_data):
        """Extract peak ride hours from tryke data"""
        try:
            if tryke_data is not None and 'hour' in tryke_data.columns:
                hourly_rides = tryke_data.groupby('hour').size()
                peak_threshold = hourly_rides.quantile(0.75)
                return hourly_rides[hourly_rides >= peak_threshold].index.tolist()
            return [7, 8, 17, 18, 19]
        except:
            return [7, 8, 17, 18, 19]
    
    def _get_default_bus_routes(self, hour, day):
        """Default bus routes when real data unavailable"""
        return [
            {'route': 'Cyberjaya→KLIA', 'frequency': 15, 'reliability': 85, 'current_service_level': 90},
            {'route': 'Putrajaya→Cyberjaya', 'frequency': 20, 'reliability': 80, 'current_service_level': 85},
            {'route': 'MMU→Cyberjaya Central', 'frequency': 12, 'reliability': 88, 'current_service_level': 87}
        ]
    
    def _get_default_ride_sharing(self, hour, day):
        """Default ride sharing data when real data unavailable"""  
        return {
            'avg_ride_duration': 15.0,
            'rides_current_hour': 25,
            'total_rides_today': 300,
            'service_availability': 80,
            'peak_demand_hours': [7, 8, 17, 18, 19]
        }
    
    def _is_cache_valid(self):
        """Check if cached data is still valid"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r') as f:
                    cache_data = json.load(f)
                
                cache_expires = cache_data.get('cache_expires', 0)
                return datetime.now().timestamp() < cache_expires
            return False
        except:
            return False
    
    def _load_from_cache(self):
        """Load transportation data from cache"""
        try:
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        except:
            return self._get_fallback_data()
    
    def _save_to_cache(self, data):
        """Save transportation data to cache"""
        try:
            os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
            with open(self.cache_file, 'w') as f:
                json.dump(data, f, indent=2)
            logger.info("Transportation data cached successfully")
        except Exception as e:
            logger.warning(f"Failed to cache data: {e}")
    
    def _get_fallback_data(self):
        """Fallback transportation data if Kaggle API fails"""
        current_hour = datetime.now().hour
        
        return {
            'bus_availability': 85.0 if self._is_peak_hour_real(current_hour) else 75.0,
            'train_frequency': 90.0 if self._is_peak_hour_real(current_hour) else 80.0,
            'congestion_level': 55.0 if self._is_peak_hour_real(current_hour) else 35.0,
            'impact_score': 75.0,
            'peak_hour': self._is_peak_hour_real(current_hour),
            'real_data': False,
            'source': 'fallback',
            'timestamp': datetime.now().isoformat(),
            'note': 'Using fallback data - Kaggle API unavailable'
        }

def main():
    """Main entry point for the service"""
    parser = argparse.ArgumentParser(description='Kaggle Transportation Data Service')
    parser.add_argument('--action', choices=['fetch', 'status'], default='fetch',
                      help='Action to perform')
    parser.add_argument('--force-refresh', action='store_true',
                      help='Force refresh from Kaggle API')
    parser.add_argument('--format', choices=['json', 'summary'], default='json',
                      help='Output format')
    
    args = parser.parse_args()
    
    try:
        service = KaggleTransportService()
        
        if args.action == 'fetch':
            data = service.load_transport_data(force_refresh=args.force_refresh)
            
            if args.format == 'json':
                print(json.dumps(data, indent=2))
            else:
                print(f"🚌 Transportation Data Summary:")
                print(f"   Bus Availability: {data.get('bus_availability', 'N/A')}%")
                print(f"   Train Frequency: {data.get('train_frequency', 'N/A')}%") 
                print(f"   Congestion Level: {data.get('congestion_level', 'N/A')}%")
                print(f"   Overall Impact: {data.get('impact_score', 'N/A')}/100")
                print(f"   Peak Hour: {'Yes' if data.get('peak_hour') else 'No'}")
                print(f"   Data Source: {data.get('source', 'Unknown')}")
        
        elif args.action == 'status':
            print(f"Kaggle Transportation Service Status:")
            print(f"Dataset: {service.dataset_name}")
            print(f"Cache File: {service.cache_file}")
            print(f"Cache Valid: {'Yes' if service._is_cache_valid() else 'No'}")
        
    except Exception as e:
        logger.error(f"Service failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()