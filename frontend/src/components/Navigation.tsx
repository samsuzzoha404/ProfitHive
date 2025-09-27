import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Building2,
  Wallet,
  Monitor,
  Info,
  Menu,
  X,
  Zap,
  User,
  LogOut,
  Settings,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../lib/firebase";

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, portalMode, setPortalMode, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const togglePortalMode = () => {
    const newMode = portalMode === "investor" ? "retailer" : "investor";
    console.log("Switching portal from", portalMode, "to", newMode);
    setPortalMode(newMode);
  };

  // Always visible items
  const homeItem = { path: "/", label: "Home", icon: Building2 };
  const aboutItem = { path: "/about", label: "About", icon: Info };

  // Protected navigation items (only visible when authenticated)
  const protectedNavItems = [
    { path: "/forecast", label: "AI Forecast", icon: BarChart3 },
    { path: "/tokenization", label: "Tokenization", icon: Zap },
    { path: "/wallet", label: "Wallet", icon: Wallet },
    { path: "/dashboard", label: "Dashboard", icon: Monitor },
  ];

  // Combine nav items based on authentication status - About always goes at the end
  const navItems = isAuthenticated
    ? [homeItem, ...protectedNavItems, aboutItem]
    : [homeItem, aboutItem];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover-glow rounded-lg px-3 py-2"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gradient">Cyberjaya</span>
              <div className="text-xs text-muted-foreground">Smart Retail</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-glow px-4 py-2 rounded-lg flex items-center space-x-2 transition-smooth ${
                    isActive(item.path)
                      ? "bg-primary/20 text-primary glow-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile & Portal Switch */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {/* Portal Mode Indicator */}
                <div
                  className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                    portalMode === "investor"
                      ? "bg-blue-50/20 border border-blue-200/20"
                      : "bg-green-50/20 border border-green-200/20"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      portalMode === "investor"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {portalMode === "investor"
                      ? "👤 Investor Portal"
                      : "🏪 Retailer Portal"}
                  </span>
                </div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.photoURL || ""}
                          alt={user?.displayName || "User"}
                        />
                        <AvatarFallback>
                          {user?.displayName?.charAt(0) ||
                            user?.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.displayName || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Portal Switch */}
                    <DropdownMenuItem
                      onClick={togglePortalMode}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          {portalMode === "investor" ? (
                            <ToggleLeft className="mr-2 h-4 w-4 text-blue-600" />
                          ) : (
                            <ToggleRight className="mr-2 h-4 w-4 text-green-600" />
                          )}
                          <span className="font-medium">
                            Switch to{" "}
                            {portalMode === "investor"
                              ? "Retailer"
                              : "Investor"}
                          </span>
                        </div>
                        <span className="text-sm">
                          {portalMode === "investor" ? "🏪" : "👤"}
                        </span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground hover:bg-muted/20"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/20 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth ${
                    isActive(item.path)
                      ? "bg-primary/20 text-primary glow-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
