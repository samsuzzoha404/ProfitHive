import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets } from 'lucide-react';

interface WeatherImpactCardProps {
  weatherData?: {
    temp: number;
    humidity: number;
    condition: string;
    description: string;
    impactScore: number;
    timestamp: string;
    fallback?: boolean;
  };
}

const WeatherImpactCard: React.FC<WeatherImpactCardProps> = ({ weatherData }) => {
  if (!weatherData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Impact
          </CardTitle>
          <CardDescription>Real-time weather analysis for Cyberjaya</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Cloud className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Weather data loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Weather icon mapping
  const getWeatherIcon = (condition: string) => {
    const iconClass = "h-8 w-8";
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      case 'snow':
        return <CloudSnow className={`${iconClass} text-blue-300`} />;
      case 'clouds':
      case 'partly cloudy':
      case 'cloudy':
        return <Cloud className={`${iconClass} text-gray-500`} />;
      default:
        return <Wind className={`${iconClass} text-gray-400`} />;
    }
  };

  // Impact score color and description
  const getImpactInfo = (score: number) => {
    if (score >= 75) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Positive Impact',
        description: 'Great weather for customer visits'
      };
    } else if (score >= 50) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Moderate Impact',
        description: 'Normal weather conditions'
      };
    } else {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Negative Impact',
        description: 'Weather may reduce foot traffic'
      };
    }
  };

  const impactInfo = getImpactInfo(weatherData.impactScore);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {getWeatherIcon(weatherData.condition)}
          Weather Impact
          {weatherData.fallback && (
            <Badge variant="outline" className="ml-auto text-xs">
              Estimated
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Real-time weather analysis for Cyberjaya
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Conditions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Temperature</span>
            </div>
            <p className="text-2xl font-bold">{weatherData.temp}°C</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Humidity</span>
            </div>
            <p className="text-2xl font-bold">{weatherData.humidity}%</p>
          </div>
        </div>

        {/* Weather Condition */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Condition</p>
          <div className="flex items-center gap-2">
            {getWeatherIcon(weatherData.condition)}
            <span className="font-medium capitalize">{weatherData.description}</span>
          </div>
        </div>

        {/* Impact Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Business Impact</span>
            <Badge className={impactInfo.color}>
              {weatherData.impactScore}/100
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                weatherData.impactScore >= 75 ? 'bg-green-500' :
                weatherData.impactScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${weatherData.impactScore}%` }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">{impactInfo.description}</p>
        </div>

        {/* Impact Label */}
        <div className="pt-2 border-t">
          <Badge className={impactInfo.color} variant="secondary">
            {impactInfo.label}
          </Badge>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          Updated: {new Date(weatherData.timestamp).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default WeatherImpactCard;