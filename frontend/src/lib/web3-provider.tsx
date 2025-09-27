import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { http } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const wagmiConfig = getDefaultConfig({
  appName: "ProfitHive",
  projectId: "profit-hive-demo", // Replace with your WalletConnect projectId if needed
  chains: [sepolia, localhost, mainnet],
  transports: {
    [sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/POjTZ_XZ48_vXQ1STVCPf`
    ),
    [localhost.id]: http("http://127.0.0.1:8545"),
    [mainnet.id]: http(
      `https://eth-mainnet.g.alchemy.com/v2/POjTZ_XZ48_vXQ1STVCPf`
    ),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
