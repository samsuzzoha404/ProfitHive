import React, { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet as WalletIcon,
  Coins,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  Link as LinkIcon,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { WalletConnection } from "@/components/web3/WalletConnection";
import { StakingInterface } from "@/components/web3/StakingInterface";
import { TokenizationInterface } from "@/components/web3/TokenizationInterface";

const Wallet = () => {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({
    address: address as `0x${string}`,
  });

  // Mock data for demo purposes - in production, fetch from smart contracts
  const [mockBalance, setMockBalance] = useState({
    tokens: "1,250",
    totalValue: 25000,
  });

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: "buy" as const,
      token: "Retail Store A Tokens",
      amount: 100,
      total: 5000,
      hash: "0x1234...abcd",
      date: "2024-01-15",
    },
    {
      id: 2,
      type: "distribute" as const,
      token: "Quarterly Profits",
      amount: 50,
      total: 2500,
      hash: "0x5678...efgh",
      date: "2024-01-01",
    },
  ]);

  const handleBuyTokens = async () => {
    // In production, this would interact with smart contracts
    console.log("Buying tokens...");
    // Mock transaction simulation
    const newTransaction = {
      id: Date.now(),
      type: "buy" as const,
      token: "Retail Store B Tokens",
      amount: 50,
      total: 2500,
      hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random()
        .toString(16)
        .substr(2, 4)}`,
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions([newTransaction, ...transactions]);
    setMockBalance((prev) => ({
      tokens: (parseInt(prev.tokens.replace(",", "")) + 50).toLocaleString(),
      totalValue: prev.totalValue + 2500,
    }));
  };

  const handleReceiveProfits = async () => {
    console.log("Receiving profit distribution...");
    // Mock profit distribution
    const newTransaction = {
      id: Date.now(),
      type: "distribute" as const,
      token: "Monthly Profits",
      amount: 25,
      total: 1250,
      hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random()
        .toString(16)
        .substr(2, 4)}`,
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleTransferTokens = () => {
    console.log("Transfer tokens functionality - to be implemented");
  };

  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium text-primary">
              Secure & Transparent
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Digital
            </span>{" "}
            Wallet
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your blockchain tokens, track investments, and receive profit
            distributions through secure smart contracts.
          </p>
        </div>

        {!isConnected ? (
          /* Wallet Connection */
          <div className="max-w-md mx-auto">
            <WalletConnection />
          </div>
        ) : (
          /* Wallet Dashboard */
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="staking">Staking</TabsTrigger>
              <TabsTrigger value="tokenization">Tokenization</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Wallet Info */}
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-card/50 backdrop-blur border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <WalletIcon className="h-5 w-5 text-primary" />
                      Wallet Overview
                    </CardTitle>
                    <CardDescription>
                      Connected wallet information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Wallet Address
                      </div>
                      <div className="font-mono text-sm bg-muted/20 p-2 rounded break-all">
                        {address || "Not connected"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          ETH Balance
                        </div>
                        <div className="text-xl font-bold">
                          {ethBalance
                            ? parseFloat(ethBalance.formatted).toFixed(4)
                            : "0.0000"}{" "}
                          ETH
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Network
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          Ethereum
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur border-success/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-success" />
                      Token Portfolio
                    </CardTitle>
                    <CardDescription>
                      Your retail investment tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success mb-2">
                          {mockBalance.tokens}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Tokens Owned
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <div className="text-2xl font-bold text-foreground">
                          RM {mockBalance.totalValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Portfolio Value
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-card/50 backdrop-blur border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      onClick={handleBuyTokens}
                      className="bg-primary hover:bg-primary/90 p-6 h-auto flex-col"
                    >
                      <ArrowDownLeft className="h-6 w-6 mb-2" />
                      <span>Buy Tokens</span>
                      <span className="text-xs opacity-80">
                        Invest in businesses
                      </span>
                    </Button>

                    <Button
                      onClick={handleReceiveProfits}
                      variant="outline"
                      className="bg-card/50 border-success/30 hover:bg-success/10 p-6 h-auto flex-col"
                    >
                      <TrendingUp className="h-6 w-6 mb-2" />
                      <span>Receive Profits</span>
                      <span className="text-xs opacity-80">
                        Auto distribution
                      </span>
                    </Button>

                    <Button
                      onClick={handleTransferTokens}
                      variant="outline"
                      className="glass border-accent/30 hover:bg-accent/10 p-6 h-auto flex-col"
                    >
                      <ArrowUpRight className="h-6 w-6 mb-2" />
                      <span>Transfer Tokens</span>
                      <span className="text-xs opacity-80">Send to others</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card className="glass border-muted/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-foreground" />
                    Transaction History
                  </CardTitle>
                  <CardDescription>
                    Recent blockchain transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 glass rounded-lg hover-lift"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === "buy"
                                ? "bg-primary/20"
                                : "bg-success/20"
                            }`}
                          >
                            {tx.type === "buy" ? (
                              <ArrowDownLeft
                                className={`h-5 w-5 ${
                                  tx.type === "buy"
                                    ? "text-primary"
                                    : "text-success"
                                }`}
                              />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-success" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {tx.type === "buy"
                                ? "Purchased Tokens"
                                : "Profit Distribution"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {tx.token}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {tx.hash}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold ${
                              tx.type === "buy"
                                ? "text-primary"
                                : "text-success"
                            }`}
                          >
                            {tx.type === "buy" ? "-" : "+"}RM{" "}
                            {tx.total.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tx.amount} tokens
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Profit Distribution Simulation */}
              <Card className="glass border-warning/20">
                <CardHeader>
                  <CardTitle className="text-gradient">
                    Automated Profit Distribution
                  </CardTitle>
                  <CardDescription>
                    Smart contracts automatically distribute profits based on
                    your token ownership
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 glass rounded-lg">
                      <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">
                        Monthly
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Distribution Frequency
                      </div>
                    </div>
                    <div className="text-center p-4 glass rounded-lg">
                      <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">
                        100%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Transparent
                      </div>
                    </div>
                    <div className="text-center p-4 glass rounded-lg">
                      <Coins className="h-8 w-8 text-accent mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">
                        Pro-rata
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Fair Distribution
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staking">
              <StakingInterface />
            </TabsContent>

            <TabsContent value="tokenization">
              <TokenizationInterface />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Portfolio Analytics
                  </CardTitle>
                  <CardDescription>
                    Track your investment performance and returns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Returns
                      </p>
                      <p className="text-2xl font-bold text-green-500">
                        +15.2%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Monthly Yield
                      </p>
                      <p className="text-2xl font-bold text-primary">2.1%</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Businesses
                      </p>
                      <p className="text-2xl font-bold text-orange-500">5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
};

export default Wallet;
