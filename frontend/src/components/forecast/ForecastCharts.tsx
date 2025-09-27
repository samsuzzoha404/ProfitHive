import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  sales: number;
  customers: number;
}

interface ForecastChartsProps {
  displayData: ChartDataPoint[];
  salesData: ChartDataPoint[];
  chartTitle: string;
  chartDescription: string;
}

const ForecastCharts: React.FC<ForecastChartsProps> = ({
  displayData,
  salesData,
  chartTitle,
  chartDescription
}) => {
  // Peak hours data for Cyberjaya
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

      {/* Peak Hours Chart (Cyberjaya specific) */}
      <Card className="glass border-secondary/20 hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            Peak Hours (Cyberjaya)
          </CardTitle>
          <CardDescription>Busiest predicted hours for retail traffic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                <XAxis 
                  dataKey="hour" 
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
                  fill="hsl(var(--secondary))" 
                  name="Peak Traffic"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastCharts;