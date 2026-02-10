import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PolicyService {
  async checkWhitelist(toAddress: string): Promise<boolean> {
    const entry = await prisma.addressWhitelist.findUnique({ where: { address: toAddress } });
    return !!entry;
  }

  async checkDailyLimit(walletId: string, amount: number): Promise<boolean> {
    const policy = await prisma.walletPolicy.findUnique({
      where: { walletId },
    });

    if (!policy) return true;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayUsage = await prisma.transferRequest.aggregate({
      where: {
        walletId,
        createdAt: { gte: startOfDay },
        status: { not: 'REJECTED' },
      },
      _sum: {
        amount: true,
      },
    });

    const currentTotal = Number(todayUsage._sum.amount || 0);

    return currentTotal + amount <= Number(policy.dailyLimit);
  }

  async validateRecipient(toAddress: string, amount?: any): Promise<boolean> {
    const entry = await prisma.addressWhitelist.findUnique({ where: { address: toAddress } });
    return !!entry;
  }

  async getRequiredRoles(amount: number, context?: any): Promise<string[]> {
    if (amount >= 100) return ['ADMIN'];
    return ['USER'];
  }
}
