import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { AuditLogService } from './auditService';
const prisma = new PrismaClient();
const audit = new AuditLogService();
let sseClients: { [userId: string]: Response } = {};

export class ApprovalService {
  addSSEClient(userId: string, res: Response) {
    sseClients[userId] = res;
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  }

  private sendNotification(targetUserId: string, message: string) {
    const client = sseClients[targetUserId];
    if (client) {
      client.write(`data: ${JSON.stringify({ message })}\n\n`);
    }
  }

  async approveRequest(requestId: string, approverId: string) {
    return await prisma.$transaction(async (tx) => {
      const req = await tx.transferRequest.findUnique({
        where: { id: requestId },
        include: { wallet: true, approvals: true },
      });
      if (!req) throw new Error('Not found');

      if (req.requesterId == approverId) throw new Error('SoD violation: Self-approval forbidden');

      await tx.approval.create({ data: { requestId, approverId, status: 'APPROVED' } });
      await audit.createLog('APPROVE_TX', approverId, requestId);

      const currentApprovals = req.approvals.length + 1;
      const threshold = req.wallet.thresholdCount;
      if (currentApprovals >= threshold) {
        await tx.transferRequest.update({ where: { id: requestId }, data: { status: 'APPROVED_PENDING_EXECUTION' } });
      }
      return { status: 'APPROVED', currentApprovals };
    });
  }

  async notifyApprovers(userIds: string[], msg: string) {
    userIds.forEach((id) => this.sendNotification(id, msg));
  }
}
