import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService.js';

export class TransactionController {
    // POST /api/transactions/issue - Teacher phát tiền (ISSUE)
    static async issue(req: Request, res: Response): Promise<void> {
        try {
            const { teacherId, studentCode, amount, category, reason } = req.body;

            // Validate input
            if (!teacherId || !studentCode || !amount || !category || !reason) {
                res.status(400).json({
                    success: false,
                    message: '全ての項目を入力してください',
                });
                return;
            }

            const result = await TransactionService.issueBonus(
                Number(teacherId),
                studentCode,
                Number(amount),
                category,
                reason,
            );

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Issue controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // POST /api/transactions/transfer - Student chuyển tiền (TRANSFER)
    static async transfer(req: Request, res: Response): Promise<void> {
        try {
            const { fromStudentCode, toStudentCode, amount, message } = req.body;

            // Validate input
            if (!fromStudentCode || !toStudentCode || !amount) {
                res.status(400).json({
                    success: false,
                    message: '送金者、受取人、金額を入力してください',
                });
                return;
            }

            const result = await TransactionService.transfer(
                fromStudentCode,
                toStudentCode,
                Number(amount),
                message,
            );

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Transfer controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // GET /api/transactions/public - Lấy lịch sử công khai (ISSUE)
    static async getPublicHistory(req: Request, res: Response): Promise<void> {
        try {
            const { limit } = req.query;
            const result = await TransactionService.getPublicHistory(limit ? Number(limit) : undefined);
            res.status(200).json(result);
        } catch (error) {
            console.error('Get public history controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // GET /api/transactions/history/:userId - Lấy lịch sử giao dịch của user
    static async getUserHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { limit } = req.query;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'ユーザーIDを入力してください',
                });
                return;
            }

            const result = await TransactionService.getUserHistory(
                Number(userId),
                limit ? Number(limit) : undefined,
            );
            res.status(200).json(result);
        } catch (error) {
            console.error('Get user history controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }

    // GET /api/transactions/teacher/:teacherId/total - Lấy tổng tiền đã phát của Teacher
    static async getTeacherTotal(req: Request, res: Response): Promise<void> {
        try {
            const { teacherId } = req.params;

            if (!teacherId) {
                res.status(400).json({
                    success: false,
                    message: '教師IDを入力してください',
                });
                return;
            }

            const result = await TransactionService.getTeacherTotalIssued(Number(teacherId));
            res.status(200).json(result);
        } catch (error) {
            console.error('Get teacher total controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }
}
