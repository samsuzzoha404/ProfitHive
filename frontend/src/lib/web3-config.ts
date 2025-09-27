import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, localhost } from "wagmi/chains";

// Define the local development chain
const localhostChain = {
  ...localhost,
  id: 31337, // Hardhat default chain ID
  name: "Localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
};

// RainbowKit configuration
export const config = getDefaultConfig({
  appName: "ProfitHive",
  projectId: "profithive-cyberjaya", // Replace with your WalletConnect project ID
  chains: [localhostChain, sepolia, mainnet],
  ssr: false, // Since we're using Vite (not Next.js)
});

// Contract addresses (will be loaded from deployed contracts)
export const CONTRACT_ADDRESSES = {
  PROFIT_HIVE_TOKEN: "",
  REVENUE_SHARING: "",
  FORECAST_DATA: "",
};

// Load contract addresses from deployment config
export const loadContractAddresses = async () => {
  try {
    // In a real app, this would fetch from your backend or a config file
    const response = await fetch("/api/blockchain/health");
    const data = await response.json();

    if (data.contracts) {
      CONTRACT_ADDRESSES.PROFIT_HIVE_TOKEN = data.contracts.profitHiveToken;
      CONTRACT_ADDRESSES.REVENUE_SHARING = data.contracts.revenueSharing;
      CONTRACT_ADDRESSES.FORECAST_DATA = data.contracts.forecastData;
    }
  } catch (error) {
    console.warn(
      "Could not load contract addresses:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

// Contract ABIs (simplified versions for frontend use)
export const PROFIT_HIVE_TOKEN_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    name: "distributeReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const REVENUE_SHARING_ABI = [
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserStakeInfo",
    outputs: [
      { name: "stakedAmount", type: "uint256" },
      { name: "stakingTimestamp", type: "uint256" },
      { name: "claimableAmount", type: "uint256" },
      { name: "canUnstake", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimStakingRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const FORECAST_DATA_ABI = [
  {
    inputs: [{ name: "forecastId", type: "uint256" }],
    name: "forecasts",
    outputs: [
      { name: "forecaster", type: "address" },
      { name: "storeId", type: "string" },
      { name: "city", type: "string" },
      { name: "timestamp", type: "uint256" },
      { name: "predictionPeriodStart", type: "uint256" },
      { name: "predictionPeriodEnd", type: "uint256" },
      { name: "dataHash", type: "string" },
      { name: "accuracy", type: "uint256" },
      { name: "isVerified", type: "bool" },
      { name: "accuracyCalculated", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
