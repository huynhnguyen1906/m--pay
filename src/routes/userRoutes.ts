import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const router = Router();

// GET /api/users/:userId - Lấy thông tin user theo ID
router.get('/:userId', UserController.getById);

// GET /api/users/student/:studentId - Lấy thông tin user theo student_id
router.get('/student/:studentId', UserController.getByStudentId);

export default router;
