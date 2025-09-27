import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { onAuthStateChange } from "../lib/firebase";

export type PortalMode = "investor" | "retailer";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalMode, setPortalModeState] = useState<PortalMode>(() => {
    // Get portal mode from localStorage or default to investor
    const saved = localStorage.getItem("profithive_portal_mode");
    return (saved as PortalMode) || "investor";
  });

  const setPortalMode = (mode: PortalMode) => {
    console.log("AuthContext: Setting portal mode to:", mode);
    setPortalModeState(mode);
    localStorage.setItem("profithive_portal_mode", mode);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    portalMode,
    setPortalMode,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
