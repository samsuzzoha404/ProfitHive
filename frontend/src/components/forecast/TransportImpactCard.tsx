import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Bus, Train, Car, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TransportImpactCardProps {
  transportData?: {
    busAvailability: number;
    trainFrequency: number;
    congestionLevel: number;
    impactScore: number;
    peakHour: boolean;
    timestamp: string;
    fallback?: boolean;
  };
}

const TransportImpactCard: React.FC<TransportImpactCardProps> = ({ transportData }) => {
  if (!transportData) {
    return (
      <Card className="h-full glass border-secondary/20 hover-lift transition-all duration-300 hover:border-secondary/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Transportation Impact
          </CardTitle>
          <CardDescription>Real-time transport analysis for Cyberjaya</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Bus className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Transport data loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Impact score color and description
  const getImpactInfo = (score: number) => {
    if (score >= 75) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Excellent Access',
        description: 'Great transport connectivity',
        icon: <TrendingUp className="h-4 w-4" />
      };
    } else if (score >= 50) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Moderate Access',
        description: 'Average transport conditions',
        icon: <Minus className="h-4 w-4" />
      };
    } else {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Limited Access',
        description: 'Transport challenges detected',
        icon: <TrendingDown className="h-4 w-4" />
      };
    }
  };

  // Get availability color
  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get congestion color (inverted - lower is better)
  const getCongestionColor = (percentage: number) => {
    if (percentage <= 30) return 'text-green-600';
    if (percentage <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const impactInfo = getImpactInfo(transportData.impactScore);

  return (
    <Card className="h-full glass border-secondary/20 hover-lift transition-all duration-300 hover:border-secondary/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-5 w-5 text-blue-600" />
          Transportation Impact
          {transportData.fallback && (
            <Badge variant="outline" className="ml-auto text-xs">
              Estimated
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Real-time transport analysis for Cyberjaya
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Peak Hour Indicator */}
        {transportData.peakHour && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">Peak Hour</span>
          </div>
        )}

        {/* Transport Metrics */}
        <div className="space-y-3">
          {/* Bus Availability */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Bus Availability</span>
            </div>
            <span className={`font-bold ${getAvailabilityColor(transportData.busAvailability)}`}>
              {transportData.busAvailability}%
            </span>
          </div>

          {/* Train Frequency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Train className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Train Frequency</span>
            </div>
            <span className={`font-bold ${getAvailabilityColor(transportData.trainFrequency)}`}>
              {transportData.trainFrequency}%
            </span>
          </div>

          {/* Traffic Congestion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Traffic Congestion</span>
            </div>
            <span className={`font-bold ${getCongestionColor(transportData.congestionLevel)}`}>
              {transportData.congestionLevel}%
            </span>
          </div>
        </div>

        {/* Visual Indicators */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Bus</span>
              <span>{transportData.busAvailability}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${transportData.busAvailability}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Train</span>
              <span>{transportData.trainFrequency}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${transportData.trainFrequency}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Congestion</span>
              <span>{transportData.congestionLevel}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full bg-red-500 transition-all duration-300"
                style={{ width: `${transportData.congestionLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Overall Impact Score */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Business Impact</span>
            <Badge className={impactInfo.color}>
              {transportData.impactScore}/100
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                transportData.impactScore >= 75 ? 'bg-green-500' :
                transportData.impactScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${transportData.impactScore}%` }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">{impactInfo.description}</p>
        </div>

        {/* Impact Status Badge */}
        <div className="flex items-center gap-2">
          <Badge className={impactInfo.color} variant="secondary">
            {impactInfo.icon}
            <span className="ml-1">{impactInfo.label}</span>
          </Badge>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          Updated: {new Date(transportData.timestamp).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default TransportImpactCard;