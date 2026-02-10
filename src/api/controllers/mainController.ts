import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PolicyService } from '../../services/policyService';
// import { NotificationService } from '../../services/notification';

const prisma = new PrismaClient();
const policyService = new PolicyService();

export class MainController {
  async createRequest(req: Request, res: Response) {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'anonymous';
      const { walletId, toAddress, amount } = req.body;

      const isAllowed = await policyService.validateRecipient(toAddress, amount);
      if (!isAllowed) {
        return res.status(403).json({ error: 'Recipient not valid' });
      }

      const request = await prisma.transferRequest.create({
        data: {
          walletId,
          recipientAddress: toAddress,
          amount,
          requesterId: userId,
          status: 'PENDING',
        },
      });

      return res.status(201).json(request);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async approveRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.body;
      const userRole = (req.headers['x-user-role'] as string) || 'USER';

      const request = await prisma.transferRequest.findUnique({ where: { id: requestId } });
      if (!request) return res.status(404).json({ error: 'Not found' });

      const requiredRoles = await policyService.getRequiredRoles(Number(request.amount), request.walletId);
      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const updated = await prisma.transferRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });

      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Error' });
    }
  }
}
