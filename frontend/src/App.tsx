import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/lib/web3-provider";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Forecast from "./pages/Forecast";
import Tokenization from "./pages/Tokenization";
import Wallet from "./pages/Wallet"; // Main wallet page with complete Web3 integration
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/tokenization" element={<Tokenization />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
