import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BarChart3 } from "lucide-react";

interface DemoForecastCardProps {
  onRunDemo: () => void;
  loading: boolean;
  gptStatus: "ready" | "processing" | "completed" | "error";
  portalMode?: "retailer" | "investor";
}

const DemoForecastCard: React.FC<DemoForecastCardProps> = ({
  onRunDemo,
  loading,
  gptStatus,
  portalMode = "retailer",
}) => {
  return (
    <Card className="glass border-primary/20 hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Try Demo Forecast
        </CardTitle>
        <CardDescription>
          {portalMode === "retailer"
            ? "Generate a sample business forecast to see how AI can predict your sales and customer demand"
            : "Explore market analysis and investment insights using our AI-powered forecasting demo"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 glass rounded-lg border border-primary/20">
          <h4 className="font-medium text-primary mb-2">
            {portalMode === "retailer"
              ? "Business Analytics:"
              : "Investment Analysis:"}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {portalMode === "retailer" ? (
              <>
                <li>• Daily sales & customer predictions</li>
                <li>• Peak hours & traffic analysis</li>
                <li>• Revenue optimization insights</li>
                <li>• Inventory planning recommendations</li>
              </>
            ) : (
              <>
                <li>• Market trend analysis</li>
                <li>• Investment opportunity scoring</li>
                <li>• Portfolio performance predictions</li>
                <li>• Risk assessment metrics</li>
              </>
            )}
          </ul>
        </div>

        <Button
          onClick={onRunDemo}
          disabled={loading}
          className="w-full bg-gradient-primary hover-glow"
          size="lg"
        >
          {loading && gptStatus === "processing" ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Generating Forecast...
            </div>
          ) : (
            <>
              <BarChart3 className="mr-2 h-5 w-5" />
              Run Demo Forecast
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DemoForecastCard;
