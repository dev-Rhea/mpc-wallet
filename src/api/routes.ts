import { Router } from 'express';
import { MainController } from './controllers/mainController';
import { authMiddleware } from './middlewares/auth';

const router = Router();
const controller = new MainController();

router.post('/request', authMiddleware, controller.createRequest);
router.post('/approve', authMiddleware, controller.approveRequest);

export default router;
