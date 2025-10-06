// Simple debug version to test if blinking is fixed
import React from 'react';

const SimpleApp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">ProfitHive</h1>
        <p className="text-muted-foreground">Testing - No more blinking!</p>
      </div>
    </div>
  );
};

export default SimpleApp;