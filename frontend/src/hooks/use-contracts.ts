import { useState } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export function useETHTransfer() {
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const {
    sendTransaction,
    data: hash,
    isPending,
    error,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const sendETH = async (to: string, value: string) => {
    try {
      setRecipient(to);
      setAmount(value);
      
      sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(value),
      });
    } catch (err) {
      console.error('Error sending ETH:', err);
    }
  };

  return {
    sendETH,
    hash,
    isPending: isPending || isConfirming,
    isConfirmed,
    error,
    recipient,
    amount,
  };
}

// Additional hook for contract interactions can be added here
export function useContractInteraction() {
  // Placeholder for smart contract interactions
  return {
    // Add contract interaction methods here
  };
}