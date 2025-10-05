import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react';

interface InsightsCardProps {
  insights: string[];
}

const InsightsCard: React.FC<InsightsCardProps> = ({ insights }) => {
  // Determine icon based on insight content or index
  const getInsightIcon = (text: string | unknown, idx: number) => {
    // Ensure text is a string
    const textString = typeof text === 'string' ? text : String(text || '');
    const lowerText = textString.toLowerCase();
    if (lowerText.includes('increase') || lowerText.includes('growth') || lowerText.includes('rise')) {
      return <TrendingUp className="w-4 h-4 text-primary-foreground" />;
    } else if (lowerText.includes('decrease') || lowerText.includes('decline') || lowerText.includes('drop')) {
      return <TrendingDown className="w-4 h-4 text-primary-foreground" />;
    } else if (lowerText.includes('peak') || lowerText.includes('best') || lowerText.includes('highest')) {
      return <Target className="w-4 h-4 text-primary-foreground" />;
    } else if (lowerText.includes('customer') || lowerText.includes('traffic')) {
      return <Users className="w-4 h-4 text-primary-foreground" />;
    } else if (lowerText.includes('warning') || lowerText.includes('risk') || lowerText.includes('concern')) {
      return <AlertTriangle className="w-4 h-4 text-primary-foreground" />;
    } else if (lowerText.includes('revenue') || lowerText.includes('sales') || lowerText.includes('profit')) {
      return <DollarSign className="w-4 h-4 text-primary-foreground" />;
    } else {
      return <Activity className="w-4 h-4 text-primary-foreground" />;
    }
  };

  const getEmojiPrefix = (text: string, idx: number) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('increase') || lowerText.includes('growth')) return '📈';
    if (lowerText.includes('warning') || lowerText.includes('risk')) return '⚠️';
    if (lowerText.includes('peak') || lowerText.includes('best')) return '🎯';
    if (lowerText.includes('customer')) return '👥';
    if (lowerText.includes('revenue') || lowerText.includes('sales')) return '💰';
    return ['💡', '🔍', '📊', '⭐'][idx % 4];
  };

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card className="glass border-primary/20 hover-lift mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI-Generated Business Insights
        </CardTitle>
        <CardDescription>
          Key findings and recommendations from your forecast analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-4 glass rounded-xl border border-primary/20">
              <div className="p-2 bg-gradient-primary rounded-lg glow-primary">
                {getInsightIcon(insight, index)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <span className="mr-2 text-base">{getEmojiPrefix(insight, index)}</span>
                  {insight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;