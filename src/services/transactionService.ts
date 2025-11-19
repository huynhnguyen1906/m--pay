import { UserModel } from '../models/User.js';
import { TransactionModel } from '../models/Transaction.js';
import { pool } from '../config/database.js';

export interface TransferResult {
    success: boolean;
    message: string;
    transactionId?: number;
}

export class TransactionService {
    // Chuyển tiền
    static async transfer(
        senderId: number,
        receiverId: number,
        amount: number,
        description?: string,
    ): Promise<TransferResult> {
        const connection = await pool.getConnection();

        try {
            // Bắt đầu transaction
            await connection.beginTransaction();

            // Kiểm tra không tự chuyển cho chính mình
            if (senderId === receiverId) {
                return {
                    success: false,
                    message: '自分自身に送金できません', // Không thể chuyển cho chính mình
                };
            }

            // Kiểm tra số tiền hợp lệ
            if (amount <= 0) {
                return {
                    success: false,
                    message: '送金額は0より大きい必要があります', // Số tiền phải lớn hơn 0
                };
            }

            // Lấy thông tin sender
            const sender = await UserModel.findById(senderId);
            if (!sender) {
                await connection.rollback();
                return {
                    success: false,
                    message: '送金者が見つかりません', // Không tìm thấy người gửi
                };
            }

            // Kiểm tra số dư
            if (sender.balance < amount) {
                await connection.rollback();
                return {
                    success: false,
                    message: '残高が不足しています', // Số dư không đủ
                };
            }

            // Lấy thông tin receiver
            const receiver = await UserModel.findById(receiverId);
            if (!receiver) {
                await connection.rollback();
                return {
                    success: false,
                    message: '受取人が見つかりません', // Không tìm thấy người nhận
                };
            }

            // Trừ tiền người gửi
            await UserModel.updateBalance(senderId, sender.balance - amount);

            // Cộng tiền người nhận
            await UserModel.updateBalance(receiverId, receiver.balance + amount);

            // Lưu transaction
            const transactionId = await TransactionModel.create(senderId, receiverId, amount, description || null);

            // Commit transaction
            await connection.commit();

            return {
                success: true,
                message: '送金が完了しました', // Chuyển tiền thành công
                transactionId,
            };
        } catch (error) {
            await connection.rollback();
            console.error('Transfer error:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // Lấy lịch sử giao dịch của user
    static async getHistory(userId: number) {
        try {
            const transactions = await TransactionModel.getByUserId(userId);
            return {
                success: true,
                transactions,
            };
        } catch (error) {
            console.error('Get history error:', error);
            throw error;
        }
    }
}
