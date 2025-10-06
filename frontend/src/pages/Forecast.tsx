import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useForecast } from '../hooks/use-forecast';
import { ForecastRequest, SalesRecord } from '../services/api-service';

// Import modular components
import ForecastHeader from '@/components/forecast/ForecastHeader';
import DemoForecastCard from '@/components/forecast/DemoForecastCard';
import FileUploadCard from '@/components/forecast/FileUploadCard';
import SystemStatusCard from '@/components/forecast/SystemStatusCard';
import KPIs from '@/components/forecast/KPIs';
import ForecastCharts from '@/components/forecast/ForecastCharts';
import ForecastTable from '@/components/forecast/ForecastTable';
import InsightsCard from '@/components/forecast/InsightsCard';
import WeatherImpactCard from '@/components/forecast/WeatherImpactCard';
import TransportImpactCard from '@/components/forecast/TransportImpactCard';
import FootTrafficImpactCard from '@/components/forecast/FootTrafficImpactCard';
import LoadingState from '@/components/forecast/LoadingState';
import ErrorState from '@/components/forecast/ErrorState';
import EmptyState from '@/components/forecast/EmptyState';
import StatusIndicator from '@/components/forecast/StatusIndicator';

const Forecast = () => {
  const {
    data: forecastData,
    loading,
    error,
    lastUpdated,
    processingTime,
    hasData,
    canRetry,
    isDemoData,
    runForecast,
    runSampleForecast,
    clearForecast,
    retry,
    getChartData
  } = useForecast();

  // Local state for file upload handling
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [gptStatus, setGptStatus] = useState<'ready' | 'processing' | 'completed' | 'error'>('ready');

  // File validation and parsing
  const validateAndParseFile = useCallback(async (file: File): Promise<ForecastRequest | null> => {
    setFileError('');
    
    try {
      const text = await file.text();
      let parsedData: ForecastRequest;
      
      if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        
        // Validate JSON structure
        if (!Array.isArray(jsonData)) {
          throw new Error('JSON must be an array of records');
        }
        
        const records: SalesRecord[] = jsonData.map((record: unknown, index: number) => {
          const recordObj = record as Record<string, unknown>;
          if (!recordObj.date || typeof recordObj.customers !== 'number' || typeof recordObj.sales_rm !== 'number') {
            throw new Error(`Invalid record at index ${index}. Required fields: date (string), customers (number), sales_rm (number)`);
          }
          return {
            date: recordObj.date as string,
            customers: recordObj.customers,
            sales_rm: recordObj.sales_rm
          };
        });

        parsedData = {
          store: "Uploaded Data",
          city: "Cyberjaya",
          records: records
        };
        
      } else if (file.name.endsWith('.csv')) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          throw new Error('CSV must have at least header and one data row');
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const dateIndex = headers.indexOf('date');
        const customersIndex = headers.indexOf('customers');
        const salesIndex = headers.indexOf('sales_rm');
        
        if (dateIndex === -1 || customersIndex === -1 || salesIndex === -1) {
          throw new Error('CSV must contain columns: date, customers, sales_rm');
        }

        const records: SalesRecord[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < Math.max(dateIndex, customersIndex, salesIndex) + 1) {
            continue; // Skip incomplete rows
          }
          
          const customers = parseInt(values[customersIndex]);
          const sales_rm = parseFloat(values[salesIndex]);
          
          if (isNaN(customers) || isNaN(sales_rm)) {
            throw new Error(`Invalid data at row ${i + 1}: customers and sales_rm must be numbers`);
          }
          
          records.push({
            date: values[dateIndex],
            customers: customers,
            sales_rm: sales_rm
          });
        }

        if (records.length === 0) {
          throw new Error('No valid data rows found in CSV');
        }

        parsedData = {
          store: "Uploaded Data",
          city: "Cyberjaya",
          records: records
        };
      } else {
        throw new Error('Please upload a JSON (.json) or CSV (.csv) file');
      }

      return parsedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFileError(errorMessage);
      return null;
    }
  }, []);

  // File upload handlers
  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setFileError('');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
        handleFileSelect(file);
      } else {
        setFileError('Please upload a JSON (.json) or CSV (.csv) file');
      }
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Check backend status on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/health`);
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    checkBackendStatus();
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get formatted chart data and KPIs
  const { salesData, insights, kpis } = getChartData();

  // Default sample data to show when no AI forecast is loaded
  const defaultSampleData = [
    { date: '2025-09-20', sales: 3200, customers: 160 },
    { date: '2025-09-21', sales: 2800, customers: 140 },
    { date: '2025-09-22', sales: 3600, customers: 180 },
    { date: '2025-09-23', sales: 3100, customers: 155 },
    { date: '2025-09-24', sales: 3900, customers: 195 },
    { date: '2025-09-25', sales: 3400, customers: 170 },
    { date: '2025-09-26', sales: 2900, customers: 145 }
  ];

  // Use AI forecast data if available, otherwise show sample historical data
  const displayData = salesData.length > 0 ? salesData : defaultSampleData;
  const chartTitle = salesData.length > 0 ? "AI Sales Forecast" : "Historical Sales Data";
  const chartDescription = salesData.length > 0 ? "AI-powered predictions with confidence intervals" : "Click 'Run Demo Forecast' to see AI predictions";

  const handleRunDemo = async () => {
    console.log('🎯 Running demo forecast with sample data');
    setGptStatus('processing');
    const success = await runSampleForecast('Cafe Cyber');
    if (success) {
      setGptStatus('completed');
      console.log('✅ Demo forecast completed successfully');
    } else {
      setGptStatus('error');
    }
  };

  const handleRunFileForecast = async () => {
    if (!uploadedFile) {
      setFileError('Please upload a file first');
      return;
    }

    const parsedData = await validateAndParseFile(uploadedFile);
    if (!parsedData) {
      return; // Error already set in validateAndParseFile
    }

    console.log('🚀 Running forecast with uploaded file data');
    setGptStatus('processing');
    const success = await runForecast(parsedData);
    if (success) {
      setGptStatus('completed');
      console.log('✅ File forecast completed successfully');
    } else {
      setGptStatus('error');
    }
  };

  const handleRetry = async () => {
    console.log('🔄 Retrying forecast...');
    setGptStatus('processing');
    await retry();
    setGptStatus(hasData ? 'completed' : 'error');
  };

  const handleClear = () => {
    console.log('🗑️ Clearing forecast data');
    clearForecast();
    setUploadedFile(null);
    setFileError('');
    setGptStatus('ready');
  };

  return (
    <main className="min-h-screen pt-16 md:pt-20 pb-8 md:pb-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-screen-xl">
        {/* Header */}
        <ForecastHeader />

        {/* Input Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
          <DemoForecastCard
            onRunDemo={handleRunDemo}
            loading={loading}
            gptStatus={gptStatus}
          />
          
          <FileUploadCard
            uploadedFile={uploadedFile}
            fileError={fileError}
            isDragOver={isDragOver}
            loading={loading}
            gptStatus={gptStatus}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileInputChange={handleFileInputChange}
            onRunFileForecast={handleRunFileForecast}
          />
          
          <SystemStatusCard
            backendStatus={backendStatus}
            gptStatus={gptStatus}
            processingTime={processingTime}
            hasData={hasData}
            error={error}
            canRetry={canRetry}
            loading={loading}
            onRetry={handleRetry}
            onClear={handleClear}
          />
        </div>

        {/* Error Display */}
        <ErrorState error={error} />

        {/* Main Content - Results or Loading or Empty State */}
        {(hasData && forecastData) ? (
          <div className="space-y-6 md:space-y-8">
            {/* Demo Data Banner */}
            {isDemoData && (
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Demo Data Active
                    </h3>
                    <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                      Backend server is currently unavailable. Displaying realistic demo forecast data for presentation purposes. 
                      Connect to the backend API for real AI-powered predictions.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Key Performance Indicators */}
            <KPIs kpis={kpis} />

            {/* External Data Impact Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <WeatherImpactCard weatherData={forecastData.weatherImpact} />
              <TransportImpactCard transportData={forecastData.transportImpact} />
              <FootTrafficImpactCard footTrafficData={forecastData.footTrafficImpact} />
            </div>

            {/* Charts Grid */}
            <ForecastCharts
              displayData={displayData}
              salesData={salesData}
              chartTitle={chartTitle}
              chartDescription={chartDescription}
              footTrafficImpact={forecastData.footTrafficImpact}
            />

            {/* Forecast Table & Platform Statistics */}
            <ForecastTable
              salesData={salesData}
              defaultSampleData={defaultSampleData}
            />

            {/* AI Insights */}
            <InsightsCard insights={insights} />

            {/* Status Information */}
            <StatusIndicator
              lastUpdated={lastUpdated}
              processingTime={processingTime}
            />
          </div>
        ) : loading ? (
          <LoadingState />
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  );
};

export default Forecast;