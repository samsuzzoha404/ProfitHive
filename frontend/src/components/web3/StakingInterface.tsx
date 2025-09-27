import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, Coins, Award, Clock } from "lucide-react";
import {
  CONTRACT_ADDRESSES,
  REVENUE_SHARING_ABI,
  PROFITHIVE_TOKEN_ABI,
} from "@/lib/contracts";

export function StakingInterface() {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [contractAddresses, setContractAddresses] =
    useState(CONTRACT_ADDRESSES);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Mock data for demo purposes
  const [mockData, setMockData] = useState({
    tokenBalance: "5000.0",
    stakedAmount: "2500.0",
    claimableRewards: "25.5",
    canUnstake: true,
  });

  // Load contract addresses from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/blockchain/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.contracts) {
          setContractAddresses(data.contracts);
        }
      })
      .catch((error) => {
        console.error("Failed to load contract addresses:", error);
        setErrorMessage("Failed to connect to blockchain services");
      });
  }, []);

  const handleStake = async () => {
    if (!stakeAmount || !contractAddresses.RevenueSharing) {
      setErrorMessage("Please enter an amount to stake");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // In production, this would interact with smart contracts
      // For now, we'll simulate the transaction

      if (!isConnected) {
        setErrorMessage("Please connect your wallet first");
        setIsLoading(false);
        return;
      }

      // Simulate API call to backend for staking
      const response = await fetch(
        "http://localhost:5000/api/blockchain/stake",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress: address,
            amount: stakeAmount,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(`Successfully staked ${stakeAmount} PHIVE tokens!`);
        setStakeAmount("");

        // Update mock data
        setMockData((prev) => ({
          ...prev,
          tokenBalance: (
            parseFloat(prev.tokenBalance) - parseFloat(stakeAmount)
          ).toString(),
          stakedAmount: (
            parseFloat(prev.stakedAmount) + parseFloat(stakeAmount)
          ).toString(),
        }));
      } else {
        throw new Error("Staking failed");
      }
    } catch (error) {
      console.error("Staking error:", error);
      setErrorMessage("Staking transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || !contractAddresses.RevenueSharing) {
      setErrorMessage("Please enter an amount to unstake");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Simulate API call to backend for unstaking
      const response = await fetch(
        "http://localhost:5000/api/blockchain/unstake",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress: address,
            amount: unstakeAmount,
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage(
          `Successfully unstaked ${unstakeAmount} PHIVE tokens!`
        );
        setUnstakeAmount("");

        // Update mock data
        setMockData((prev) => ({
          ...prev,
          tokenBalance: (
            parseFloat(prev.tokenBalance) + parseFloat(unstakeAmount)
          ).toString(),
          stakedAmount: (
            parseFloat(prev.stakedAmount) - parseFloat(unstakeAmount)
          ).toString(),
        }));
      } else {
        throw new Error("Unstaking failed");
      }
    } catch (error) {
      console.error("Unstaking error:", error);
      setErrorMessage("Unstaking transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!contractAddresses.RevenueSharing) return;

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Simulate API call for claiming rewards
      const response = await fetch(
        "http://localhost:5000/api/blockchain/claim-rewards",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress: address,
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage(
          `Successfully claimed ${mockData.claimableRewards} ETH in rewards!`
        );

        // Update mock data
        setMockData((prev) => ({
          ...prev,
          claimableRewards: "0.0",
        }));
      } else {
        throw new Error("Claiming rewards failed");
      }
    } catch (error) {
      console.error("Claim rewards error:", error);
      setErrorMessage("Failed to claim rewards. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">
            Connect your wallet to start staking
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert>
          <AlertDescription className="text-green-600">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Staking Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Staking Overview
          </CardTitle>
          <CardDescription>
            Stake PHIVE tokens to earn a share of platform revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Token Balance</p>
              <p className="text-2xl font-bold">
                {parseFloat(mockData.tokenBalance).toFixed(2)} PHIVE
              </p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">Staked Amount</p>
              <p className="text-2xl font-bold">
                {parseFloat(mockData.stakedAmount).toFixed(2)} PHIVE
              </p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm text-muted-foreground">Claimable Rewards</p>
              <p className="text-2xl font-bold">
                {parseFloat(mockData.claimableRewards).toFixed(4)} ETH
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stake Tokens */}
        <Card>
          <CardHeader>
            <CardTitle>Stake Tokens</CardTitle>
            <CardDescription>
              Lock your PHIVE tokens to earn revenue share
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stake-amount">Amount to Stake</Label>
              <Input
                id="stake-amount"
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {parseFloat(mockData.tokenBalance).toFixed(2)} PHIVE
              </p>
            </div>

            <Button
              onClick={handleStake}
              disabled={!stakeAmount || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Staking...
                </>
              ) : (
                "Stake Tokens"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Unstake Tokens */}
        <Card>
          <CardHeader>
            <CardTitle>Unstake Tokens</CardTitle>
            <CardDescription>
              Withdraw your staked tokens (7-day minimum)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="unstake-amount">Amount to Unstake</Label>
              <Input
                id="unstake-amount"
                type="number"
                placeholder="0.00"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                disabled={!mockData.canUnstake}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Staked: {parseFloat(mockData.stakedAmount).toFixed(2)} PHIVE
              </p>
              {!mockData.canUnstake && (
                <Badge variant="secondary" className="mt-2">
                  Minimum staking period not met
                </Badge>
              )}
            </div>

            <Button
              onClick={handleUnstake}
              disabled={!unstakeAmount || !mockData.canUnstake || isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Unstaking...
                </>
              ) : (
                "Unstake Tokens"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Claim Rewards */}
      {parseFloat(mockData.claimableRewards) > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Claimable Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  You have {parseFloat(mockData.claimableRewards).toFixed(4)}{" "}
                  ETH available to claim
                </p>
              </div>
              <Button onClick={handleClaimRewards} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  "Claim Rewards"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Revenue Distribution Info */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">60%</p>
              <p className="text-sm text-muted-foreground">To Stakers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">20%</p>
              <p className="text-sm text-muted-foreground">To Forecasters</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">20%</p>
              <p className="text-sm text-muted-foreground">To Platform</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Status */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Revenue Sharing Contract:</span>
              <Badge
                variant={
                  contractAddresses.RevenueSharing ? "default" : "secondary"
                }
              >
                {contractAddresses.RevenueSharing ? "Deployed" : "Not Deployed"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Token Contract:</span>
              <Badge
                variant={
                  contractAddresses.ProfitHiveToken ? "default" : "secondary"
                }
              >
                {contractAddresses.ProfitHiveToken
                  ? "Deployed"
                  : "Not Deployed"}
              </Badge>
            </div>
            {contractAddresses.RevenueSharing && (
              <p className="text-xs text-muted-foreground font-mono break-all">
                Revenue: {contractAddresses.RevenueSharing}
              </p>
            )}
            {contractAddresses.ProfitHiveToken && (
              <p className="text-xs text-muted-foreground font-mono break-all">
                Token: {contractAddresses.ProfitHiveToken}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
