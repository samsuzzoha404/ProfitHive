import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, TrendingUp, Shield, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/use-auth-guard';

const Hero = () => {
  const { requireAuth } = useAuthGuard();
  const navigate = useNavigate();

  const handleExplorePlatform = () => {
    requireAuth(() => navigate('/forecast'));
  };

  const handleStartDemo = () => {
    requireAuth(() => navigate('/dashboard'));
  };

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/cyberjaya-hero.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-primary/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent,hsl(var(--background)/0.9))]" />
      </div>

      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-primary rounded-full opacity-20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-secondary rounded-full opacity-20 blur-3xl animate-pulse-glow" />
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-gradient-to-r from-accent to-secondary rounded-full opacity-15 blur-2xl animate-pulse" />
      </div>

      {/* Enhanced Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-full glass border border-primary/30 glow-primary mb-6 md:mb-8 backdrop-blur-md">
            <Zap className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-primary animate-pulse" />
            <span className="text-xs md:text-sm font-medium text-primary tracking-wide">Smart Data, Shared Prosperity</span>
          </div>

          {/* Enhanced Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 leading-tight px-2">
            <span className="text-gradient bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Smart Retail
            </span>
            <br />
            <span className="text-foreground drop-shadow-lg">Revenue Sharing</span>
            <br />
            <span className="text-muted-foreground text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-light mt-2 md:mt-4 block">
              for <span className="text-accent font-semibold">Cyberjaya</span>
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Revolutionary platform combining <span className="text-accent font-semibold">AI demand forecasting</span>, 
            <span className="text-secondary font-semibold"> blockchain tokenization</span>, and 
            <span className="text-success font-semibold"> profit sharing</span> for the smart city era.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 md:mb-12 px-4">
            <Button 
              onClick={handleExplorePlatform}
              size="lg" 
              className="bg-gradient-primary hover-glow text-primary-foreground px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold w-full sm:w-auto"
            >
              Explore Platform <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button 
              onClick={handleStartDemo}
              variant="outline" 
              size="lg"
              className="glass border-primary/30 hover:bg-primary/10 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold w-full sm:w-auto"
            >
              Start Demo
            </Button>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-center p-4 md:p-6 glass rounded-xl hover-lift">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-3 md:mb-4 glow-primary">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">AI Forecasting</h3>
              <p className="text-sm text-muted-foreground text-center">
                Predict demand with advanced machine learning algorithms
              </p>
            </div>

            <div className="flex flex-col items-center p-4 md:p-6 glass rounded-xl hover-lift">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-3 md:mb-4 glow-accent">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Blockchain Security</h3>
              <p className="text-sm text-muted-foreground text-center">
                Secure tokenization and transparent profit distribution
              </p>
            </div>

            <div className="flex flex-col items-center p-4 md:p-6 glass rounded-xl hover-lift">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-success rounded-lg flex items-center justify-center mb-3 md:mb-4 glow-success">
                <Globe className="h-5 w-5 md:h-6 md:w-6 text-success-foreground" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Smart City Integration</h3>
              <p className="text-sm text-muted-foreground text-center">
                Connected ecosystem for Cyberjaya's digital transformation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse-glow"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;