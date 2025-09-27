import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useSendTransaction,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { sepolia } from "wagmi/chains";
import { CONTRACT_ADDRESSES, getContractAddresses } from "@/lib/contracts";

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
