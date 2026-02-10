import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class AuditLogService {
  async createLog(action: string, actorId: string, requestId?: string) {
    const lastLog = await prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' } });
    const prevHash = lastLog ? lastLog.currentHash : 'GENESIS_HASH';
    const timestamp = new Date().toISOString();
    const payload = `${prevHash}|${action}|${actorId}|${requestId}|${timestamp}`;
    const currentHash = crypto.createHash('sha256').update(payload).digest('hex');

    await prisma.auditLog.create({
      data: { action, actorId, requestId, prevHash, currentHash, timestamp: new Date(timestamp) },
    });
  }
}
