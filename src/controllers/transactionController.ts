import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService.js';

export class TransactionController {
    // POST /api/transactions/transfer - Chuyển tiền
    static async transfer(req: Request, res: Response): Promise<void> {
        try {
            const { senderId, receiverId, amount, description } = req.body;

            // Validate input
            if (!senderId || !receiverId || !amount) {
                res.status(400).json({
                    success: false,
                    message: '送金者ID、受取人ID、金額を入力してください', // Nhập đầy đủ thông tin
                });
                return;
            }

            // Validate amount is number
            const amountNum = Number(amount);
            if (isNaN(amountNum)) {
                res.status(400).json({
                    success: false,
                    message: '金額は数字で入力してください', // Số tiền phải là số
                });
                return;
            }

            // Gọi service để xử lý chuyển tiền
            const result = await TransactionService.transfer(
                Number(senderId),
                Number(receiverId),
                amountNum,
                description,
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
                message: 'サーバーエラーが発生しました', // Có lỗi server
            });
        }
    }

    // GET /api/transactions/history/:userId - Lấy lịch sử giao dịch
    static async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'ユーザーIDを入力してください', // Nhập user ID
                });
                return;
            }

            const result = await TransactionService.getHistory(Number(userId));
            res.status(200).json(result);
        } catch (error) {
            console.error('Get history controller error:', error);
            res.status(500).json({
                success: false,
                message: 'サーバーエラーが発生しました',
            });
        }
    }
}
