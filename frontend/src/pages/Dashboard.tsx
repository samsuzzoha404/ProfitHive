import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  TrendingUp,
  BarChart3,
  Coins,
  DollarSign,
  Calendar,
  Download,
  Eye,
  Zap,
} from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"retailer" | "investor">("retailer");

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

  const retailerData = {
    totalRevenue: 125000,
    monthlyGrowth: 15.3,
    tokensIssued: 250,
    investorsCount: 47,
    forecasts: [
      { month: "Jan 2025", predicted: 45000, actual: 42000, accuracy: 93 },
      { month: "Feb 2025", predicted: 52000, actual: null, accuracy: null },
      { month: "Mar 2025", predicted: 58000, actual: null, accuracy: null },
    ],
    recentTransactions: [
      {
        date: "2025-01-15",
        type: "Token Sale",
        amount: 5000,
        investor: "Community Pool",
      },
      {
        date: "2025-01-10",
        type: "Profit Distribution",
        amount: -3200,
        investor: "All Holders",
      },
      {
        date: "2025-01-05",
        type: "Token Sale",
        amount: 7500,
        investor: "Individual Investors",
      },
    ],
  };

  const investorData = {
    portfolioValue: 18750,
    totalTokens: 150,
    monthlyReturns: 8.5,
    profitsReceived: 2340,
    ownedTokens: [
      { business: "CyberCafe Central", tokens: 50, value: 6250, roi: 8.5 },
      { business: "TechMart Cyberjaya", tokens: 25, value: 4500, roi: 12.3 },
      { business: "Green Living Store", tokens: 75, value: 8000, roi: 9.7 },
    ],
    profitHistory: [
      { date: "2025-01-15", business: "CyberCafe Central", amount: 425 },
      { date: "2025-01-10", business: "TechMart Cyberjaya", amount: 615 },
      { date: "2025-01-05", business: "Green Living Store", amount: 580 },
    ],
  };

  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-primary/20 glow-primary mb-6">
            <Eye className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium text-primary">
              Unified Analytics
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Smart</span> Dashboard
          </h1>

          {/* Role Toggle */}
          <div className="flex justify-center mb-6">
            <div className="glass rounded-lg p-1 border border-primary/20">
              <Button
                variant={viewMode === "retailer" ? "default" : "ghost"}
                onClick={() => setViewMode("retailer")}
                className={
                  viewMode === "retailer"
                    ? "bg-gradient-primary"
                    : "hover:bg-muted/20"
                }
              >
                <Building2 className="mr-2 h-4 w-4" />
                Retailer View
              </Button>
              <Button
                variant={viewMode === "investor" ? "default" : "ghost"}
                onClick={() => setViewMode("investor")}
                className={
                  viewMode === "investor"
                    ? "bg-gradient-secondary"
                    : "hover:bg-muted/20"
                }
              >
                <Users className="mr-2 h-4 w-4" />
                Investor View
              </Button>
            </div>
          </div>
        </div>

        {/* Retailer Dashboard */}
        {viewMode === "retailer" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="glass border-primary/20 glow-primary hover-lift">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    RM {retailerData.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Revenue
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-success/20 glow-success hover-lift">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-success mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    +{retailerData.monthlyGrowth}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monthly Growth
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-accent/20 glow-accent hover-lift">
                <CardContent className="p-6 text-center">
                  <Coins className="h-8 w-8 text-accent mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {retailerData.tokensIssued}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tokens Issued
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-secondary/20 hover-lift">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-secondary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {retailerData.investorsCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Investors
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Tables */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Forecast Accuracy */}
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    AI Forecast Performance
                  </CardTitle>
                  <CardDescription>Predicted vs actual revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {retailerData.forecasts.map((forecast, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 glass rounded-lg"
                      >
                        <div>
                          <div className="font-semibold text-foreground">
                            {forecast.month}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Predicted: RM {forecast.predicted.toLocaleString()}
                          </div>
                          {forecast.actual && (
                            <div className="text-sm text-muted-foreground">
                              Actual: RM {forecast.actual.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {forecast.accuracy ? (
                            <div className="text-lg font-bold text-success">
                              {forecast.accuracy}%
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-accent">
                              Pending
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Accuracy
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="glass border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Token sales and distributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {retailerData.recentTransactions.map((tx, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 glass rounded-lg"
                      >
                        <div>
                          <div className="font-semibold text-foreground">
                            {tx.type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tx.investor}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.date}
                          </div>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            tx.amount > 0 ? "text-success" : "text-primary"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}RM{" "}
                          {Math.abs(tx.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Investor Dashboard */}
        {viewMode === "investor" && (
          <div className="space-y-8">
            {/* Portfolio Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="glass border-success/20 glow-success hover-lift">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-success mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    RM {investorData.portfolioValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Portfolio Value
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-primary/20 glow-primary hover-lift">
                <CardContent className="p-6 text-center">
                  <Coins className="h-8 w-8 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {investorData.totalTokens}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Tokens
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-accent/20 glow-accent hover-lift">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-accent mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    +{investorData.monthlyReturns}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monthly Returns
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-secondary/20 hover-lift">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-secondary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    RM {investorData.profitsReceived.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Profits Received
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Owned Tokens & Profit History */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Token Holdings
                  </CardTitle>
                  <CardDescription>Your business investments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investorData.ownedTokens.map((token, index) => (
                      <div
                        key={index}
                        className="p-4 glass rounded-lg hover-lift"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-foreground">
                            {token.business}
                          </div>
                          <div className="text-lg font-bold text-success">
                            +{token.roi}%
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">
                              Tokens Owned
                            </div>
                            <div className="font-semibold">{token.tokens}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Current Value
                            </div>
                            <div className="font-semibold">
                              RM {token.value.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-success/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Profit History
                  </CardTitle>
                  <CardDescription>Recent profit distributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investorData.profitHistory.map((profit, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 glass rounded-lg hover-lift"
                      >
                        <div>
                          <div className="font-semibold text-foreground">
                            {profit.business}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {profit.date}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-success">
                          +RM {profit.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Export Options */}
        <Card className="glass border-warning/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Export Reports
                </h3>
                <p className="text-sm text-muted-foreground">
                  Download detailed analytics and transaction history for your
                  records.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="glass border-primary/30 hover:bg-primary/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  className="glass border-accent/30 hover:bg-accent/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Dashboard;
