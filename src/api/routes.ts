import { Router } from 'express';
import { MainController } from './controllers/mainController';
import { WalletController } from './controllers/WalletController';
import { authMiddleware } from './middlewares/auth';

const router = Router();
const controller = new MainController();
const walletController = new WalletController();

router.post('/request', authMiddleware, controller.createRequest);
router.post('/approve', authMiddleware, controller.approveRequest);
router.post('/wallet/create', walletController.createWallet);
router.get('/wallet/list/:orgId', walletController.getWallets);
export default router;
