import React from 'react';
import { BarChart3 } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16 space-y-6">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border border-primary/20">
        <BarChart3 className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">AI Forecasting Dashboard</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Select an option above to generate your demand forecast and business insights
        </p>
      </div>
    </div>
  );
};

export default EmptyState;