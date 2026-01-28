import { Request, Response } from 'express';
import { UserService } from '../services/userService.js';
import { UserRole } from '../models/User.js';

export class UserController {
    // POST /api/users - Admin tạo user mới
    static async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { role, name, mail, password, studentCode, teamId } = req.body;

            // Validate input
            if (!role || !name || !mail || !password) {
                res.status(400).json({
                    success: false,
                    message: 'ロール、名前、メール、パスワードを入力してください',
                });
                return;
            }

            // Validate role
            const validRoles: UserRole[] = ['ADMIN', 'TEACHER', 'STUDENT'];
            if (!validRoles.includes(role)) {
                res.status(400).json({
                    success: false,
                    message: '無効なロールです',
                });
                return;
            }

            const result = await UserService.createUser(
                role,
                name,
                mail,
                password,
                studentCode,
                teamId ? Number(teamId) : undefined,
            );

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create user controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // GET /api/users - Lấy tất cả users (có thể filter theo role)
    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const { role } = req.query;
            const result = await UserService.getAllUsers(role as UserRole);
            res.status(200).json(result);
        } catch (error) {
            console.error('Get all users controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // GET /api/users/:userId - Lấy thông tin user theo ID
    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'ユーザーIDを入力してください',
                });
                return;
            }

            const result = await UserService.getUserById(Number(userId));

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get user by id controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // GET /api/users/student/:studentCode - Lấy thông tin student theo student_code
    static async getByStudentCode(req: Request, res: Response): Promise<void> {
        try {
            const { studentCode } = req.params;

            if (!studentCode) {
                res.status(400).json({
                    success: false,
                    message: '学生番号を入力してください',
                });
                return;
            }

            const result = await UserService.getUserByStudentCode(studentCode);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get user by student_code controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // GET /api/users/team/:teamId - Lấy students theo team
    static async getStudentsByTeam(req: Request, res: Response): Promise<void> {
        try {
            const { teamId } = req.params;

            if (!teamId) {
                res.status(400).json({
                    success: false,
                    message: 'チームIDを入力してください',
                });
                return;
            }

            const result = await UserService.getStudentsByTeam(Number(teamId));
            res.status(200).json(result);
        } catch (error) {
            console.error('Get students by team controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // GET /api/users/search?q=searchTerm&teamId=1 - Tìm kiếm students
    static async searchStudents(req: Request, res: Response): Promise<void> {
        try {
            const { q, teamId } = req.query;

            if (!q || typeof q !== 'string') {
                res.status(400).json({
                    success: false,
                    message: '検索キーワードを入力してください',
                });
                return;
            }

            const result = await UserService.searchStudents(q, teamId ? Number(teamId) : undefined);
            res.status(200).json(result);
        } catch (error) {
            console.error('Search students controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }
}
