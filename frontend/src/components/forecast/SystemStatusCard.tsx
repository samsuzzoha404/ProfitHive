import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock 
} from 'lucide-react';

interface SystemStatusCardProps {
  backendStatus: 'online' | 'offline' | 'checking';
  gptStatus: 'ready' | 'processing' | 'completed' | 'error';
  processingTime?: number;
  hasData: boolean;
  error?: string;
  canRetry: boolean;
  loading: boolean;
  onRetry: () => void;
  onClear: () => void;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  backendStatus,
  gptStatus,
  processingTime,
  hasData,
  error,
  canRetry,
  loading,
  onRetry,
  onClear
}) => {
  return (
    <Card className="glass border-secondary/20 hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary" />
          System Status
        </CardTitle>
        <CardDescription>
          Real-time backend and AI processing status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Backend Status */}
        <div className="p-4 glass rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Backend Connection</span>
            {backendStatus === 'online' ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <Wifi className="h-4 w-4 text-primary" />
                <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">Online</Badge>
              </div>
            ) : backendStatus === 'offline' ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <WifiOff className="h-4 w-4 text-destructive" />
                <Badge variant="destructive" className="text-xs">Offline</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                <Badge variant="secondary" className="text-xs">Checking...</Badge>
              </div>
            )}
          </div>
        </div>

        {/* GPT Status */}
        <div className="p-4 glass rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI Processing</span>
            {gptStatus === 'ready' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <Badge variant="outline" className="text-xs border-primary/20 text-primary">Ready</Badge>
              </div>
            )}
            {gptStatus === 'processing' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <Badge className="text-xs bg-accent/10 text-accent border-accent/20">Processing</Badge>
              </div>
            )}
            {gptStatus === 'completed' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Completed</Badge>
              </div>
            )}
            {gptStatus === 'error' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <Badge variant="destructive" className="text-xs">Error</Badge>
              </div>
            )}
          </div>
          {processingTime && gptStatus === 'completed' && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {processingTime}ms processing time
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {(hasData || error) && (
          <div className="space-y-2">
            {canRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Analysis
              </Button>
            )}
            {hasData && (
              <Button 
                onClick={onClear}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Clear Results
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;