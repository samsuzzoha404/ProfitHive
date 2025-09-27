import React, { useState, useCallback, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useForecast } from "../hooks/use-forecast";
import { useAuth } from "../contexts/AuthContext";
import { ForecastRequest, SalesRecord } from "../services/api-service";

// Import modular components
<<<<<<< HEAD
import ForecastHeader from "@/components/forecast/ForecastHeader";
import DemoForecastCard from "@/components/forecast/DemoForecastCard";
import FileUploadCard from "@/components/forecast/FileUploadCard";
import SystemStatusCard from "@/components/forecast/SystemStatusCard";
import KPIs from "@/components/forecast/KPIs";
import ForecastCharts from "@/components/forecast/ForecastCharts";
import ForecastTable from "@/components/forecast/ForecastTable";
import InsightsCard from "@/components/forecast/InsightsCard";
import LoadingState from "@/components/forecast/LoadingState";
import ErrorState from "@/components/forecast/ErrorState";
import EmptyState from "@/components/forecast/EmptyState";
import StatusIndicator from "@/components/forecast/StatusIndicator";
=======
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
>>>>>>> 4eb0ee0e615e0711048845ab6f63506edf4506be

const Forecast = () => {
  const { isAuthenticated, loading: authLoading, portalMode } = useAuth();
  const {
    data: forecastData,
    loading,
    error,
    lastUpdated,
    processingTime,
    hasData,
    canRetry,
    runForecast,
    runSampleForecast,
    clearForecast,
    retry,
    getChartData,
  } = useForecast();

  // Local state for file upload handling
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "online" | "offline" | "checking"
  >("checking");
  const [gptStatus, setGptStatus] = useState<
    "ready" | "processing" | "completed" | "error"
  >("ready");

  // File validation and parsing
  const validateAndParseFile = useCallback(
    async (file: File): Promise<ForecastRequest | null> => {
      setFileError("");

      try {
        const text = await file.text();
        let parsedData: ForecastRequest;

        if (file.name.endsWith(".json")) {
          const jsonData = JSON.parse(text);

          // Validate JSON structure
          if (!Array.isArray(jsonData)) {
            throw new Error("JSON must be an array of records");
          }

          const records: SalesRecord[] = jsonData.map(
            (record: unknown, index: number) => {
              const recordObj = record as Record<string, unknown>;
              if (
                !recordObj.date ||
                typeof recordObj.customers !== "number" ||
                typeof recordObj.sales_rm !== "number"
              ) {
                throw new Error(
                  `Invalid record at index ${index}. Required fields: date (string), customers (number), sales_rm (number)`
                );
              }
              return {
                date: recordObj.date as string,
                customers: recordObj.customers,
                sales_rm: recordObj.sales_rm,
              };
            }
          );

          parsedData = {
            store: "Uploaded Data",
            city: "Cyberjaya",
            records: records,
          };
        } else if (file.name.endsWith(".csv")) {
          const lines = text.trim().split("\n");
          if (lines.length < 2) {
            throw new Error("CSV must have at least header and one data row");
          }

          const headers = lines[0].split(",").map((h) => h.trim());
          const dateIndex = headers.indexOf("date");
          const customersIndex = headers.indexOf("customers");
          const salesIndex = headers.indexOf("sales_rm");

          if (dateIndex === -1 || customersIndex === -1 || salesIndex === -1) {
            throw new Error(
              "CSV must contain columns: date, customers, sales_rm"
            );
          }

          const records: SalesRecord[] = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim());
            if (
              values.length <
              Math.max(dateIndex, customersIndex, salesIndex) + 1
            ) {
              continue; // Skip incomplete rows
            }

            const customers = parseInt(values[customersIndex]);
            const sales_rm = parseFloat(values[salesIndex]);

            if (isNaN(customers) || isNaN(sales_rm)) {
              throw new Error(
                `Invalid data at row ${
                  i + 1
                }: customers and sales_rm must be numbers`
              );
            }

            records.push({
              date: values[dateIndex],
              customers: customers,
              sales_rm: sales_rm,
            });
          }

          if (records.length === 0) {
            throw new Error("No valid data rows found in CSV");
          }

          parsedData = {
            store: "Uploaded Data",
            city: "Cyberjaya",
            records: records,
          };
        } else {
          throw new Error("Please upload a JSON (.json) or CSV (.csv) file");
        }

        return parsedData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setFileError(errorMessage);
        return null;
      }
    },
    []
  );

  // File upload handlers
  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setFileError("");
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        if (file.name.endsWith(".json") || file.name.endsWith(".csv")) {
          handleFileSelect(file);
        } else {
          setFileError("Please upload a JSON (.json) or CSV (.csv) file");
        }
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Check backend status on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/health");
        if (response.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch (error) {
        setBackendStatus("offline");
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
    { date: "2025-09-20", sales: 3200, customers: 160 },
    { date: "2025-09-21", sales: 2800, customers: 140 },
    { date: "2025-09-22", sales: 3600, customers: 180 },
    { date: "2025-09-23", sales: 3100, customers: 155 },
    { date: "2025-09-24", sales: 3900, customers: 195 },
    { date: "2025-09-25", sales: 3400, customers: 170 },
    { date: "2025-09-26", sales: 2900, customers: 145 },
  ];

  // Use AI forecast data if available, otherwise show sample historical data
  const displayData = salesData.length > 0 ? salesData : defaultSampleData;
  const chartTitle =
    salesData.length > 0 ? "AI Sales Forecast" : "Historical Sales Data";
  const chartDescription =
    salesData.length > 0
      ? "AI-powered predictions with confidence intervals"
      : "Click 'Run Demo Forecast' to see AI predictions";

  const handleRunDemo = async () => {
    console.log("🎯 Running demo forecast with sample data");
    setGptStatus("processing");
    const success = await runSampleForecast("Cafe Cyber");
    if (success) {
      setGptStatus("completed");
      console.log("✅ Demo forecast completed successfully");
    } else {
      setGptStatus("error");
    }
  };

  const handleRunFileForecast = async () => {
    if (!uploadedFile) {
      setFileError("Please upload a file first");
      return;
    }

    const parsedData = await validateAndParseFile(uploadedFile);
    if (!parsedData) {
      return; // Error already set in validateAndParseFile
    }

    console.log("🚀 Running forecast with uploaded file data");
    setGptStatus("processing");
    const success = await runForecast(parsedData);
    if (success) {
      setGptStatus("completed");
      console.log("✅ File forecast completed successfully");
    } else {
      setGptStatus("error");
    }
  };

  const handleRetry = async () => {
    console.log("🔄 Retrying forecast...");
    setGptStatus("processing");
    await retry();
    setGptStatus(hasData ? "completed" : "error");
  };

  const handleClear = () => {
    console.log("🗑️ Clearing forecast data");
    clearForecast();
    setUploadedFile(null);
    setFileError("");
    setGptStatus("ready");
  };

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-16 md:pt-20 pb-8 md:pb-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-screen-xl">
        {/* Header */}
        <ForecastHeader
          title={
            portalMode === "retailer"
              ? "Business Demand Forecast"
              : "Market Investment Analysis"
          }
          subtitle={
            portalMode === "retailer"
              ? "Predict your business demand and optimize inventory with AI-powered forecasting. Upload your sales data for personalized predictions."
              : "Analyze market trends and investment opportunities with AI-powered insights. Use sample data or upload market data for analysis."
          }
          badgeText={
            portalMode === "retailer"
              ? "Retailer Analytics"
              : "Investment Intelligence"
          }
        />

        {/* Input Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
          <DemoForecastCard
            onRunDemo={handleRunDemo}
            loading={loading}
            gptStatus={gptStatus}
            portalMode={portalMode}
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
            processingTime={processingTime ?? undefined}
            hasData={hasData}
            error={error ?? undefined}
            canRetry={canRetry}
            loading={loading}
            onRetry={handleRetry}
            onClear={handleClear}
          />
        </div>

        {/* Error Display */}
        {error && <ErrorState error={error} />}

        {/* Main Content - Results or Loading or Empty State */}
        {hasData && forecastData ? (
          <div className="space-y-6 md:space-y-8">
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
              lastUpdated={lastUpdated ?? undefined}
              processingTime={processingTime ?? undefined}
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
