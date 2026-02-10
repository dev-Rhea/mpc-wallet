import { Response } from 'express';

const clients = new Map<string, Response>();

export const NotificationService = {
  addClient(id: string, res: Response) {
    clients.set(id, res);
  },
  removeClient(id: string) {
    clients.delete(id);
  },
  broadcast(type: string, payload: any) {
    const data = JSON.stringify({ type, payload });
    clients.forEach((client) => {
      client.write(`data: ${data}\n\n`);
    });
  },
};
