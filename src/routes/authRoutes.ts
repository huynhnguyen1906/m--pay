import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

// POST /api/auth/login - Đăng nhập
router.post('/login', AuthController.login);

export default router;
