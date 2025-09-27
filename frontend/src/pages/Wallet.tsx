import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet as WalletIcon, 
  Link as LinkIcon,
  Coins,
  TrendingUp,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Zap
} from 'lucide-react';

const Wallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState({
    eth: 2.45,
    tokens: 150,
    totalValue: 18750
  });
  
  const [transactions] = useState([
    {
      id: 1,
      type: 'buy',
      token: 'CyberCafe Central',
      amount: 50,
      price: 50,
      total: 2500,
      date: '2025-01-15',
      hash: '0x123...abc'
    },
    {
      id: 2,
      type: 'profit',
      token: 'TechMart Cyberjaya', 
      amount: 25,
      price: 120,
      total: 480,
      date: '2025-01-10',
      hash: '0x456...def'
    },
    {
      id: 3,
      type: 'buy',
      token: 'Green Living Store',
      amount: 75,
      price: 35,
      total: 2625,
      date: '2025-01-05', 
      hash: '0x789...ghi'
    }
  ]);

  const connectWallet = async () => {
    // Simulate MetaMask connection
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        // In a real app, this would be: await window.ethereum.request({ method: 'eth_requestAccounts' })
        setIsConnected(true);
        setWalletAddress('0x742d35Cc6634C0532925a3b8D162c62Ab026d8F3');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      // Simulate wallet connection for demo
      setIsConnected(true);
      setWalletAddress('0x742d35Cc6634C0532925a3b8D162c62Ab026d8F3');
    }
  };

  const simulateTransaction = (type: 'buy' | 'distribute') => {
    if (type === 'buy') {
      setBalance(prev => ({
        ...prev,
        tokens: prev.tokens + 25,
        totalValue: prev.totalValue + 2500
      }));
    } else {
      setBalance(prev => ({
        ...prev,
        totalValue: prev.totalValue + 375 // Profit distribution
      }));
    }
  };

  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-primary/20 glow-primary mb-6">
            <Shield className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium text-primary">Secure & Transparent</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Digital</span> Wallet
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your blockchain tokens, track investments, and receive profit distributions 
            through secure smart contracts.
          </p>
        </div>

        {!isConnected ? (
          /* Wallet Connection */
          <div className="max-w-md mx-auto">
            <Card className="glass border-primary/20 hover-lift">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 glow-primary">
                  <WalletIcon className="h-10 w-10 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h2>
                <p className="text-muted-foreground mb-6">
                  Connect your MetaMask wallet to start buying tokens and receiving profit distributions.
                </p>
                <Button 
                  onClick={connectWallet}
                  className="w-full bg-gradient-primary hover-glow"
                  size="lg"
                >
                  <LinkIcon className="mr-2 h-5 w-5" />
                  Connect MetaMask
                </Button>
                <div className="mt-4 p-4 glass rounded-lg border border-accent/20">
                  <p className="text-xs text-muted-foreground">
                    Demo Mode: No MetaMask required. Click to simulate wallet connection.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Wallet Dashboard */
          <div className="space-y-8">
            {/* Wallet Info */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WalletIcon className="h-5 w-5 text-primary" />
                    Wallet Overview
                  </CardTitle>
                  <CardDescription>Connected wallet information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Wallet Address</div>
                    <div className="font-mono text-sm bg-muted/20 p-2 rounded">
                      {walletAddress}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">ETH Balance</div>
                      <div className="text-xl font-bold">{balance.eth} ETH</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Network</div>
                      <div className="text-lg font-semibold text-primary">Ethereum</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-success/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-success" />
                    Token Portfolio
                  </CardTitle>
                  <CardDescription>Your retail investment tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success mb-2">{balance.tokens}</div>
                      <div className="text-sm text-muted-foreground">Total Tokens Owned</div>
                    </div>
                    <div className="text-center p-4 glass rounded-lg">
                      <div className="text-2xl font-bold text-foreground">RM {balance.totalValue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Portfolio Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="glass border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => simulateTransaction('buy')}
                    className="bg-primary hover:bg-primary/90 p-6 h-auto flex-col"
                  >
                    <ArrowDownLeft className="h-6 w-6 mb-2" />
                    <span>Buy Tokens</span>
                    <span className="text-xs opacity-80">Invest in businesses</span>
                  </Button>
                  
                  <Button 
                    onClick={() => simulateTransaction('distribute')}
                    variant="outline"
                    className="glass border-success/30 hover:bg-success/10 p-6 h-auto flex-col"
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span>Receive Profits</span>
                    <span className="text-xs opacity-80">Auto distribution</span>
                  </Button>

                  <Button 
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
                <CardDescription>Recent blockchain transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 glass rounded-lg hover-lift">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'buy' ? 'bg-primary/20' : 'bg-success/20'
                        }`}>
                          {tx.type === 'buy' ? 
                            <ArrowDownLeft className={`h-5 w-5 ${tx.type === 'buy' ? 'text-primary' : 'text-success'}`} /> :
                            <TrendingUp className="h-5 w-5 text-success" />
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {tx.type === 'buy' ? 'Purchased Tokens' : 'Profit Distribution'}
                          </div>
                          <div className="text-sm text-muted-foreground">{tx.token}</div>
                          <div className="text-xs text-muted-foreground font-mono">{tx.hash}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${tx.type === 'buy' ? 'text-primary' : 'text-success'}`}>
                          {tx.type === 'buy' ? '-' : '+'}RM {tx.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">{tx.amount} tokens</div>
                        <div className="text-xs text-muted-foreground">{tx.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profit Distribution Simulation */}
            <Card className="glass border-warning/20">
              <CardHeader>
                <CardTitle className="text-gradient">Automated Profit Distribution</CardTitle>
                <CardDescription>
                  Smart contracts automatically distribute profits based on your token ownership
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 glass rounded-lg">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">Monthly</div>
                    <div className="text-sm text-muted-foreground">Distribution Frequency</div>
                  </div>
                  <div className="text-center p-4 glass rounded-lg">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground">Transparent</div>
                  </div>
                  <div className="text-center p-4 glass rounded-lg">
                    <Coins className="h-8 w-8 text-accent mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">Pro-rata</div>
                    <div className="text-sm text-muted-foreground">Fair Distribution</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
};

export default Wallet;