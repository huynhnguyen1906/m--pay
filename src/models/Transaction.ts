import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Transaction {
    id: number;
    sender_id: number;
    receiver_id: number;
    amount: number;
    description: string | null;
    status: string;
    created_at: Date;
}

export class TransactionModel {
    // Tạo transaction mới
    static async create(
        sender_id: number,
        receiver_id: number,
        amount: number,
        description: string | null,
    ): Promise<number> {
        try {
            const [result] = await pool.query<ResultSetHeader>(
                'INSERT INTO transactions (sender_id, receiver_id, amount, description, status) VALUES (?, ?, ?, ?, ?)',
                [sender_id, receiver_id, amount, description, 'completed'],
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    }

    // Lấy lịch sử giao dịch của user (cả gửi và nhận)
    static async getByUserId(userId: number): Promise<Transaction[]> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                'SELECT * FROM transactions WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC',
                [userId, userId],
            );
            return rows as Transaction[];
        } catch (error) {
            console.error('Error getting transactions:', error);
            throw error;
        }
    }

    // Lấy chi tiết 1 transaction
    static async findById(id: number): Promise<Transaction | null> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                'SELECT * FROM transactions WHERE id = ?',
                [id],
            );
            return rows.length > 0 ? (rows[0] as Transaction) : null;
        } catch (error) {
            console.error('Error finding transaction:', error);
            throw error;
        }
    }
}
