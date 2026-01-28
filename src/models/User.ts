import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
    user_id: number;
    role: UserRole;
    student_code: string | null;
    name: string;
    team_id: number | null;
    mail: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserWithBalance extends User {
    balance?: number;
}

export class UserModel {
    // Tìm user theo email hoặc student_code (dùng cho login)
    static async findByEmailOrStudentCode(identifier: string): Promise<UserWithBalance | null> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT u.*, w.balance 
                FROM users u
                LEFT JOIN wallets w ON u.user_id = w.user_id
                WHERE u.mail = ? OR u.student_code = ?`,
                [identifier, identifier],
            );
            return rows.length > 0 ? (rows[0] as UserWithBalance) : null;
        } catch (error) {
            console.error('Error finding user by email or student_code:', error);
            throw error;
        }
    }

    // Tìm user theo student_code
    static async findByStudentCode(studentCode: string): Promise<UserWithBalance | null> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT u.*, w.balance 
                FROM users u
                LEFT JOIN wallets w ON u.user_id = w.user_id
                WHERE u.student_code = ?`,
                [studentCode],
            );
            return rows.length > 0 ? (rows[0] as UserWithBalance) : null;
        } catch (error) {
            console.error('Error finding user by student_code:', error);
            throw error;
        }
    }

    // Tìm user theo ID
    static async findById(userId: number): Promise<UserWithBalance | null> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT u.*, w.balance 
                FROM users u
                LEFT JOIN wallets w ON u.user_id = w.user_id
                WHERE u.user_id = ?`,
                [userId],
            );
            return rows.length > 0 ? (rows[0] as UserWithBalance) : null;
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw error;
        }
    }

    // Lấy tất cả users (có thể filter theo role)
    static async findAll(role?: UserRole): Promise<UserWithBalance[]> {
        try {
            let query = `SELECT u.*, w.balance 
                        FROM users u
                        LEFT JOIN wallets w ON u.user_id = w.user_id`;
            const params: any[] = [];

            if (role) {
                query += ' WHERE u.role = ?';
                params.push(role);
            }

            query += ' ORDER BY u.created_at DESC';

            const [rows] = await pool.query<RowDataPacket[]>(query, params);
            return rows as UserWithBalance[];
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    // Lấy students theo team_id
    static async findByTeam(teamId: number): Promise<UserWithBalance[]> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT u.*, w.balance 
                FROM users u
                LEFT JOIN wallets w ON u.user_id = w.user_id
                WHERE u.role = 'STUDENT' AND u.team_id = ?
                ORDER BY u.name`,
                [teamId],
            );
            return rows as UserWithBalance[];
        } catch (error) {
            console.error('Error getting users by team:', error);
            throw error;
        }
    }

    // Tìm kiếm students (theo tên hoặc student_code)
    static async searchStudents(searchTerm: string, teamId?: number): Promise<UserWithBalance[]> {
        try {
            let query = `SELECT u.*, w.balance 
                        FROM users u
                        LEFT JOIN wallets w ON u.user_id = w.user_id
                        WHERE u.role = 'STUDENT' 
                        AND (u.name LIKE ? OR u.student_code LIKE ?)`;
            const params: any[] = [`%${searchTerm}%`, `%${searchTerm}%`];

            if (teamId) {
                query += ' AND u.team_id = ?';
                params.push(teamId);
            }

            query += ' ORDER BY u.name';

            const [rows] = await pool.query<RowDataPacket[]>(query, params);
            return rows as UserWithBalance[];
        } catch (error) {
            console.error('Error searching students:', error);
            throw error;
        }
    }
}
