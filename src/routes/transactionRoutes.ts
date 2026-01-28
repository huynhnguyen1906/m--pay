import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController.js';

const router = Router();

// POST /api/transactions/issue - Teacher phát tiền (ISSUE)
router.post('/issue', TransactionController.issue);

// POST /api/transactions/transfer - Student chuyển tiền (TRANSFER)
router.post('/transfer', TransactionController.transfer);

// GET /api/transactions/public - Lấy lịch sử công khai (ISSUE)
router.get('/public', TransactionController.getPublicHistory);

// GET /api/transactions/history/:userId - Lấy lịch sử giao dịch của user
router.get('/history/:userId', TransactionController.getUserHistory);

// GET /api/transactions/teacher/:teacherId/total - Lấy tổng tiền đã phát của Teacher
router.get('/teacher/:teacherId/total', TransactionController.getTeacherTotal);

export default router;
