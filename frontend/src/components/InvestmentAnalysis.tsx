import React from "react";
import { Button } from "./ui/button";
import {
  BarChart3,
  X,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
} from "lucide-react";

interface BusinessToken {
  id: number;
  businessName: string;
  sector: string;
  availableTokens: number;
  totalTokens: number;
  pricePerToken: number;
  expectedROI: string;
  totalValue: number;
  ownerAddress: string;
}

interface InvestmentAnalysisProps {
  token: BusinessToken;
  onClose: () => void;
  onBuyClick: () => void;
}

const InvestmentAnalysis: React.FC<InvestmentAnalysisProps> = ({
  token,
  onClose,
  onBuyClick,
}) => {
  // Calculate some realistic metrics
  const profitabilityScore = Math.floor(75 + Math.random() * 20);
  const riskLevel =
    profitabilityScore > 85
      ? "Low"
      : profitabilityScore > 65
      ? "Medium"
      : "High";
  const recommendation =
    profitabilityScore > 80
      ? "BUY"
      : profitabilityScore > 65
      ? "HOLD"
      : "WATCH";
  const dailyChange = (Math.random() - 0.5) * 10; // Random change between -5% and +5%
  const volume24h = Math.floor(1000 + Math.random() * 2000);

  return (
    <div className="space-y-4 border-t pt-4 bg-white rounded-lg p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Investment Analysis - {token.businessName}
        </h4>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Trading Chart Placeholder */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Price Trend (30 days)</span>
          <span
            className={`text-sm font-bold ${
              dailyChange >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {dailyChange >= 0 ? "+" : ""}
            {dailyChange.toFixed(1)}%
          </span>
        </div>

        <div className="bg-white rounded border p-4 h-32 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Professional Trading Chart</p>
            <p className="text-xs">Current Price: RM {token.pricePerToken}</p>
            <p className="text-xs text-green-600">
              Expected ROI: {token.expectedROI}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">
              Profitability Score
            </span>
          </div>
          <div className="text-lg font-bold text-green-800">
            {profitabilityScore}%
          </div>
        </div>

        <div
          className={`border rounded-lg p-3 ${
            riskLevel === "Low"
              ? "bg-green-50 border-green-200"
              : riskLevel === "Medium"
              ? "bg-yellow-50 border-yellow-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium">Risk Level</span>
          </div>
          <div className="text-lg font-bold">{riskLevel}</div>
        </div>
      </div>

      {/* Trading Metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-muted-foreground">24h Volume</div>
          <div className="font-semibold">{volume24h.toLocaleString()}</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-muted-foreground">Available</div>
          <div className="font-semibold">{token.availableTokens} tokens</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-muted-foreground">Market Cap</div>
          <div className="font-semibold">
            RM {token.totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div
        className={`rounded-lg p-3 text-center ${
          recommendation === "BUY"
            ? "bg-green-100 border border-green-300"
            : recommendation === "HOLD"
            ? "bg-yellow-100 border border-yellow-300"
            : "bg-blue-100 border border-blue-300"
        }`}
      >
        <div className="font-bold text-lg">{recommendation}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {recommendation === "BUY"
            ? "Strong growth potential with favorable conditions"
            : recommendation === "HOLD"
            ? "Stable investment, monitor for opportunities"
            : "Wait for better entry point or market conditions"}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => {
            onClose();
            onBuyClick();
          }}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Buy Now
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-orange-300 hover:bg-orange-50"
        >
          <TrendingDown className="mr-2 h-4 w-4" />
          Sell Position
        </Button>
      </div>
    </div>
  );
};

export default InvestmentAnalysis;
