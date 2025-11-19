import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';

export class UserController {
    // GET /api/users/student/:studentId - Lấy thông tin user theo student_id
    static async getByStudentId(req: Request, res: Response): Promise<void> {
        try {
            const { studentId } = req.params;

            if (!studentId) {
                res.status(400).json({
                    success: false,
                    message: '学生番号を入力してください',
                });
                return;
            }

            const user = await UserModel.findByStudentId(studentId);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'この学生番号に対応する学生が見つかりません',
                });
                return;
            }

            // Không trả password
            res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    student_id: user.student_id,
                    name: user.name,
                    email: user.email,
                },
            });
        } catch (error) {
            console.error('Get user by student_id error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // GET /api/users/:userId - Lấy thông tin user theo ID (bao gồm balance)
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'ユーザーIDを入力してください',
                });
                return;
            }

            const user = await UserModel.findById(Number(userId));

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'ユーザーが見つかりません',
                });
                return;
            }

            // Không trả password
            res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    student_id: user.student_id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    balance: user.balance,
                },
            });
        } catch (error) {
            console.error('Get user by id error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }
}
