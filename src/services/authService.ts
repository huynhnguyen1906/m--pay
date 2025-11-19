import { UserModel, User } from '../models/User.js';

export interface LoginResult {
    success: boolean;
    message: string;
    user?: {
        id: number;
        student_id: string;
        username: string;
        name: string;
        email: string;
        balance: number;
    };
}

export class AuthService {
    // Đăng nhập
    static async login(username: string, password: string): Promise<LoginResult> {
        try {
            // Tìm user theo username
            const user = await UserModel.findByUsername(username);

            if (!user) {
                return {
                    success: false,
                    message: 'ユーザー名またはパスワードが正しくありません', // Username hoặc password không đúng
                };
            }

            // So sánh password (tạm thời chưa hash)
            if (user.password !== password) {
                return {
                    success: false,
                    message: 'ユーザー名またはパスワードが正しくありません',
                };
            }

            // Đăng nhập thành công - trả về thông tin user (không gửi password)
            return {
                success: true,
                message: 'ログイン成功', // Đăng nhập thành công
                user: {
                    id: user.id,
                    student_id: user.student_id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    balance: user.balance,
                },
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
}
