import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

cron.schedule('*/10 * * * *', async () => {
  console.log('[Audit] Running Reconnection...');

  const onChainTxs = [{ hash: '0x123...', value: '100' }];

  for (const tx of onChainTxs) {
    const internal = await prisma.transferRequest.findFirst({ where: { txHash: tx.hash } });

    if (!internal) {
      await prisma.securityAlert.create({ data: { severity: 'HIGH', message: `Unapproved Withdrawal: ${tx.hash}` } });
      await prisma.reconciliationRecord.create({
        data: {
          walletId: '...',
          txHash: tx.hash,
          onChainAmount: 100,
          status: 'UNLICENSED',
        },
      });
    }
  }
});

cron.schedule('0 * * * *', async () => {
  const count = await prisma.transferRequest.count({
    where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  });
  if (count > 50) console.warn('[Alert] Suspicious Activity');
});
