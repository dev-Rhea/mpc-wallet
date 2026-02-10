import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { NotificationService } from './notification';

const prisma = new PrismaClient();

export class ReconciliationService {
  async reconcileWallet(walletId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new Error('Wallet not found');

    console.log(`[Audit] Starting reconciliation for wallet: ${wallet.address}`);

    try {
      const onChainTxs = await this.fetchOnChainHistory(wallet.address);

      for (const tx of onChainTxs) {
        const internalRecord = await prisma.transferRequest.findFirst({
          where: { txHash: tx.hash },
        });

        let status = 'MATCHED';
        let alertMessage = '';

        if (!internalRecord) {
          status = 'UNLICENSED_WITHDRAWAL';
          alertMessage = `CRITICAL: Unapproved withdrawal detected! Hash: ${tx.hash}, Amount: ${tx.value}`;

          await this.createAlert('HIGH', alertMessage, tx);
        } else {
          const dbAmountWei = ethers.utils.parseEther(internalRecord.amount.toString());
          const onChainAmountWei = ethers.BigNumber.from(tx.valueRaw);

          if (!dbAmountWei.eq(onChainAmountWei)) {
            status = 'MISMATCH_AMOUNT';
            alertMessage = `WARNING: Amount mismatch. Approved: ${internalRecord.amount}, Actual: ${tx.value}`;

            await this.createAlert('MEDIUM', alertMessage, tx);
          }
        }

        await prisma.reconciliationRecord.upsert({
          where: { txHash: tx.hash },
          update: {
            status,
            checkedAt: new Date(),
          },
          create: {
            walletId,
            txHash: tx.hash,
            onChainAmount: parseFloat(tx.value),
            offChainAmount: internalRecord ? Number(internalRecord.amount) : null,
            status,
          },
        });
      }
    } catch (error) {
      console.error(`[Audit Error] Reconciliation failed for ${wallet.address}:`, error);
    }
  }

  async detectAnomalies() {
    console.log('[Audit] Running Anomaly Detection Rules...');

    const startOfNight = new Date();
    startOfNight.setHours(0, 0, 0, 0);
    const endOfNight = new Date();
    endOfNight.setHours(5, 0, 0, 0);

    const lateNightRequests = await prisma.transferRequest.findMany({
      where: {
        createdAt: { gte: startOfNight, lte: endOfNight },
        status: { not: 'REJECTED' },
      },
    });

    if (lateNightRequests.length > 0) {
      await this.createAlert(
        'MEDIUM',
        `Suspicious Activity: ${lateNightRequests.length} requests detected during late night hours.`
      );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTxCount = await prisma.transferRequest.count({
      where: { createdAt: { gte: oneHourAgo } },
    });

    if (recentTxCount > 50) {
      await this.createAlert('HIGH', `High Frequency Alert: ${recentTxCount} transactions in the last hour.`);
    }
  }

  private async createAlert(severity: string, message: string, metaData?: any) {
    const alert = await prisma.securityAlert.create({
      data: {
        severity,
        message,
        rawData: metaData ? JSON.stringify(metaData) : undefined,
      },
    });

    NotificationService.broadcast('SECURITY_ALERT', {
      id: alert.id,
      severity,
      message,
      timestamp: alert.createdAt,
    });

    console.warn(`[SECURITY ALERT] [${severity}] ${message}`);
  }

  private async fetchOnChainHistory(address: string) {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    const network = process.env.CHAIN_ID === '1' || !process.env.CHAIN_ID ? 'homestead' : 'sepolia';

    if (!apiKey) {
      console.warn('[Audit Warning] ETHERSCAN_API_KEY is missing. Rate limits will be applied.');
    }

    const provider = new ethers.providers.EtherscanProvider(network, apiKey);

    try {
      const history = await provider.getHistory(address);
      return history.map((tx) => ({
        hash: tx.hash,
        value: ethers.utils.formatEther(tx.value),
        valueRaw: tx.value,
        timestamp: tx.timestamp || Math.floor(Date.now() / 1000),
        from: tx.from,
        to: tx.to,
      }));
    } catch (error) {
      console.error('[Audit Error] Failed to fetch data from Etherscan API:', error);
      throw error;
    }
  }
}
