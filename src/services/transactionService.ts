import { UserModel } from '../models/User.js';
import { TransactionModel } from '../models/Transaction.js';
import { WalletModel } from '../models/Wallet.js';
import { pool } from '../config/database.js';

export interface IssueResult {
    success: boolean;
    message: string;
    transactionId?: number;
}

export interface TransferResult {
    success: boolean;
    message: string;
    transactionId?: number;
}

export class TransactionService {
    // ISSUE: Teacher phát tiền cho Student
    static async issueBonus(
        teacherId: number,
        studentCode: string,
        amount: number,
        category: string,
        reason: string,
    ): Promise<IssueResult> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Validate amount
            if (amount <= 0) {
                return {
                    success: false,
                    message: '金額は0より大きい必要があります',
                };
            }

            // Validate category
            const validCategories = ['企画', 'デザイン', 'プログラミング', 'その他'];
            if (!validCategories.includes(category)) {
                return {
                    success: false,
                    message: 'カテゴリが無効です',
                };
            }

            // Validate reason
            if (!reason || reason.trim() === '') {
                return {
                    success: false,
                    message: '理由を入力してください',
                };
            }

            // Tìm student
            const student = await UserModel.findByStudentCode(studentCode);
            if (!student) {
                await connection.rollback();
                return {
                    success: false,
                    message: '学生が見つかりません',
                };
            }

            // Kiểm tra student có role STUDENT không
            if (student.role !== 'STUDENT') {
                await connection.rollback();
                return {
                    success: false,
                    message: 'この学生番号はSTUDENTではありません',
                };
            }

            // Tạo ISSUE transaction
            const transactionId = await TransactionModel.createIssue(
                teacherId,
                student.user_id,
                amount,
                category,
                reason,
            );

            // Cộng tiền vào wallet của student
            await WalletModel.addFunds(student.user_id, amount);

            await connection.commit();

            return {
                success: true,
                message: 'M$を発行しました',
                transactionId,
            };
        } catch (error) {
            await connection.rollback();
            console.error('Issue bonus error:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // TRANSFER: Student chuyển tiền cho Student
    static async transfer(
        fromStudentCode: string,
        toStudentCode: string,
        amount: number,
        message?: string,
    ): Promise<TransferResult> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Kiểm tra không tự chuyển cho chính mình
            if (fromStudentCode === toStudentCode) {
                return {
                    success: false,
                    message: '自分自身に送金できません',
                };
            }

            // Validate amount
            if (amount <= 0) {
                return {
                    success: false,
                    message: '送金額は0より大きい必要があります',
                };
            }

            // Lấy thông tin sender
            const sender = await UserModel.findByStudentCode(fromStudentCode);
            if (!sender) {
                await connection.rollback();
                return {
                    success: false,
                    message: '送金者が見つかりません',
                };
            }

            // Kiểm tra sender là STUDENT
            if (sender.role !== 'STUDENT') {
                await connection.rollback();
                return {
                    success: false,
                    message: '送金者はSTUDENTである必要があります',
                };
            }

            // Lấy thông tin receiver
            const receiver = await UserModel.findByStudentCode(toStudentCode);
            if (!receiver) {
                await connection.rollback();
                return {
                    success: false,
                    message: '受取人が見つかりません',
                };
            }

            // Kiểm tra receiver là STUDENT
            if (receiver.role !== 'STUDENT') {
                await connection.rollback();
                return {
                    success: false,
                    message: '受取人はSTUDENTである必要があります',
                };
            }

            // Kiểm tra số dư
            const senderBalance = await WalletModel.getBalance(sender.user_id);
            if (senderBalance < amount) {
                await connection.rollback();
                return {
                    success: false,
                    message: '残高が不足しています',
                };
            }

            // Tạo TRANSFER transaction
            const transactionId = await TransactionModel.createTransfer(
                sender.user_id,
                receiver.user_id,
                amount,
                message,
            );

            // Trừ tiền người gửi
            await WalletModel.deductFunds(sender.user_id, amount);

            // Cộng tiền người nhận
            await WalletModel.addFunds(receiver.user_id, amount);

            await connection.commit();

            return {
                success: true,
                message: '送金が完了しました',
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

    // Lấy lịch sử giao dịch công khai (ISSUE only)
    static async getPublicHistory(limit?: number) {
        try {
            const transactions = await TransactionModel.getPublicTransactions(limit);
            return {
                success: true,
                transactions,
            };
        } catch (error) {
            console.error('Get public history error:', error);
            throw error;
        }
    }

    // Lấy lịch sử giao dịch của user (cả ISSUE và TRANSFER)
    static async getUserHistory(userId: number, limit?: number) {
        try {
            const transactions = await TransactionModel.getByUserId(userId, limit);
            return {
                success: true,
                transactions,
            };
        } catch (error) {
            console.error('Get user history error:', error);
            throw error;
        }
    }

    // Lấy tổng tiền đã phát của Teacher
    static async getTeacherTotalIssued(teacherId: number) {
        try {
            const total = await TransactionModel.getTotalIssuedByTeacher(teacherId);
            return {
                success: true,
                total,
            };
        } catch (error) {
            console.error('Get teacher total issued error:', error);
            throw error;
        }
    }
}
