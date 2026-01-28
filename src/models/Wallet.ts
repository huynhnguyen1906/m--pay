import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

export class WalletModel {
    // Lấy balance của user
    static async getBalance(userId: number): Promise<number> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
            return rows.length > 0 ? Number(rows[0].balance) : 0;
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    // Cập nhật balance
    static async updateBalance(userId: number, newBalance: number): Promise<void> {
        try {
            await pool.query('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [
                newBalance,
                userId,
            ]);
        } catch (error) {
            console.error('Error updating balance:', error);
            throw error;
        }
    }

    // Tạo wallet mới (khi tạo student)
    static async create(userId: number, initialBalance: number = 0): Promise<void> {
        try {
            await pool.query('INSERT INTO wallets (user_id, balance) VALUES (?, ?)', [userId, initialBalance]);
        } catch (error) {
            console.error('Error creating wallet:', error);
            throw error;
        }
    }

    // Cộng tiền vào wallet
    static async addFunds(userId: number, amount: number): Promise<void> {
        try {
            await pool.query(
                'UPDATE wallets SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                [amount, userId],
            );
        } catch (error) {
            console.error('Error adding funds:', error);
            throw error;
        }
    }

    // Trừ tiền từ wallet
    static async deductFunds(userId: number, amount: number): Promise<void> {
        try {
            await pool.query(
                'UPDATE wallets SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                [amount, userId],
            );
        } catch (error) {
            console.error('Error deducting funds:', error);
            throw error;
        }
    }
}
