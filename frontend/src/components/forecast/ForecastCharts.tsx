import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  sales: number;
  customers: number;
}

interface FootTrafficData {
  hour: number;
  trafficLevel: number;
}

interface FootTrafficImpact {
  locationName?: string;
  popularTimes?: FootTrafficData[];
  currentTrafficLevel?: number;
  avgTraffic?: number;
  impactScore?: number;
  fallback?: boolean;
}

interface ForecastChartsProps {
  displayData: ChartDataPoint[];
  salesData: ChartDataPoint[];
  chartTitle: string;
  chartDescription: string;
  footTrafficImpact?: FootTrafficImpact;
}

const ForecastCharts: React.FC<ForecastChartsProps> = ({
  displayData,
  salesData,
  chartTitle,
  chartDescription,
  footTrafficImpact
}) => {
  // Prepare foot traffic data for the chart
  const footTrafficData = React.useMemo(() => {
    if (!footTrafficImpact?.popularTimes) {
      // Default peak hours data for Cyberjaya (fallback)
      return [
        { hour: '8AM', hourValue: 8, trafficLevel: 45, sales: 900, isCurrentHour: false },
        { hour: '10AM', hourValue: 10, trafficLevel: 78, sales: 1560, isCurrentHour: false },
        { hour: '12PM', hourValue: 12, trafficLevel: 145, sales: 2900, isCurrentHour: false },
        { hour: '2PM', hourValue: 14, trafficLevel: 165, sales: 3300, isCurrentHour: false },
        { hour: '4PM', hourValue: 16, trafficLevel: 122, sales: 2440, isCurrentHour: false },
        { hour: '6PM', hourValue: 18, trafficLevel: 189, sales: 3780, isCurrentHour: false },
        { hour: '8PM', hourValue: 20, trafficLevel: 156, sales: 3120, isCurrentHour: false },
        { hour: '10PM', hourValue: 22, trafficLevel: 89, sales: 1780, isCurrentHour: false }
      ];
    }

    const currentHour = new Date().getHours();
    return footTrafficImpact.popularTimes.map(data => ({
      hour: data.hour < 12 ? `${data.hour || 12}AM` : data.hour === 12 ? '12PM' : `${data.hour - 12}PM`,
      hourValue: data.hour,
      trafficLevel: data.trafficLevel,
      sales: Math.round(data.trafficLevel * 20), // Estimate sales based on traffic
      isCurrentHour: data.hour === currentHour
    }));
  }, [footTrafficImpact]);

  // Peak hours data for Cyberjaya (keeping original for backward compatibility)
  const peakHoursData = [
    { hour: '8AM', customers: 45, sales: 900 },
    { hour: '10AM', customers: 78, sales: 1560 },
    { hour: '12PM', customers: 145, sales: 2900 },
    { hour: '2PM', customers: 165, sales: 3300 },
    { hour: '4PM', customers: 122, sales: 2440 },
    { hour: '6PM', customers: 189, sales: 3780 },
    { hour: '8PM', customers: 156, sales: 3120 },
    { hour: '10PM', customers: 89, sales: 1780 }
  ];

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
      {/* Sales Trend Chart */}
      <Card className="glass border-primary/20 hover-lift">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            {chartTitle}
          </CardTitle>
          <CardDescription>{chartDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Sales (RM)"
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  name="Customers"
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Customer Demand Chart */}
      <Card className="glass border-accent/20 hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Customer Demand Analysis
          </CardTitle>
          <CardDescription>Predicted customer traffic patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData.length > 0 ? salesData : displayData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar 
                  dataKey="customers" 
                  fill="hsl(var(--accent))" 
                  name="Customer Count"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours Chart with Google Maps Foot Traffic */}
      <Card className="glass border-secondary/20 hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            Foot Traffic Peak Hours
            {footTrafficImpact?.fallback && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Fallback</span>
            )}
          </CardTitle>
          <CardDescription>
            {footTrafficImpact?.locationName || 'Cyberjaya retail location'} - 
            Current traffic: {footTrafficImpact?.currentTrafficLevel || 50}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={footTrafficData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{ value: 'Traffic Level (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    name === 'trafficLevel' ? `${value}%` : value,
                    name === 'trafficLevel' ? 'Foot Traffic' : name
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="trafficLevel" 
                  fill="hsl(var(--secondary))"
                  name="Foot Traffic (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {footTrafficImpact && (
            <div className="mt-4 flex justify-between text-sm text-muted-foreground">
              <span>Avg Traffic: {footTrafficImpact.avgTraffic}%</span>
              <span>Impact Score: {footTrafficImpact.impactScore}/100</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastCharts;