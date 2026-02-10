import { PrismaClient } from '@prisma/client';
import { kmsClient, KMS_KEY_ID } from '../config/kmsConfig';
import { ethers } from 'ethers';
import { provider } from '../core/blockchain';

const prisma = new PrismaClient();

export class SignerWorker {
  async processTransfer(requestId: string) {
    const request = await prisma.transferRequest.findUnique({
      where: { id: requestId },
      include: { wallet: true },
    });

    if (!request || !request.wallet || !request.wallet.privateKey) {
      console.log(`[Signer] Skipped request ${requestId}: Invalid wallet or missing key`);
      return;
    }

    try {
      console.log(`[Signer] Processing request ${requestId}...`);

      const wallet = new ethers.Wallet(request.wallet.privateKey, provider);

      const tx = await wallet.sendTransaction({
        to: request.recipientAddress,
        value: ethers.utils.parseEther(request.amount.toString()),
      });

      console.log(`Transaction sent: ${tx.hash}`);

      await prisma.transferRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          txHash: tx.hash,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Signer Error:', error);
      await prisma.transferRequest.update({
        where: { id: requestId },
        data: { status: 'FAILED' },
      });
    }
  }
}
