import React from "react";
import { Navigate } from "react-router-dom";
import { AuthForm } from "../components/auth/AuthForm";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to ProfitHive
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access your portal and start tokenizing or investing
          </p>
        </div>

        <AuthForm
          onSuccess={() => {
            // Redirect will happen automatically via Navigate component above
          }}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Choose your portal mode after signing in:
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <span className="text-xs bg-muted px-2 py-1 rounded">
              🏪 Retailer Portal
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded">
              👤 Investor Portal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
