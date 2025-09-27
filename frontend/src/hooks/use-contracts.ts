import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useSendTransaction,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { sepolia } from "wagmi/chains";
import { CONTRACT_ADDRESSES, getContractAddresses } from "../lib/contracts";

// Complete ProfitHive Token ABI with business tokenization functions
export const PROFITHIVE_TOKEN_ABI = [
  // ERC20 Standard Functions
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
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  // Minting Functions
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Events
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
  },
] as const;

export const useTokenBalance = (address?: string) => {
  const { chainId } = useAccount();
  const contractAddress = getContractAddresses(
    chainId || 11155111
  )?.ProfitHiveToken;

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PROFITHIVE_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });
};

export const useTokenTransfer = () => {
  const { chainId, address: account } = useAccount();
  const contractAddress = getContractAddresses(
    chainId || 11155111
  )?.ProfitHiveToken;

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const transferTokens = async (to: string, amount: string) => {
    if (!contractAddress) throw new Error("Contract address not found");
    if (!account) throw new Error("Wallet not connected");

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: PROFITHIVE_TOKEN_ABI,
      functionName: "transfer",
      args: [to as `0x${string}`, parseEther(amount)],
      chain: sepolia,
      account: account as `0x${string}`,
    });
  };

  return {
    transferTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useTokenMint = () => {
  const { chainId, address: account } = useAccount();
  const contractAddress = getContractAddresses(
    chainId || 11155111
  )?.ProfitHiveToken;

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const mintTokens = async (to: string, amount: string) => {
    if (!contractAddress) throw new Error("Contract address not found");

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: PROFITHIVE_TOKEN_ABI,
      functionName: "mint",
      args: [to as `0x${string}`, parseEther(amount)],
      chain: sepolia,
      account: account as `0x${string}`,
    });
  };

  return {
    mintTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useApproveTokens = () => {
  const { chainId, address: account } = useAccount();
  const contractAddress = getContractAddresses(
    chainId || 11155111
  )?.ProfitHiveToken;

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const approveTokens = async (spender: string, amount: string) => {
    if (!contractAddress) throw new Error("Contract address not found");

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: PROFITHIVE_TOKEN_ABI,
      functionName: "approve",
      args: [spender as `0x${string}`, parseEther(amount)],
      chain: sepolia,
      account: account as `0x${string}`,
    });
  };

  return {
    approveTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Hook for real ETH transfers (paying for tokens)
export const useETHTransfer = () => {
  const { sendTransaction, data: hash, isPending } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const sendETH = async (to: string, amount: string) => {
    sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });
  };

  return {
    sendETH,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Revenue Sharing ABI for staking functions
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
  {
    type: "event",
    name: "Staked",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "Unstaked",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
] as const;

// Hook for getting user stake information
export const useUserStakeInfo = () => {
  const { address, chainId } = useAccount();
  const contractAddress = getContractAddresses(
    chainId || 11155111
  )?.RevenueSharing;

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: REVENUE_SHARING_ABI,
    functionName: "getUserStakeInfo",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    },
  });
};

// Hook for staking tokens
export const useStakeTokens = () => {
  const { chainId, address: account } = useAccount();
  const contractAddress = getContractAddresses(
    chainId || 11155111
  )?.RevenueSharing;

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const stakeTokens = async (amount: string) => {
    if (!contractAddress) throw new Error("Contract address not found");
    if (!account) throw new Error("Wallet not connected");

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: REVENUE_SHARING_ABI,
      functionName: "stake",
      args: [parseEther(amount)],
      chain: sepolia,
      account: account as `0x${string}`,
    });
  };

  return {
    stakeTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Hook for unstaking tokens
export const useUnstakeTokens = () => {
  const { chainId, address: account } = useAccount();
  const contractAddress = getContractAddresses(
    chainId || 11155111
  )?.RevenueSharing;

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const unstakeTokens = async (amount: string) => {
    if (!contractAddress) throw new Error("Contract address not found");
    if (!account) throw new Error("Wallet not connected");

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: REVENUE_SHARING_ABI,
      functionName: "unstake",
      args: [parseEther(amount)],
      chain: sepolia,
      account: account as `0x${string}`,
    });
  };

  return {
    unstakeTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Hook for claiming staking rewards
export const useClaimRewards = () => {
  const { chainId, address: account } = useAccount();
  const contractAddress = getContractAddresses(
    chainId || 11155111
  )?.RevenueSharing;

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const claimRewards = async () => {
    if (!contractAddress) throw new Error("Contract address not found");
    if (!account) throw new Error("Wallet not connected");

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: REVENUE_SHARING_ABI,
      functionName: "claimStakingRewards",
      args: [],
      chain: sepolia,
      account: account as `0x${string}`,
    });
  };

  return {
    claimRewards,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Re-export utilities
export { getContractAddresses };
