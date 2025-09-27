// Contract addresses by network
export const CONTRACT_ADDRESSES_BY_NETWORK = {
  // Localhost (Hardhat)
  31337: {
    ProfitHiveToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    RevenueSharing: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    ForecastData: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  // Sepolia Testnet
  11155111: {
    ProfitHiveToken: "0x57DfeFA65a3e26101d9536a271Ea4D364DD7cB04",
    RevenueSharing: "0x619F135a64ba12804eE222aE7AE44b3412d15CA6",
    ForecastData: "0x5b0ee4996C811187676192402B861bF455c46816",
  },
};

// Default to Sepolia addresses
export let CONTRACT_ADDRESSES = CONTRACT_ADDRESSES_BY_NETWORK[11155111];

// Function to update contract addresses
export const updateContractAddresses = (
  addresses: Partial<typeof CONTRACT_ADDRESSES>
) => {
  CONTRACT_ADDRESSES = { ...CONTRACT_ADDRESSES, ...addresses };
};

// Function to get contract addresses for a specific network
export const getContractAddresses = (chainId: number) => {
  return (
    CONTRACT_ADDRESSES_BY_NETWORK[
      chainId as keyof typeof CONTRACT_ADDRESSES_BY_NETWORK
    ] || CONTRACT_ADDRESSES_BY_NETWORK[11155111]
  ); // Default to Sepolia
};

// Function to switch to the correct network contracts
export const switchToNetwork = (chainId: number) => {
  CONTRACT_ADDRESSES = getContractAddresses(chainId);
  return CONTRACT_ADDRESSES;
};

// Simplified ABIs for frontend use
export const PROFITHIVE_TOKEN_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

export const REVENUE_SHARING_ABI = [
  {
    type: "function",
    name: "stake",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unstake",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimStakingRewards",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getUserStakeInfo",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "stakedAmount", type: "uint256" },
      { name: "stakingTimestamp", type: "uint256" },
      { name: "claimableAmount", type: "uint256" },
      { name: "canUnstake", type: "bool" },
    ],
    stateMutability: "view",
  },
] as const;

export const FORECAST_DATA_ABI = [
  {
    type: "function",
    name: "forecasts",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "forecaster", type: "address" },
      { name: "storeId", type: "string" },
      { name: "city", type: "string" },
      { name: "timestamp", type: "uint256" },
      { name: "accuracy", type: "uint256" },
      { name: "isVerified", type: "bool" },
    ],
    stateMutability: "view",
  },
] as const;
