import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Users, 
  Trophy, 
  Rocket,
  Building2,
  Globe,
  Zap,
  Code,
  Brain,
  Shield
} from 'lucide-react';

const About = () => {
  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-primary/20 glow-primary mb-6">
            <Trophy className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium text-primary">InnoJam GenAI Sprint 2025</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-gradient">Our Vision</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transforming Cyberjaya into Malaysia's first AI-powered smart retail ecosystem, 
            connecting retailers, citizens, and investors through innovative blockchain technology.
          </p>
        </div>

        {/* Cyberjaya Section */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-gradient">Cyberjaya:</span> Malaysia's Smart City Pioneer
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Cyberjaya stands as Malaysia's flagship smart city, a 38,000-acre planned township 
                  designed to be the heart of the nation's digital transformation. Located in Sepang, 
                  Selangor, it serves as the country's Silicon Valley.
                </p>
                <p>
                  Home to over 300 multinational companies, 40,000 knowledge workers, and cutting-edge 
                  research institutions, Cyberjaya is the perfect testing ground for innovative retail 
                  technologies that will shape Malaysia's digital economy.
                </p>
                <p>
                  Our platform leverages Cyberjaya's advanced digital infrastructure and tech-savvy 
                  community to create a revolutionary retail ecosystem that can be replicated across 
                  Malaysia's other smart cities.
                </p>
              </div>
            </div>
            
            <Card className="glass border-primary/20 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Cyberjaya by the Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">300+</div>
                    <div className="text-sm text-muted-foreground">Tech Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">40,000+</div>
                    <div className="text-sm text-muted-foreground">Knowledge Workers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">38,000</div>
                    <div className="text-sm text-muted-foreground">Acres</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">100%</div>
                    <div className="text-sm text-muted-foreground">Digital Coverage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-16 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">
              Expanding <span className="text-gradient">City by City</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              After proving our concept in Cyberjaya, we plan to expand across Malaysia's smart cities, 
              creating a nationwide network of intelligent retail ecosystems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                phase: "Phase 1",
                city: "Cyberjaya",
                status: "Current",
                icon: Rocket,
                description: "Pilot program with 50+ retailers, AI forecasting, and blockchain tokenization",
                color: "primary"
              },
              {
                phase: "Phase 2",
                city: "Putrajaya & Klang Valley",
                status: "2025 Q3",
                icon: Building2,
                description: "Expansion to government and commercial districts with enhanced features",
                color: "accent"
              },
              {
                phase: "Phase 3",
                city: "Nationwide Network",
                status: "2026",
                icon: Globe,
                description: "Connect all major Malaysian cities in a unified smart retail platform",
                color: "success"
              }
            ].map((item, index) => (
              <Card key={index} className={`glass border-${item.color}/20 hover-lift`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto glow-${item.color} ${
                    item.color === 'primary' ? 'bg-gradient-primary' :
                    item.color === 'accent' ? 'bg-accent' : 'bg-success'
                  }`}>
                    <item.icon className={`h-6 w-6 ${
                      item.color === 'primary' ? 'text-primary-foreground' :
                      item.color === 'accent' ? 'text-accent-foreground' : 'text-success-foreground'
                    }`} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">{item.phase}</div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.city}</h3>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-4 ${
                      item.color === 'primary' ? 'bg-primary/20 text-primary' :
                      item.color === 'accent' ? 'bg-accent/20 text-accent' : 'bg-success/20 text-success'
                    }`}>
                      {item.status}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">
              Meet <span className="text-gradient">HashForce</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A passionate team of developers, designers, and blockchain enthusiasts building the future of retail.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                role: "Full-Stack Developer",
                expertise: "React, Node.js, Smart Contracts",
                icon: Code,
                focus: "Platform Architecture"
              },
              {
                role: "AI/ML Engineer", 
                expertise: "Machine Learning, Data Science",
                icon: Brain,
                focus: "Demand Forecasting"
              },
              {
                role: "Blockchain Developer",
                expertise: "Ethereum, DeFi, Tokenization",
                icon: Shield,
                focus: "Revenue Sharing"
              }
            ].map((member, index) => (
              <Card key={index} className="glass border-primary/20 hover-lift">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 glow-primary">
                    <member.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{member.role}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{member.expertise}</p>
                  <div className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                    {member.focus}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Hackathon Context */}
        <section className="text-center">
          <Card className="glass border-warning/20 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-8 w-8 text-warning-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                InnoJam GenAI Sprint 2025 - First Prototype
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                This platform represents our vision for Malaysia's smart retail future, developed during 
                the InnoJam GenAI Sprint 2025. It's a working prototype demonstrating the potential of 
                combining AI, blockchain, and smart city infrastructure.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 glass rounded-lg">
                  <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium">48 Hours</div>
                  <div className="text-xs text-muted-foreground">Development Time</div>
                </div>
                <div className="p-4 glass rounded-lg">
                  <Code className="h-6 w-6 text-accent mx-auto mb-2" />
                  <div className="text-sm font-medium">Full Stack</div>
                  <div className="text-xs text-muted-foreground">Implementation</div>
                </div>
                <div className="p-4 glass rounded-lg">
                  <Rocket className="h-6 w-6 text-success mx-auto mb-2" />
                  <div className="text-sm font-medium">MVP Ready</div>
                  <div className="text-xs text-muted-foreground">For Scaling</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default About;