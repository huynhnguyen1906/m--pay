import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

export interface User {
    id: number;
    student_id: string;
    username: string;
    password: string;
    name: string;
    email: string;
    balance: number;
    created_at: Date;
    updated_at: Date;
}

export class UserModel {
    // Tìm user theo username
    static async findByUsername(username: string): Promise<User | null> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);
            return rows.length > 0 ? (rows[0] as User) : null;
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    // Tìm user theo ID
    static async findById(id: number): Promise<User | null> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
            return rows.length > 0 ? (rows[0] as User) : null;
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw error;
        }
    }

    // Lấy tất cả users
    static async findAll(): Promise<User[]> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                'SELECT id, student_id, username, name, email, balance, created_at FROM users',
            );
            return rows as User[];
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    // Cập nhật số dư (dùng cho chuyển tiền)
    static async updateBalance(userId: number, newBalance: number): Promise<void> {
        try {
            await pool.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);
        } catch (error) {
            console.error('Error updating balance:', error);
            throw error;
        }
    }
}
