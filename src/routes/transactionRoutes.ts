import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController.js';

const router = Router();

// POST /api/transactions/transfer - Chuyển tiền
router.post('/transfer', TransactionController.transfer);

// GET /api/transactions/history/:userId - Lấy lịch sử giao dịch
router.get('/history/:userId', TransactionController.getHistory);

export default router;
