import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ChevronRight, Coins } from "lucide-react";

export function WalletConnection() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-500" />
              Wallet Connected
            </CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {chain?.name || "Unknown"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Address</p>
            <p className="font-mono text-xs bg-muted p-2 rounded break-all">
              {address}
            </p>
          </div>

          <div className="flex gap-2">
            <ConnectButton.Custom>
              {({ openAccountModal }) => (
                <Button
                  onClick={openAccountModal}
                  variant="outline"
                  className="flex-1"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Account Details
                </Button>
              )}
            </ConnectButton.Custom>

            <Button
              onClick={() => disconnect()}
              variant="destructive"
              size="sm"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your wallet to access ProfitHive features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ConnectButton.Custom>
            {({ openConnectModal, connectModalOpen }) => (
              <Button
                onClick={openConnectModal}
                disabled={connectModalOpen}
                className="w-full"
                size="lg"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </ConnectButton.Custom>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Supported wallets:</p>
            <p>• MetaMask • WalletConnect • Coinbase Wallet</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
