import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { Web3Provider } from "./lib/web3-provider";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Web3Provider>
      <App />
    </Web3Provider>
  </AuthProvider>
);
