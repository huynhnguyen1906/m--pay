import { UserModel, UserRole, UserWithBalance } from '../models/User.js';
import { WalletModel } from '../models/Wallet.js';
import { pool } from '../config/database.js';
import { ResultSetHeader } from 'mysql2';

export interface CreateUserResult {
    success: boolean;
    message: string;
    userId?: number;
}

export class UserService {
    // Admin tạo user mới (ADMIN/TEACHER/STUDENT)
    static async createUser(
        role: UserRole,
        name: string,
        mail: string,
        password: string,
        studentCode?: string,
        teamId?: number,
    ): Promise<CreateUserResult> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Validate email unique
            const existingUserByEmail = await UserModel.findByEmailOrStudentCode(mail);
            if (existingUserByEmail) {
                return {
                    success: false,
                    message: 'このメールアドレスは既に使用されています',
                };
            }

            // Validate student_code unique (nếu có)
            if (studentCode) {
                const existingUserByCode = await UserModel.findByStudentCode(studentCode);
                if (existingUserByCode) {
                    return {
                        success: false,
                        message: 'この学生番号は既に使用されています',
                    };
                }
            }

            // STUDENT phải có student_code
            if (role === 'STUDENT' && !studentCode) {
                return {
                    success: false,
                    message: 'STUDENTには学生番号が必要です',
                };
            }

            // Tạo user
            const [result] = await connection.query<ResultSetHeader>(
                `INSERT INTO users (role, student_code, name, team_id, mail, password) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [role, studentCode || null, name, teamId || null, mail, password],
            );

            const userId = result.insertId;

            // Nếu là STUDENT, tạo wallet
            if (role === 'STUDENT') {
                await WalletModel.create(userId, 0);
            }

            await connection.commit();

            return {
                success: true,
                message: 'ユーザーを作成しました',
                userId,
            };
        } catch (error) {
            await connection.rollback();
            console.error('Create user error:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // Lấy tất cả users (có thể filter theo role)
    static async getAllUsers(role?: UserRole) {
        try {
            const users = await UserModel.findAll(role);
            // Không trả password
            const sanitizedUsers = users.map((user) => ({
                user_id: user.user_id,
                role: user.role,
                student_code: user.student_code,
                name: user.name,
                team_id: user.team_id,
                mail: user.mail,
                balance: user.balance,
                created_at: user.created_at,
            }));

            return {
                success: true,
                users: sanitizedUsers,
            };
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    }

    // Lấy students theo team
    static async getStudentsByTeam(teamId: number) {
        try {
            const students = await UserModel.findByTeam(teamId);
            const sanitizedStudents = students.map((student) => ({
                user_id: student.user_id,
                student_code: student.student_code,
                name: student.name,
                team_id: student.team_id,
                mail: student.mail,
                balance: student.balance,
            }));

            return {
                success: true,
                students: sanitizedStudents,
            };
        } catch (error) {
            console.error('Get students by team error:', error);
            throw error;
        }
    }

    // Tìm kiếm students (tên hoặc student_code)
    static async searchStudents(searchTerm: string, teamId?: number) {
        try {
            const students = await UserModel.searchStudents(searchTerm, teamId);
            const sanitizedStudents = students.map((student) => ({
                user_id: student.user_id,
                student_code: student.student_code,
                name: student.name,
                team_id: student.team_id,
                mail: student.mail,
                balance: student.balance,
            }));

            return {
                success: true,
                students: sanitizedStudents,
            };
        } catch (error) {
            console.error('Search students error:', error);
            throw error;
        }
    }

    // Lấy thông tin user theo ID
    static async getUserById(userId: number) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'ユーザーが見つかりません',
                };
            }

            // Không trả password
            return {
                success: true,
                user: {
                    user_id: user.user_id,
                    role: user.role,
                    student_code: user.student_code,
                    name: user.name,
                    team_id: user.team_id,
                    mail: user.mail,
                    balance: user.balance,
                    created_at: user.created_at,
                },
            };
        } catch (error) {
            console.error('Get user by id error:', error);
            throw error;
        }
    }

    // Lấy thông tin user theo student_code
    static async getUserByStudentCode(studentCode: string) {
        try {
            const user = await UserModel.findByStudentCode(studentCode);
            if (!user) {
                return {
                    success: false,
                    message: '学生が見つかりません',
                };
            }

            return {
                success: true,
                user: {
                    user_id: user.user_id,
                    student_code: user.student_code,
                    name: user.name,
                    team_id: user.team_id,
                    mail: user.mail,
                    balance: user.balance,
                },
            };
        } catch (error) {
            console.error('Get user by student_code error:', error);
            throw error;
        }
    }
}
