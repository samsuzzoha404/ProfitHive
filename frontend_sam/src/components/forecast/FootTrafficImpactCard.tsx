import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FootTrafficImpactCardProps {
  footTrafficData?: {
    locationName: string;
    popularTimes: Array<{
      hour: number;
      trafficLevel: number;
    }>;
    currentTrafficLevel: number;
    avgTraffic: number;
    impactScore: number;
    rating?: number;
    totalRatings?: number;
    fallback?: boolean;
    timestamp: string;
  };
}

const FootTrafficImpactCard: React.FC<FootTrafficImpactCardProps> = ({
  footTrafficData
}) => {
  if (!footTrafficData) {
    return (
      <Card className="h-full glass border-purple-400/20 hover-lift transition-all duration-300 hover:border-purple-400/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Foot Traffic Impact
          </CardTitle>
          <CardDescription>Google Maps foot traffic analysis for Cyberjaya</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Foot traffic data loading...</p>
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
        label: 'High Traffic',
        description: 'Excellent foot traffic expected',
        icon: <TrendingUp className="h-4 w-4" />
      };
    } else if (score >= 50) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Moderate Traffic',
        description: 'Normal foot traffic levels',
        icon: <Minus className="h-4 w-4" />
      };
    } else {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Low Traffic',
        description: 'Reduced foot traffic expected',
        icon: <TrendingDown className="h-4 w-4" />
      };
    }
  };

  // Get traffic level color
  const getTrafficColor = (level: number) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 60) return 'text-yellow-600';
    if (level >= 40) return 'text-blue-600';
    return 'text-red-600';
  };

  const impactInfo = getImpactInfo(footTrafficData.impactScore);

  return (
    <Card className="h-full glass border-purple-400/20 hover-lift transition-all duration-300 hover:border-purple-400/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Foot Traffic Impact
          {footTrafficData.fallback && (
            <Badge variant="outline" className="ml-auto text-xs">
              Estimated
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Google Maps foot traffic analysis for Cyberjaya
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Traffic Levels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Current Traffic</span>
            </div>
            <p className={`text-2xl font-bold ${getTrafficColor(footTrafficData.currentTrafficLevel)}`}>
              {footTrafficData.currentTrafficLevel}%
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Average Traffic</span>
            </div>
            <p className={`text-2xl font-bold ${getTrafficColor(footTrafficData.avgTraffic)}`}>
              {footTrafficData.avgTraffic}%
            </p>
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Location</p>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-500" />
            <span className="font-medium">{footTrafficData.locationName}</span>
            {footTrafficData.rating && (
              <span className="text-sm text-muted-foreground ml-auto">
                ⭐ {footTrafficData.rating.toFixed(1)}
                {footTrafficData.totalRatings && ` (${footTrafficData.totalRatings})`}
              </span>
            )}
          </div>
        </div>

        {/* Impact Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Business Impact</span>
            <Badge className={impactInfo.color}>
              {footTrafficData.impactScore}/100
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                footTrafficData.impactScore >= 75 ? 'bg-green-500' :
                footTrafficData.impactScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${footTrafficData.impactScore}%` }}
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {impactInfo.icon}
            <span>{impactInfo.description}</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          Last updated: {new Date(footTrafficData.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default FootTrafficImpactCard;