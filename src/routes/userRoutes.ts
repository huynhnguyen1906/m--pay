import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const router = Router();

// POST /api/users - Admin tạo user mới
router.post('/', UserController.createUser);

// GET /api/users - Lấy tất cả users (có thể filter theo role)
router.get('/', UserController.getAllUsers);

// GET /api/users/search - Tìm kiếm students
router.get('/search', UserController.searchStudents);

// GET /api/users/team/:teamId - Lấy students theo team
router.get('/team/:teamId', UserController.getStudentsByTeam);

// GET /api/users/student/:studentCode - Lấy thông tin student theo student_code
router.get('/student/:studentCode', UserController.getByStudentCode);

// GET /api/users/:userId - Lấy thông tin user theo ID
router.get('/:userId', UserController.getUserById);

export default router;
