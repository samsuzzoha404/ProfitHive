import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useAuth } from "../../contexts/AuthContext";
import { parseEther, formatEther } from "viem";
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
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Loader2,
  TrendingUp,
  Coins,
  Award,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  useTokenBalance,
  useUserStakeInfo,
  useStakeTokens,
  useUnstakeTokens,
  useClaimRewards,
  useApproveTokens,
  getContractAddresses,
  REVENUE_SHARING_ABI,
} from "../../hooks/use-contracts";

export function StakingInterface() {
  const { address, isConnected, chainId } = useAccount();
  const { portalMode } = useAuth();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Get contract addresses
  const contractAddresses = getContractAddresses(chainId || 11155111); // Default to Sepolia

  // Real blockchain data hooks
  const { data: tokenBalance, refetch: refetchTokenBalance } =
    useTokenBalance(address);
  const { data: stakeInfo, refetch: refetchStakeInfo } = useUserStakeInfo();

  // Transaction hooks
  const {
    stakeTokens,
    isPending: isStaking,
    isConfirmed: stakeConfirmed,
  } = useStakeTokens();
  const {
    unstakeTokens,
    isPending: isUnstaking,
    isConfirmed: unstakeConfirmed,
  } = useUnstakeTokens();
  const {
    claimRewards,
    isPending: isClaiming,
    isConfirmed: claimConfirmed,
  } = useClaimRewards();
  const {
    approveTokens,
    isPending: isApproving,
    isConfirmed: approveConfirmed,
  } = useApproveTokens();

  // Clear messages and refetch data after successful transactions
  useEffect(() => {
    if (stakeConfirmed) {
      setSuccessMessage("Successfully staked tokens!");
      setStakeAmount("");
      refetchTokenBalance();
      refetchStakeInfo();
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [stakeConfirmed, refetchTokenBalance, refetchStakeInfo]);

  useEffect(() => {
    if (unstakeConfirmed) {
      setSuccessMessage("Successfully unstaked tokens!");
      setUnstakeAmount("");
      refetchTokenBalance();
      refetchStakeInfo();
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [unstakeConfirmed, refetchTokenBalance, refetchStakeInfo]);

  useEffect(() => {
    if (claimConfirmed) {
      setSuccessMessage("Successfully claimed rewards!");
      refetchStakeInfo();
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [claimConfirmed, refetchStakeInfo]);

  useEffect(() => {
    if (approveConfirmed) {
      setSuccessMessage("Approval successful! You can now stake tokens.");
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [approveConfirmed]);

  const handleStake = async () => {
    if (!stakeAmount || !isConnected) {
      setErrorMessage(
        "Please enter an amount to stake and connect your wallet"
      );
      return;
    }

    setErrorMessage("");

    try {
      await stakeTokens(stakeAmount);
      setStakeAmount("");
    } catch (error) {
      console.error("Staking error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to stake tokens"
      );
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount) {
      setErrorMessage("Please enter an amount to unstake");
      return;
    }

    setErrorMessage("");

    try {
      await unstakeTokens(unstakeAmount);
      setUnstakeAmount("");
    } catch (error) {
      console.error("Unstaking error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to unstake tokens"
      );
    }
  };

  const handleClaimRewards = async () => {
    setErrorMessage("");

    try {
      await claimRewards();
    } catch (error) {
      console.error("Claim rewards error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to claim rewards"
      );
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
            {portalMode === "retailer"
              ? "Business Revenue Sharing"
              : "Token Investment Portfolio"}
          </CardTitle>
          <CardDescription>
            {portalMode === "retailer"
              ? "Tokenize your business revenue and manage profit distribution to investors"
              : "Stake PHIVE tokens to earn a share of platform and business revenue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                {portalMode === "retailer"
                  ? "Business Token Balance"
                  : "Investment Token Balance"}
              </p>
              <p className="text-2xl font-bold">
                {portalMode === "retailer"
                  ? // Retailers start with 0 tokens - they create/sell tokens
                    "0.00"
                  : // Investors can have tokens they purchased
                  tokenBalance
                  ? parseFloat(formatEther(tokenBalance)).toFixed(2)
                  : "0.00"}{" "}
                PHIVE
              </p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">Staked Amount</p>
              <p className="text-2xl font-bold">
                {stakeInfo
                  ? parseFloat(formatEther(stakeInfo[0])).toFixed(2)
                  : "0.00"}{" "}
                PHIVE
              </p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm text-muted-foreground">Claimable Rewards</p>
              <p className="text-2xl font-bold">
                {stakeInfo
                  ? parseFloat(formatEther(stakeInfo[2])).toFixed(4)
                  : "0.0000"}{" "}
                ETH
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
            <CardTitle>
              {portalMode === "retailer"
                ? "Issue Business Tokens"
                : "Stake Investment Tokens"}
            </CardTitle>
            <CardDescription>
              {portalMode === "retailer"
                ? "Create and distribute revenue-sharing tokens for your business"
                : "Lock your PHIVE tokens to earn revenue share from businesses"}
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
                Available:{" "}
                {tokenBalance
                  ? parseFloat(formatEther(tokenBalance)).toFixed(2)
                  : "0.00"}{" "}
                PHIVE
              </p>
            </div>

            <Button
              onClick={handleStake}
              disabled={!stakeAmount || isStaking}
              className="w-full"
            >
              {isStaking ? (
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
                disabled={!stakeInfo || !stakeInfo[3]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Staked:{" "}
                {stakeInfo
                  ? parseFloat(formatEther(stakeInfo[0])).toFixed(2)
                  : "0.00"}{" "}
                PHIVE
              </p>
              {stakeInfo && !stakeInfo[3] && (
                <Badge variant="secondary" className="mt-2">
                  Minimum staking period not met
                </Badge>
              )}
            </div>

            <Button
              onClick={handleUnstake}
              disabled={
                !unstakeAmount || !stakeInfo || !stakeInfo[3] || isUnstaking
              }
              variant="outline"
              className="w-full"
            >
              {isUnstaking ? (
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
      {stakeInfo && parseFloat(formatEther(stakeInfo[2])) > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Claimable Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  You have{" "}
                  {stakeInfo
                    ? parseFloat(formatEther(stakeInfo[2])).toFixed(4)
                    : "0.0000"}{" "}
                  ETH available to claim
                </p>
              </div>
              <Button onClick={handleClaimRewards} disabled={isClaiming}>
                {isClaiming ? (
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
