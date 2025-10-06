import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { config } from './wagmi';
import { AuthProvider } from './context/AuthContext';
import Navigation from "./components/Navigation";
import './lib/firebase-debug'; // Import debug utilities
// Re-enabled with conservative approach - only basic suppression
import './lib/network-error-suppression'; // Import network error suppression
import './lib/google-sdk-preloader'; // Preload Google SDK for faster sign-in
// import './lib/ultimate-console-suppression'; // Keep disabled for now
// import './lib/devtools-suppression'; // Keep disabled for now
import Home from "./pages/Home";
import Forecast from "./pages/Forecast";
import Tokenization from "./pages/Tokenization";
import Wallet from "./pages/Wallet";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginModal from "./components/auth/LoginModal";
import NetworkStatus from "./components/NetworkStatus";
import { useAuth } from "./hooks/use-auth";

// Create QueryClient with optimized defaults for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce network requests and prevent hanging
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: 1, // Reduce retries to prevent hanging
      refetchOnWindowFocus: false, // Prevent constant refetching
    },
  },
});

// Loading component for Suspense
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// App Content Component (after auth provider initialization)
const AppContent = () => {
  const { showLoginModal, setShowLoginModal } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5">
      <Navigation />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/forecast" 
          element={
            <ProtectedRoute>
              <Forecast />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tokenization" 
          element={
            <ProtectedRoute>
              <Tokenization />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wallet" 
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          } 
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      
      {/* Global Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      {/* Network Status Monitor */}
      <NetworkStatus />
    </div>
  );
};

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
