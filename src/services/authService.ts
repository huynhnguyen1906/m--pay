import { UserModel, UserWithBalance, UserRole } from '../models/User.js';

export interface LoginResult {
    success: boolean;
    message: string;
    user?: {
        user_id: number;
        role: UserRole;
        student_code: string | null;
        name: string;
        team_id: number | null;
        mail: string;
        balance?: number;
    };
}

export class AuthService {
    // Đăng nhập (hỗ trợ email hoặc student_code)
    static async login(identifier: string, password: string): Promise<LoginResult> {
        try {
            // Tìm user theo email hoặc student_code
            const user = await UserModel.findByEmailOrStudentCode(identifier);

            if (!user) {
                return {
                    success: false,
                    message: 'メールアドレスまたは学生番号が正しくありません',
                };
            }

            // So sánh password (tạm thời chưa hash - sẽ implement bcrypt sau)
            if (user.password !== password) {
                return {
                    success: false,
                    message: 'パスワードが正しくありません',
                };
            }

            // Đăng nhập thành công - trả về thông tin user (không gửi password)
            return {
                success: true,
                message: 'ログイン成功',
                user: {
                    user_id: user.user_id,
                    role: user.role,
                    student_code: user.student_code,
                    name: user.name,
                    team_id: user.team_id,
                    mail: user.mail,
                    balance: user.balance || 0,
                },
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
}
