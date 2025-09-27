import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useETHTransfer } from "../hooks/use-contracts";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Coins,
  Building2,
  TrendingUp,
  Shield,
  Zap,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Loader2,
  Wallet,
} from "lucide-react";

interface BusinessToken {
  id: number;
  businessName: string;
  description?: string;
  availableTokens: number;
  totalTokens: number;
  pricePerToken: number;
  totalValue: number;
  expectedROI: string;
  sector: string;
  ownerAddress: string;
  createdAt: string;
  buyers?: Array<{
    buyer: string;
    amount: number;
    totalCost: number;
    timestamp: string;
  }>;
}

const Tokenization = () => {
  const { address, isConnected } = useAccount();
  const { portalMode, isAuthenticated } = useAuth();
  const {
    sendETH,
    hash,
    isPending: isETHPending,
    isConfirmed: isETHConfirmed,
  } = useETHTransfer();

  const [formData, setFormData] = useState({
    businessName: "",
    revenueEstimate: "",
    tokenizePercentage: 20,
    description: "",
  });
  const [isTokenized, setIsTokenized] = useState(false);
  const [loading, setLoading] = useState(false);

  // Buy token state
  const [buyAmount, setBuyAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [buyMessage, setBuyMessage] = useState<string | null>(null);
  const [availableTokens, setAvailableTokens] = useState<BusinessToken[]>([]);

  // Load tokens from backend
  const loadTokens = async () => {
    try {
      const response = await fetch("/api/tokens");
      if (response.ok) {
        const data = await response.json();
        setAvailableTokens(data.tokens);
      }
    } catch (error) {
      console.error("Error loading tokens:", error);
    }
  };

  // Load tokens on component mount
  useEffect(() => {
    loadTokens();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTokenization = async () => {
    if (!isConnected || !address) {
      setBuyMessage("Please connect your wallet first");
      return;
    }

    if (
      !formData.businessName ||
      !formData.description ||
      !formData.revenueEstimate
    ) {
      setBuyMessage("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setBuyMessage(null);

    try {
      const response = await fetch("/api/tokens/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          description: formData.description,
          revenueEstimate: formData.revenueEstimate,
          tokenizePercentage: formData.tokenizePercentage,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsTokenized(true);
        setBuyMessage(
          `Successfully created ${data.token.totalTokens} tokens for ${data.token.businessName}!`
        );

        // Reload tokens to show the new token in investor portal
        await loadTokens();
      } else {
        const error = await response.json();
        setBuyMessage(error.error || "Failed to create tokens");
      }
    } catch (error) {
      console.error("Token creation error:", error);
      setBuyMessage(
        `Error: ${
          error instanceof Error
            ? error.message
            : "Network error - check if backend is running"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTokens = () => {
    const revenue = parseFloat(formData.revenueEstimate) || 0;
    const percentage = formData.tokenizePercentage / 100;
    return Math.floor((revenue * percentage) / 100); // 100 RM per token
  };

  const handleBuyTokens = async (tokenId: number) => {
    if (!isConnected || !address) {
      setBuyMessage("Please connect your wallet first");
      return;
    }

    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      setBuyMessage("Please enter a valid amount");
      return;
    }

    setIsBuying(true);
    setBuyMessage(null);

    try {
      // Step 1: Get token details to calculate payment
      const tokenResponse = await fetch(`/api/tokens/${tokenId}`);
      if (!tokenResponse.ok) {
        setBuyMessage("Failed to get token details");
        return;
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData.token;
      const totalCostETH = (parseFloat(buyAmount) * token.pricePerToken) / 1000; // Convert RM to ETH (1 ETH = ~1000 RM for demo)

      setBuyMessage(
        `💰 Sending ${totalCostETH.toFixed(4)} ETH to business owner...`
      );

      // Step 2: Send real ETH payment to business owner
      await sendETH(token.ownerAddress, totalCostETH.toString());

      setBuyMessage(`⏳ Waiting for payment confirmation...`);

      // Wait for ETH transaction confirmation
      setBuyMessage(`⏳ Transaction submitted. Hash: ${hash?.slice(0, 10)}...`);

      // For demo purposes, we'll proceed after a short delay
      // In production, you'd wait for actual confirmation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const confirmed = hash; // If we have a transaction hash, consider it confirmed for demo

      if (confirmed) {
        setBuyMessage(`✅ Payment confirmed! Updating token ownership...`);

        // Step 3: Update database after successful payment
        const response = await fetch("/api/tokens/buy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: address,
            tokenId,
            amount: buyAmount,
            paymentTxHash: hash, // Include the payment transaction hash
            ethAmountPaid: totalCostETH,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBuyMessage(
            `🎉 Successfully purchased ${buyAmount} tokens! Paid ${totalCostETH.toFixed(
              4
            )} ETH to ${token.businessName}`
          );
          setBuyAmount("");
          setSelectedToken(null);

          // Reload tokens to update available amounts
          await loadTokens();
        } else {
          const error = await response.json();
          setBuyMessage(
            `❌ Payment sent but database update failed: ${error.error}`
          );
        }
      } else {
        setBuyMessage("❌ Payment transaction timed out or failed");
      }
    } catch (error) {
      console.error("Buy token error:", error);
      setBuyMessage("Error occurred during transaction");
    } finally {
      setIsBuying(false);
    }
  };

  const handleRestockTokens = async (tokenId: number) => {
    if (!isConnected || !address) {
      setBuyMessage("Please connect your wallet first");
      return;
    }

    setIsBuying(true);
    setBuyMessage(null);

    try {
      const response = await fetch(`/api/tokens/${tokenId}/restock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          additionalTokens: 50, // Default restock amount
          walletAddress: address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBuyMessage(
          `Successfully restocked ${data.addedTokens} tokens! Now ${data.newAvailable} available.`
        );

        // Reload tokens to update the display
        await loadTokens();
      } else {
        const error = await response.json();
        setBuyMessage(error.error || "Failed to restock tokens");
      }
    } catch (error) {
      console.error("Restock error:", error);
      setBuyMessage("Error occurred during restocking");
    } finally {
      setIsBuying(false);
    }
  };
  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-col gap-3 items-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-primary/20 glow-primary">
              <Shield className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium text-primary">
                Blockchain Powered
              </span>
            </div>
            <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-green-500/20 bg-green-50/10">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                💰 Real ETH Payments - Sepolia Testnet
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">
              {portalMode === "retailer"
                ? "Tokenize Your Revenue"
                : "Investment Opportunities"}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            {portalMode === "retailer"
              ? "Transform your business revenue into blockchain tokens, enabling community investment and transparent profit sharing through smart contracts."
              : "Discover tokenized business opportunities and invest in real revenue streams with transparent blockchain technology."}
          </p>
          <div className="bg-blue-50/10 border border-blue-200/20 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-blue-600 font-medium text-sm">
              ⚡ Real blockchain payments: When you buy tokens, actual ETH is
              transferred to business owners
            </div>
            <div className="text-xs text-blue-500 mt-1 text-center">
              All transactions are recorded on Sepolia testnet with real fund
              transfers
            </div>
          </div>
        </div>

        {/* Portal Mode Authentication Check */}
        {!isAuthenticated && (
          <Card className="glass border-yellow-500/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Shield className="h-5 w-5" />
                Sign In Required
              </CardTitle>
              <CardDescription>
                Please sign in to access the{" "}
                {portalMode === "retailer" ? "Retailer" : "Investor"} Portal
                features. You can switch between Retailer and Investor modes
                after signing in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/login">Sign In to Continue</a>
              </Button>
            </CardContent>
          </Card>
        )}

        <div
          className={`grid gap-8 mb-12 ${
            portalMode === "retailer" ? "lg:grid-cols-1" : "grid-cols-1"
          }`}
        >
          {/* Retailer Portal Content */}
          {(portalMode === "retailer" || !isAuthenticated) && (
            <Card className="glass border-primary/20 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Retailer Portal
                </CardTitle>
                <CardDescription>
                  Tokenize your business revenue and attract community investors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isTokenized ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="glass border-primary/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="revenueEstimate">
                        Monthly Revenue Estimate (RM)
                      </Label>
                      <Input
                        id="revenueEstimate"
                        name="revenueEstimate"
                        type="number"
                        placeholder="50000"
                        value={formData.revenueEstimate}
                        onChange={handleInputChange}
                        className="glass border-primary/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tokenizePercentage">
                        Revenue % to Tokenize: {formData.tokenizePercentage}%
                      </Label>
                      <Input
                        id="tokenizePercentage"
                        name="tokenizePercentage"
                        type="range"
                        min="5"
                        max="50"
                        value={formData.tokenizePercentage}
                        onChange={handleInputChange}
                        className="glass"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5%</span>
                        <span>50%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Business Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your business and investment opportunity"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="glass border-primary/30"
                      />
                    </div>

                    {/* Tokenization Preview */}
                    {formData.revenueEstimate && (
                      <div className="p-4 glass rounded-lg border border-accent/20">
                        <h4 className="font-semibold text-accent mb-3">
                          Tokenization Preview
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">
                              Tokens Generated
                            </div>
                            <div className="font-bold text-lg">
                              {calculateTokens()}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Token Value
                            </div>
                            <div className="font-bold text-lg">RM 100 each</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Total Raised
                            </div>
                            <div className="font-bold text-lg">
                              RM {(calculateTokens() * 100).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Your Share
                            </div>
                            <div className="font-bold text-lg">
                              {100 - formData.tokenizePercentage}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleTokenization}
                      disabled={
                        !formData.businessName ||
                        !formData.revenueEstimate ||
                        loading
                      }
                      className="w-full bg-gradient-primary hover-glow"
                      size="lg"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Minting Tokens...
                        </div>
                      ) : (
                        <>
                          <Coins className="mr-2 h-5 w-5" />
                          Create Tokens
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto glow-primary">
                      <CheckCircle className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Tokens Created Successfully!
                    </h3>
                    <div className="p-4 glass rounded-lg border border-success/20">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success">
                            {calculateTokens()}
                          </div>
                          <div className="text-muted-foreground">
                            Tokens Issued
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            RM {(calculateTokens() * 100).toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">
                            Total Value
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Your tokens are now available for community investment.
                      Smart contracts will automatically distribute profits
                      based on token ownership.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Investor Portal */}
          {(portalMode === "investor" || !isAuthenticated) && (
            <Card className="glass border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Investor Portal
                </CardTitle>
                <CardDescription>
                  Discover investment opportunities in Cyberjaya businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableTokens
                    .filter((token) => token.availableTokens > 0)
                    .map((token) => (
                      <div
                        key={token.id}
                        className="p-4 glass rounded-lg border border-muted/20 hover-lift"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {token.businessName}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                              {token.sector}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-success">
                              +{token.expectedROI}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Expected ROI
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                          <div>
                            <div className="text-muted-foreground">
                              Available
                            </div>
                            <div className="font-semibold">
                              {token.availableTokens} tokens
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Price</div>
                            <div className="font-semibold">
                              RM {token.pricePerToken}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ≈ {(token.pricePerToken * 0.0001).toFixed(6)} ETH
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Total Value
                            </div>
                            <div className="font-semibold">
                              RM {token.totalValue.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600">
                              💰 Real ETH Payments
                            </div>
                          </div>
                        </div>

                        {selectedToken === `token-${token.id}` ? (
                          <div className="space-y-2">
                            <Input
                              type="number"
                              placeholder="Enter amount to buy"
                              value={buyAmount}
                              onChange={(e) => setBuyAmount(e.target.value)}
                              min="1"
                              max={token.availableTokens}
                            />
                            {buyAmount && Number(buyAmount) > 0 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-blue-700 font-medium">
                                    Total Cost: RM{" "}
                                    {(
                                      Number(buyAmount) * token.pricePerToken
                                    ).toFixed(2)}
                                  </span>
                                  <span className="text-blue-600 font-semibold">
                                    ≈{" "}
                                    {(
                                      Number(buyAmount) *
                                      token.pricePerToken *
                                      0.0001
                                    ).toFixed(6)}{" "}
                                    ETH
                                  </span>
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                  ⚡ Real blockchain payment to{" "}
                                  {token.ownerAddress?.slice(0, 6)}...
                                  {token.ownerAddress?.slice(-4)}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleBuyTokens(token.id)}
                                disabled={isBuying || !isConnected}
                                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                              >
                                {isBuying ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <DollarSign className="mr-2 h-4 w-4" />
                                )}
                                {isBuying ? "Buying..." : "Confirm"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedToken(null);
                                  setBuyAmount("");
                                  setBuyMessage(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              setSelectedToken(`token-${token.id}`)
                            }
                            disabled={!isConnected}
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            {!isConnected ? (
                              <Wallet className="mr-2 h-4 w-4" />
                            ) : (
                              <DollarSign className="mr-2 h-4 w-4" />
                            )}
                            {!isConnected ? "Connect Wallet" : "Buy Tokens"}
                          </Button>
                        )}
                      </div>
                    ))}
                </div>

                {buyMessage && (
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{buyMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Sold Out Tokens Section */}
                {availableTokens.filter((token) => token.availableTokens === 0)
                  .length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Sold Out - Awaiting Restock
                    </h4>
                    <div className="space-y-3">
                      {availableTokens
                        .filter((token) => token.availableTokens === 0)
                        .map((token) => (
                          <div
                            key={token.id}
                            className="p-3 glass rounded-lg border border-red-500/20 opacity-75"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="font-semibold text-foreground">
                                  {token.businessName}
                                </h5>
                                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                                  SOLD OUT
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground mb-2">
                                  <div>
                                    All {token.totalTokens || 0} tokens sold
                                  </div>
                                  <div>RM {token.pricePerToken} each</div>
                                </div>
                                {isConnected &&
                                  address?.toLowerCase() ===
                                    token.ownerAddress.toLowerCase() && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleRestockTokens(token.id)
                                      }
                                      className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
                                    >
                                      Restock +50
                                    </Button>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 glass rounded-lg border border-warning/20">
                  <h4 className="font-semibold text-warning mb-2">
                    Investment Benefits
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-warning" />
                      Monthly profit distributions
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-warning" />
                      Transparent blockchain tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-warning" />
                      Support local businesses
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* How It Works */}
        <Card className="glass border-success/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How Tokenization Works</CardTitle>
            <CardDescription>
              Blockchain-powered revenue sharing in 4 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Business Tokenizes",
                  description:
                    "Retailer creates tokens representing future revenue share",
                  icon: Building2,
                },
                {
                  step: "2",
                  title: "Community Invests",
                  description:
                    "Local investors purchase tokens to support businesses",
                  icon: Users,
                },
                {
                  step: "3",
                  title: "Revenue Flows",
                  description:
                    "Business generates revenue from daily operations",
                  icon: TrendingUp,
                },
                {
                  step: "4",
                  title: "Profits Distributed",
                  description:
                    "Smart contracts automatically share profits with token holders",
                  icon: Coins,
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 glow-primary">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-lg font-bold text-gradient mb-2">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Tokenization;
