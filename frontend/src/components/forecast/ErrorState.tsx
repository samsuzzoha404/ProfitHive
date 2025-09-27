import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  if (!error) return null;

  return (
    <Alert className="bg-red-50 border-red-200 mb-8">
      <AlertTriangle className="w-5 h-5 text-red-600" />
      <AlertDescription className="text-red-800">
        <strong>Error:</strong> {error}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorState;