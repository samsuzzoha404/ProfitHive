import React from 'react';
import { Zap } from 'lucide-react';

interface ForecastHeaderProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

const ForecastHeader: React.FC<ForecastHeaderProps> = ({
  title = "AI Demand Forecast",
  subtitle = "Experience our AI-powered demand forecasting with sample data, or upload your own historical sales data for personalized predictions.",
  badgeText = "AI-Powered Analytics"
}) => {
  return (
    <div className="text-center mb-8 md:mb-12 px-4">
      <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full glass border border-primary/20 glow-primary mb-4 md:mb-6">
        <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 text-primary" />
        <span className="text-xs md:text-sm font-medium text-primary">{badgeText}</span>
      </div>
      <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight">
        <span className="text-gradient bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">{title}</span>
      </h1>
      <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
};

export default ForecastHeader;