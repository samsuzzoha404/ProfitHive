import React from 'react';
import Hero from '@/components/Hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  TrendingUp, 
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Coins,
  Globe,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Hero />
      
      {/* Why This Matters Section */}
      <section className="py-12 md:py-16 lg:py-24 relative bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full glass border border-accent/20 glow-accent mb-4 md:mb-6">
              <Globe className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 text-accent" />
              <span className="text-xs md:text-sm font-medium text-accent">Cyberjaya Smart City Initiative</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2">
              Why <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Smart Retail</span> Matters
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4">
              Empowering every stakeholder in Cyberjaya's retail ecosystem through data-driven insights and blockchain innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16 lg:mb-20">
            {/* Retailers */}
            <Card className="glass hover-lift border-primary/20 group transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 md:p-8 text-center h-full flex flex-col">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 glow-primary group-hover:scale-110 transition-transform duration-300">
                  <Building className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">For Retailers</h3>
                <ul className="text-muted-foreground space-y-3 md:space-y-4 text-left flex-1">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span className="text-sm md:text-base">AI-powered demand forecasting reduces waste by 30%</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span className="text-sm md:text-base">Access investment capital through tokenization</span>
                  </li>
                  <li className="flex items-start">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">Real-time analytics for better decision making</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Citizens */}
            <Card className="glass hover-lift border-accent/20 group transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 md:p-8 text-center h-full flex flex-col">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 glow-accent group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 md:h-10 md:w-10 text-accent-foreground" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">For Citizens</h3>
                <ul className="text-muted-foreground space-y-3 md:space-y-4 text-left flex-1">
                  <li className="flex items-start">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">Better retail availability in your neighborhood</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 md:h-5 md:w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">Transparent, secure investment opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <Globe className="h-4 w-4 md:h-5 md:w-5 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">Participate in smart city development</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Investors */}
            <Card className="glass hover-lift border-success/20 group transition-all duration-300 hover:scale-105 md:col-span-2 lg:col-span-1">
              <CardContent className="p-6 md:p-8 text-center h-full flex flex-col">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-success rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 glow-success group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-success-foreground" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">For Investors</h3>
                <ul className="text-muted-foreground space-y-3 md:space-y-4 text-left flex-1">
                  <li className="flex items-start">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">Data-driven investment decisions</span>
                  </li>
                  <li className="flex items-start">
                    <Coins className="h-4 w-4 md:h-5 md:w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">Fractional ownership through tokenization</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 md:h-5 md:w-5 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">Automated profit distribution</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 lg:py-20 relative bg-muted/20">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 px-2">
              How It <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              A seamless flow from retail data to blockchain-powered revenue sharing
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Step-by-step flow */}
            <div className="space-y-6 md:space-y-8">
              {[
                {
                  step: "01",
                  title: "Retailers Upload Data",
                  description: "Historical sales, inventory, and customer data feeds our AI algorithms",
                  icon: BarChart3,
                  color: "primary"
                },
                {
                  step: "02", 
                  title: "AI Generates Forecast",
                  description: "Machine learning predicts demand, optimal inventory, and revenue projections",
                  icon: Zap,
                  color: "secondary"
                },
                {
                  step: "03",
                  title: "Tokenize Revenue Share",
                  description: "Blockchain creates secure tokens representing future profit shares",
                  icon: Shield,
                  color: "accent"
                },
                {
                  step: "04",
                  title: "Investors Purchase Tokens", 
                  description: "Community members buy tokens to support local businesses and earn returns",
                  icon: Coins,
                  color: "success"
                }
              ].map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 lg:gap-8 p-4 md:p-6 glass rounded-xl hover-lift">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center glow-${item.color} flex-shrink-0 ${
                    item.color === 'primary' ? 'bg-gradient-primary' :
                    item.color === 'secondary' ? 'bg-secondary' :
                    item.color === 'accent' ? 'bg-accent' : 'bg-success'
                  }`}>
                    <item.icon className={`h-6 w-6 md:h-8 md:w-8 ${
                      item.color === 'primary' ? 'text-primary-foreground' :
                      item.color === 'secondary' ? 'text-secondary-foreground' :
                      item.color === 'accent' ? 'text-accent-foreground' : 'text-success-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <span className="text-xl md:text-2xl font-bold text-gradient">{item.step}</span>
                      <h3 className="text-lg md:text-xl font-bold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">{item.description}</p>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground hidden lg:block flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4 text-center max-w-screen-xl">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 px-2">
              Ready to Transform <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Cyberjaya's Retail?</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 px-4">
              Join the revolution in smart city retail innovation. Start with AI forecasting or explore investment opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button asChild size="lg" className="bg-gradient-primary hover-glow text-primary-foreground px-6 md:px-8 w-full sm:w-auto">
                <Link to="/forecast">
                  Start Forecasting <BarChart3 className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="glass border-primary/30 hover:bg-primary/10 px-6 md:px-8 w-full sm:w-auto">
                <Link to="/tokenization">
                  Explore Tokenization <Coins className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;