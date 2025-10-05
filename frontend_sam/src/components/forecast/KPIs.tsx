import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Target, Calendar, CloudRain, Bus } from 'lucide-react';

interface KPIData {
  totalRevenue?: number;
  avgCustomers?: number;
  avgConfidence?: number;
  weatherImpact?: number;
  transportImpact?: number;
}

interface KPIsProps {
  kpis: KPIData | undefined;
}

const KPIs: React.FC<KPIsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-10">
      {/* Total Revenue */}
      <Card className="glass border-primary/20 hover-lift transition-all duration-300 hover:border-primary/40">
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold text-muted-foreground/90 uppercase tracking-wide mb-2">
                Total Revenue
              </p>
              <p className="text-lg lg:text-xl xl:text-2xl font-bold text-primary tracking-tight leading-none">
                RM {kpis?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-2.5 lg:p-3 bg-gradient-primary rounded-xl glow-primary flex-shrink-0">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Customers */}
      <Card className="glass border-accent/20 hover-lift transition-all duration-300 hover:border-accent/40">
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold text-muted-foreground/90 uppercase tracking-wide mb-2">
                Avg. Customers
              </p>
              <p className="text-lg lg:text-xl xl:text-2xl font-bold text-accent tracking-tight leading-none">
                {kpis?.avgCustomers?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-2.5 lg:p-3 bg-gradient-to-r from-accent to-accent/80 rounded-xl glow-accent flex-shrink-0">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-accent-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Score */}
      <Card className="glass border-secondary/20 hover-lift transition-all duration-300 hover:border-secondary/40">
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold text-muted-foreground/90 uppercase tracking-wide mb-2">
                AI Confidence
              </p>
              <p className="text-lg lg:text-xl xl:text-2xl font-bold text-secondary tracking-tight leading-none">
                {(kpis?.avgConfidence || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-2.5 lg:p-3 bg-gradient-to-r from-secondary to-secondary/80 rounded-xl glow-secondary flex-shrink-0">
              <Target className="w-5 h-5 lg:w-6 lg:h-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Impact */}
      <Card className="glass border-blue-400/20 hover-lift transition-all duration-300 hover:border-blue-400/40">
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold text-muted-foreground/90 uppercase tracking-wide mb-2">
                Weather Impact
              </p>
              <p className={`text-lg lg:text-xl xl:text-2xl font-bold tracking-tight leading-none ${
                (kpis?.weatherImpact || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {(kpis?.weatherImpact || 0) >= 0 ? '+' : ''}
                {(kpis?.weatherImpact || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-2.5 lg:p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex-shrink-0">
              <CloudRain className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transport Impact */}
      <Card className="glass border-orange-400/20 hover-lift transition-all duration-300 hover:border-orange-400/40">
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold text-muted-foreground/90 uppercase tracking-wide mb-2">
                Transport Impact
              </p>
              <p className={`text-lg lg:text-xl xl:text-2xl font-bold tracking-tight leading-none ${
                (kpis?.transportImpact || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {(kpis?.transportImpact || 0) >= 0 ? '+' : ''}
                {(kpis?.transportImpact || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-2.5 lg:p-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex-shrink-0">
              <Bus className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Period */}
      <Card className="glass border-primary/20 hover-lift transition-all duration-300 hover:border-primary/40">
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold text-muted-foreground/90 uppercase tracking-wide mb-2">
                Forecast Period
              </p>
              <p className="text-lg lg:text-xl xl:text-2xl font-bold text-primary tracking-tight leading-none">
                14 Days
              </p>
            </div>
            <div className="p-2.5 lg:p-3 bg-gradient-primary rounded-xl glow-primary flex-shrink-0">
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPIs;