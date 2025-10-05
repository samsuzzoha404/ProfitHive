import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface StatusIndicatorProps {
  lastUpdated?: Date;
  processingTime?: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ lastUpdated, processingTime }) => {
  if (!lastUpdated && !processingTime) return null;

  return (
    <Card className="glass border-primary/20 hover-lift mt-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
            )}
            {processingTime && (
              <span>Processing time: {processingTime}ms</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-medium">AI Analysis Complete</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusIndicator;