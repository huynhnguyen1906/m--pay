import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export type TransactionType = 'ISSUE' | 'TRANSFER';

export interface Transaction {
    tx_id: number;
    type: TransactionType;
    amount: number;
    created_at: Date;
    from_user_id: number;
    to_user_id: number;
    category: string | null;
    reason: string | null;
    message: string | null;
    is_public: boolean;
}

export interface TransactionWithUsers extends Transaction {
    from_user_name?: string;
    from_student_code?: string;
    to_user_name?: string;
    to_student_code?: string;
}

export class TransactionModel {
    // Tạo ISSUE transaction (Teacher phát tiền cho Student)
    static async createIssue(
        fromUserId: number,
        toUserId: number,
        amount: number,
        category: string,
        reason: string,
    ): Promise<number> {
        try {
            const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO transactions 
                (type, from_user_id, to_user_id, amount, category, reason, is_public) 
                VALUES ('ISSUE', ?, ?, ?, ?, ?, TRUE)`,
                [fromUserId, toUserId, amount, category, reason],
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating ISSUE transaction:', error);
            throw error;
        }
    }

    // Tạo TRANSFER transaction (Student chuyển cho Student)
    static async createTransfer(
        fromUserId: number,
        toUserId: number,
        amount: number,
        message?: string,
    ): Promise<number> {
        try {
            const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO transactions 
                (type, from_user_id, to_user_id, amount, message, is_public) 
                VALUES ('TRANSFER', ?, ?, ?, ?, FALSE)`,
                [fromUserId, toUserId, amount, message || null],
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating TRANSFER transaction:', error);
            throw error;
        }
    }

    // Lấy lịch sử giao dịch công khai (ISSUE only)
    static async getPublicTransactions(limit?: number): Promise<TransactionWithUsers[]> {
        try {
            let query = `
                SELECT 
                    t.*,
                    from_user.name as from_user_name,
                    from_user.student_code as from_student_code,
                    to_user.name as to_user_name,
                    to_user.student_code as to_student_code
                FROM transactions t
                LEFT JOIN users from_user ON t.from_user_id = from_user.user_id
                LEFT JOIN users to_user ON t.to_user_id = to_user.user_id
                WHERE t.is_public = TRUE
                ORDER BY t.created_at DESC
            `;

            if (limit) {
                query += ` LIMIT ${limit}`;
            }

            const [rows] = await pool.query<RowDataPacket[]>(query);
            return rows as TransactionWithUsers[];
        } catch (error) {
            console.error('Error getting public transactions:', error);
            throw error;
        }
    }

    // Lấy lịch sử giao dịch của user (cả gửi và nhận)
    static async getByUserId(userId: number, limit?: number): Promise<TransactionWithUsers[]> {
        try {
            let query = `
                SELECT 
                    t.*,
                    from_user.name as from_user_name,
                    from_user.student_code as from_student_code,
                    to_user.name as to_user_name,
                    to_user.student_code as to_student_code
                FROM transactions t
                LEFT JOIN users from_user ON t.from_user_id = from_user.user_id
                LEFT JOIN users to_user ON t.to_user_id = to_user.user_id
                WHERE t.from_user_id = ? OR t.to_user_id = ?
                ORDER BY t.created_at DESC
            `;

            if (limit) {
                query += ` LIMIT ${limit}`;
            }

            const [rows] = await pool.query<RowDataPacket[]>(query, [userId, userId]);
            return rows as TransactionWithUsers[];
        } catch (error) {
            console.error('Error getting transactions by user:', error);
            throw error;
        }
    }

    // Lấy tổng tiền đã phát (ISSUE) của một Teacher trong mùa này
    static async getTotalIssuedByTeacher(teacherId: number): Promise<number> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT SUM(amount) as total
                FROM transactions
                WHERE type = 'ISSUE' AND from_user_id = ?`,
                [teacherId],
            );
            return rows.length > 0 && rows[0].total ? Number(rows[0].total) : 0;
        } catch (error) {
            console.error('Error getting total issued:', error);
            throw error;
        }
    }

    // Lấy chi tiết 1 transaction
    static async findById(txId: number): Promise<TransactionWithUsers | null> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT 
                    t.*,
                    from_user.name as from_user_name,
                    from_user.student_code as from_student_code,
                    to_user.name as to_user_name,
                    to_user.student_code as to_student_code
                FROM transactions t
                LEFT JOIN users from_user ON t.from_user_id = from_user.user_id
                LEFT JOIN users to_user ON t.to_user_id = to_user.user_id
                WHERE t.tx_id = ?`,
                [txId],
            );
            return rows.length > 0 ? (rows[0] as TransactionWithUsers) : null;
        } catch (error) {
            console.error('Error finding transaction:', error);
            throw error;
        }
    }
}
