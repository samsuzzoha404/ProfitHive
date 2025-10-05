import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CloudUpload, 
  Upload, 
  FileCheck, 
  FileJson, 
  FileSpreadsheet, 
  AlertTriangle 
} from 'lucide-react';

interface FileUploadCardProps {
  uploadedFile: File | null;
  fileError: string;
  isDragOver: boolean;
  loading: boolean;
  gptStatus: 'ready' | 'processing' | 'completed' | 'error';
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRunFileForecast: () => void;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  uploadedFile,
  fileError,
  isDragOver,
  loading,
  gptStatus,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onRunFileForecast
}) => {
  return (
    <Card className="glass border-accent/20 hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudUpload className="h-5 w-5 text-accent" />
          Upload Data File
        </CardTitle>
        <CardDescription>
          Upload your business data in JSON or CSV format for custom forecasting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-accent bg-accent/10 scale-105' 
              : uploadedFile 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/30 hover:border-accent/50'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            type="file"
            accept=".json,.csv"
            onChange={onFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {uploadedFile ? (
            <div className="space-y-2">
              <FileCheck className="w-8 h-8 text-primary mx-auto" />
              <p className="font-medium text-primary">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(uploadedFile.size / 1024).toFixed(1)} KB • Ready to process
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <CloudUpload className={`w-8 h-8 mx-auto ${isDragOver ? 'text-accent' : 'text-muted-foreground'}`} />
              <p className="font-medium">
                {isDragOver ? 'Drop file here' : 'Drop file or click to upload'}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <FileJson className="w-3 h-3" />
                <span>JSON</span>
                <span>•</span>
                <FileSpreadsheet className="w-3 h-3" />
                <span>CSV</span>
              </div>
            </div>
          )}
        </div>

        {fileError && (
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <AlertDescription className="text-destructive text-sm">
              {fileError}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={onRunFileForecast}
          disabled={loading || !uploadedFile}
          className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground"
          size="lg"
        >
          {loading && gptStatus === 'processing' ? (
            <>
              <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Processing File...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Generate Forecast
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUploadCard;