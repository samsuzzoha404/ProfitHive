import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <Card className="glass border-primary/20 mb-8">
      <CardContent className="p-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <h3 className="text-2xl font-semibold text-primary">Processing Your Forecast</h3>
        </div>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Our AI is analyzing your data and generating predictions...
        </p>
        <div className="space-y-3 text-sm text-muted-foreground max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <span>Analyzing historical patterns</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <span>Applying machine learning models</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <span>Generating insights and recommendations</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;