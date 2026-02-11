import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { kmsClient } from '../../config/kmsConfig';
import { CreateKeyCommand, GetPublicKeyCommand } from '@aws-sdk/client-kms';
import { ethers } from 'ethers';
import axios from 'axios';
import { getEthereumAddressFromKMS } from '../../utils/kmsUtils';

const prisma = new PrismaClient();

export class WalletController {
  async createWallet(req: Request, res: Response) {
    try {
      const { orgId, type } = req.body;
      console.log('Creating key in AWS KMS...');

      const createCommand = new CreateKeyCommand({
        Description: `MPC Wallet for Org ${orgId}`,
        KeyUsage: 'SIGN_VERIFY',
        CustomerMasterKeySpec: 'ECC_SECG_P256K1',
        Origin: 'AWS_KMS',
      });

      const createRes = await kmsClient.send(createCommand);
      const kmsKeyId = createRes.KeyMetadata?.KeyId;

      if (!kmsKeyId) throw new Error('Failed to create KMS Key');
      console.log(`AWS KMS Key Created: ${kmsKeyId}`);

      const getPubKeyCommand = new GetPublicKeyCommand({
        KeyId: kmsKeyId,
      });
      const pubKeyRes = await kmsClient.send(getPubKeyCommand);

      if (!pubKeyRes.PublicKey) throw new Error('Failed to retrieve public key');

      const realAddress = getEthereumAddressFromKMS(pubKeyRes.PublicKey as Uint8Array);
      console.log(`Derived Ethereum Address: ${realAddress}`);

      const newWallet = await prisma.wallet.create({
        data: {
          orgId,
          address: realAddress,
          kmsKeyId,
          type: type || 'MPC',
          thresholdCount: 2,
        },
      });

      return res.status(200).json({
        message: 'Wallet Created Successfully',
        wallet: newWallet,
        awsKmsCheck: 'Success',
      });
    } catch (error: any) {
      console.error('Wallet Creation Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async getWallets(req: Request, res: Response) {
    try {
      const { orgId } = req.params as { orgId: string };

      const wallets = await prisma.wallet.findMany({
        where: { orgId },
        include: {
          policy: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(wallets);
    } catch (error: any) {
      console.log('Wallet List Error:', error);
      return res.status(500).json({ error: 'Failed to fetch wallets' });
    }
  }
}
