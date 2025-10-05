import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

// Get WalletConnect project ID from environment (optional)
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo'

export const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}