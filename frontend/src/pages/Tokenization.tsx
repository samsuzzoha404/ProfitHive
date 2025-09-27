import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Coins, 
  Building2, 
  TrendingUp, 
  Shield,
  Zap,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Tokenization = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    revenueEstimate: '',
    tokenizePercentage: 20,
    description: ''
  });
  const [isTokenized, setIsTokenized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTokens] = useState([
    {
      id: 1,
      business: "CyberCafe Central",
      tokens: 500,
      price: 50,
      totalValue: 25000,
      roi: "8.5%",
      sector: "F&B"
    },
    {
      id: 2,
      business: "TechMart Cyberjaya",
      tokens: 250,
      price: 120,
      totalValue: 30000,
      roi: "12.3%", 
      sector: "Electronics"
    },
    {
      id: 3,
      business: "Green Living Store",
      tokens: 750,
      price: 35,
      totalValue: 26250,
      roi: "9.7%",
      sector: "Retail"
    }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTokenization = async () => {
    setLoading(true);
    // Simulate blockchain tokenization
    setTimeout(() => {
      setIsTokenized(true);
      setLoading(false);
    }, 3000);
  };

  const calculateTokens = () => {
    const revenue = parseFloat(formData.revenueEstimate) || 0;
    const percentage = formData.tokenizePercentage / 100;
    return Math.floor((revenue * percentage) / 100); // 100 RM per token
  };

  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-primary/20 glow-primary mb-6">
            <Shield className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium text-primary">Blockchain Powered</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Revenue</span> Tokenization
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your business revenue into blockchain tokens, enabling community investment 
            and transparent profit sharing through smart contracts.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Retailer Tokenization Form */}
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
                    <Label htmlFor="revenueEstimate">Monthly Revenue Estimate (RM)</Label>
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
                    <Label htmlFor="tokenizePercentage">Revenue % to Tokenize: {formData.tokenizePercentage}%</Label>
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
                      <h4 className="font-semibold text-accent mb-3">Tokenization Preview</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Tokens Generated</div>
                          <div className="font-bold text-lg">{calculateTokens()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Token Value</div>
                          <div className="font-bold text-lg">RM 100 each</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total Raised</div>
                          <div className="font-bold text-lg">RM {(calculateTokens() * 100).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Your Share</div>
                          <div className="font-bold text-lg">{100 - formData.tokenizePercentage}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleTokenization}
                    disabled={!formData.businessName || !formData.revenueEstimate || loading}
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
                  <h3 className="text-xl font-bold text-foreground">Tokens Created Successfully!</h3>
                  <div className="p-4 glass rounded-lg border border-success/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">{calculateTokens()}</div>
                        <div className="text-muted-foreground">Tokens Issued</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">RM {(calculateTokens() * 100).toLocaleString()}</div>
                        <div className="text-muted-foreground">Total Value</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Your tokens are now available for community investment. 
                    Smart contracts will automatically distribute profits based on token ownership.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investor Portal */}
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
                {availableTokens.map((token) => (
                  <div key={token.id} className="p-4 glass rounded-lg border border-muted/20 hover-lift">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{token.business}</h4>
                        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                          {token.sector}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-success">+{token.roi}</div>
                        <div className="text-xs text-muted-foreground">Expected ROI</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div>
                        <div className="text-muted-foreground">Available</div>
                        <div className="font-semibold">{token.tokens} tokens</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Price</div>
                        <div className="font-semibold">RM {token.price}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Value</div>
                        <div className="font-semibold">RM {token.totalValue.toLocaleString()}</div>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Buy Tokens
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 glass rounded-lg border border-warning/20">
                <h4 className="font-semibold text-warning mb-2">Investment Benefits</h4>
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
                  description: "Retailer creates tokens representing future revenue share",
                  icon: Building2
                },
                {
                  step: "2", 
                  title: "Community Invests",
                  description: "Local investors purchase tokens to support businesses",
                  icon: Users
                },
                {
                  step: "3",
                  title: "Revenue Flows",
                  description: "Business generates revenue from daily operations",
                  icon: TrendingUp
                },
                {
                  step: "4",
                  title: "Profits Distributed",
                  description: "Smart contracts automatically share profits with token holders",
                  icon: Coins
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 glow-primary">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-lg font-bold text-gradient mb-2">{item.step}</div>
                  <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
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