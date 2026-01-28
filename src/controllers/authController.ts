import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

export class AuthController {
    // POST /api/auth/login
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { identifier, password } = req.body;

            // Validate input
            if (!identifier || !password) {
                res.status(400).json({
                    success: false,
                    message: 'メールアドレスまたは学生番号とパスワードを入力してください',
                });
                return;
            }

            // Gọi service để xử lý login
            const result = await AuthService.login(identifier, password);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error) {
            console.error('Login controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }
}
