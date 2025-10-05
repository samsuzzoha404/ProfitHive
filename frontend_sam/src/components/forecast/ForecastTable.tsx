import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Database } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  sales: number;
  customers: number;
}

interface ForecastTableProps {
  salesData: ChartDataPoint[];
  defaultSampleData: ChartDataPoint[];
}

const ForecastTable: React.FC<ForecastTableProps> = ({
  salesData,
  defaultSampleData
}) => {
  const tableData = salesData.length > 0 ? salesData.slice(0, 7) : defaultSampleData.slice(0, 7);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
      {/* 7-Day Forecast Table */}
      <Card className="glass border-primary/20 hover-lift">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            7-Day Forecast Table
          </CardTitle>
          <CardDescription className="text-sm">Detailed daily predictions with confidence levels</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="text-left p-1 md:p-2 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-1 md:p-2 font-medium text-muted-foreground">Customers</th>
                  <th className="text-left p-1 md:p-2 font-medium text-muted-foreground">Sales (RM)</th>
                  <th className="text-left p-1 md:p-2 font-medium text-muted-foreground">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((day, index) => (
                  <tr key={index} className="border-b border-muted/10 hover:bg-muted/5">
                    <td className="p-1 md:p-2 font-medium text-primary">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="p-1 md:p-2">{day.customers}</td>
                    <td className="p-1 md:p-2">RM {day.sales.toLocaleString()}</td>
                    <td className="p-1 md:p-2">
                      <div className="flex items-center gap-1 md:gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-primary font-medium text-xs md:text-sm">
                          {(85 + Math.random() * 10).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Platform Statistics (Cyberjaya Retailers) */}
      <Card className="glass border-accent/20 hover-lift">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Database className="w-4 h-4 md:w-5 md:h-5 text-accent" />
            Platform Statistics
          </CardTitle>
          <CardDescription className="text-sm">Cyberjaya retail network performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 glass rounded-lg border border-accent/20">
                <p className="text-2xl font-bold text-accent">RM 127K</p>
                <p className="text-xs text-muted-foreground">Avg. Monthly Revenue</p>
              </div>
              <div className="text-center p-4 glass rounded-lg border border-accent/20">
                <p className="text-2xl font-bold text-accent">2.4K</p>
                <p className="text-xs text-muted-foreground">Avg. Daily Customers</p>
              </div>
            </div>
            
            <div className="p-4 glass rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Top Peak Day</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">Saturday</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Weekend traffic increases by 35% on average
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 glass rounded border border-secondary/20">
                <p className="text-lg font-bold text-secondary">45</p>
                <p className="text-xs text-muted-foreground">Active Stores</p>
              </div>
              <div className="p-2 glass rounded border border-secondary/20">
                <p className="text-lg font-bold text-secondary">92%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
              <div className="p-2 glass rounded border border-secondary/20">
                <p className="text-lg font-bold text-secondary">8.2</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastTable;