import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import {
  Loader2,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Info,
} from "lucide-react";

interface ForecastData {
  forecast: number[];
  confidence: number;
  insights: string;
  accuracy_score: number;
}

export function TokenizationInterface() {
  const { address, isConnected } = useAccount();
  const [revenueAmount, setRevenueAmount] = useState("");
  const [tokenPercentage, setTokenPercentage] = useState("10");
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [storeData, setStoreData] = useState({
    storeId: "cafe-cyber-001",
    storeName: "Cafe Cyberjaya",
    city: "Cyberjaya",
    currentRevenue: "50000", // Monthly revenue in RM
  });

  // Generate AI forecast when component loads
  useEffect(() => {
    generateForecast();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateForecast = async () => {
    setIsLoading(true);
    try {
      // Call AI + Blockchain integration endpoint
      const response = await fetch(
        "http://localhost:5000/api/blockchain/ai-forecast-integration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeData: storeData,
            externalData: {
              weather: "favorable",
              events: "tech conference season",
              traffic: "high",
            },
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setForecastData(result.ai);
      }
    } catch (error) {
      console.error("Failed to generate forecast:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenize = async () => {
    if (!revenueAmount || !forecastData || !isConnected) return;

    setIsTokenizing(true);
    try {
      const tokenAmount = (
        (parseFloat(revenueAmount) * parseFloat(tokenPercentage)) /
        100
      ).toString();

      const response = await fetch(
        "http://localhost:5000/api/blockchain/tokenize",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            retailerAddress: address,
            revenueAmount: revenueAmount,
            tokenAmount: tokenAmount,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Revenue tokenized successfully!");
      } else {
        alert("Tokenization failed: " + result.error);
      }
    } catch (error) {
      console.error("Tokenization error:", error);
      alert("Tokenization failed");
    } finally {
      setIsTokenizing(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Connect your wallet to tokenize revenue
          </p>
        </CardContent>
      </Card>
    );
  }

  const tokenizedAmount = revenueAmount
    ? (parseFloat(revenueAmount) * parseFloat(tokenPercentage)) / 100
    : 0;
  const retainedAmount = revenueAmount
    ? parseFloat(revenueAmount) - tokenizedAmount
    : 0;

  return (
    <div className="space-y-6">
      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Revenue Tokenization
          </CardTitle>
          <CardDescription>
            Convert future revenue into tradeable tokens for instant liquidity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Store ID</p>
              <p className="font-medium">{storeData.storeId}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{storeData.city}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="font-medium">
                RM {parseInt(storeData.currentRevenue).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Forecast Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            AI Revenue Forecast
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            6-month revenue prediction powered by enhanced AI algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forecastData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {forecastData.forecast.map((value, index) => (
                  <div
                    key={index}
                    className="text-center p-3 bg-muted/30 rounded-lg"
                  >
                    <p className="text-xs text-muted-foreground">
                      Month {index + 1}
                    </p>
                    <p className="font-bold text-sm">
                      RM {value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  {Math.round(forecastData.confidence * 100)}% Confidence
                </Badge>
                <Badge variant="outline">
                  Accuracy Score:{" "}
                  {Math.round(forecastData.accuracy_score * 100)}%
                </Badge>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>{forecastData.insights}</AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <strong>Total 6-Month Forecast:</strong> RM{" "}
                {forecastData.forecast
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Button onClick={generateForecast} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Forecast...
                  </>
                ) : (
                  "Generate AI Forecast"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tokenization Configuration */}
      {forecastData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Tokenization Setup
            </CardTitle>
            <CardDescription>
              Configure how much of your future revenue to tokenize
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="revenue-amount">
                    Expected Revenue (6 months)
                  </Label>
                  <Input
                    id="revenue-amount"
                    type="number"
                    placeholder="100000"
                    value={revenueAmount}
                    onChange={(e) => setRevenueAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    AI Forecast: RM{" "}
                    {forecastData.forecast
                      .reduce((a, b) => a + b, 0)
                      .toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label htmlFor="token-percentage">
                    Tokenization Percentage
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="token-percentage"
                      type="number"
                      min="1"
                      max="50"
                      value={tokenPercentage}
                      onChange={(e) => setTokenPercentage(e.target.value)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    <Progress
                      value={parseFloat(tokenPercentage)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 5-15% for optimal liquidity vs. control
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Tokenization Summary</h4>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Revenue:
                      </span>
                      <span>
                        RM{" "}
                        {revenueAmount
                          ? parseInt(revenueAmount).toLocaleString()
                          : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>Tokenized ({tokenPercentage}%):</span>
                      <span>RM {tokenizedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retained:</span>
                      <span>RM {retainedAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Platform Fee (3%):</span>
                      <span>
                        RM {(tokenizedAmount * 0.03).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>You Receive:</span>
                      <span>
                        RM {(tokenizedAmount * 0.97).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleTokenize}
                  disabled={!revenueAmount || !tokenPercentage || isTokenizing}
                  className="w-full"
                  size="lg"
                >
                  {isTokenizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Tokenizing Revenue...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Tokenize Revenue
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong> Your tokenized revenue will be
                automatically distributed to token holders after 6 months based
                on actual performance. High forecast accuracy earns bonus
                rewards.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
