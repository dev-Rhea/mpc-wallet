import { ethers } from 'ethers';

const RPC_URL = process.env.PRC_URL || 'http://localhost:8545';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '1337');

export const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);

export const waitForTx = async (hash: string, confirmations: number = 1) => {
  return await provider.waitForTransaction(hash, confirmations);
};

export const BlockchainUtils = {
  isValidAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  },

  async getGasPrice() {
    const feeData = await provider.getFeeData();
    return {
      maxFeeGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    };
  },

  async waitForTransaction(txHash: string, confirmations = 1) {
    return await provider.waitForTransaction(txHash, confirmations);
  },
};
