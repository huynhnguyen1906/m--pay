import { useEffect, useState } from 'react'

import { API_BASE_URL } from '../config/api'
import './TransferModal.scss'

interface User {
  id: number
  student_id: string
  username: string
  name: string
  email: string
  balance: number
}

interface ReceiverInfo {
  id: number
  student_id: string
  name: string
}

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
  initialStudentId?: string // Student ID được quét từ QR/Barcode
  onTransferSuccess: (newBalance: number) => void
}

const TransferModal = ({
  isOpen,
  onClose,
  currentUser,
  initialStudentId = '',
  onTransferSuccess,
}: TransferModalProps) => {
  const [receiverStudentId, setReceiverStudentId] = useState(initialStudentId)
  const [receiverInfo, setReceiverInfo] = useState<ReceiverInfo | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoadingReceiver, setIsLoadingReceiver] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [transferResult, setTransferResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Auto-load receiver info when initialStudentId changes
  useEffect(() => {
    if (initialStudentId) {
      setReceiverStudentId(initialStudentId)
    }
  }, [initialStudentId])

  // Debounced receiver lookup
  useEffect(() => {
    if (!receiverStudentId.trim()) {
      setReceiverInfo(null)
      return
    }

    setIsLoadingReceiver(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/student/${receiverStudentId}`)
        const data = await response.json()

        if (data.success) {
          setReceiverInfo(data.user)
        } else {
          setReceiverInfo(null)
        }
      } catch (error) {
        console.error('Failed to fetch receiver:', error)
        setReceiverInfo(null)
      } finally {
        setIsLoadingReceiver(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [receiverStudentId])

  const handleTransfer = () => {
    if (!receiverInfo || !amount) return
    setShowConfirmModal(true)
  }

  const handleConfirmTransfer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderStudentId: currentUser.student_id,
          receiverStudentId: receiverInfo!.student_id,
          amount: Number(amount),
        }),
      })

      const data = await response.json()

      setTransferResult({
        success: data.success,
        message: data.message || (data.success ? '送金が完了しました' : '送金に失敗しました'),
      })

      if (data.success) {
        onTransferSuccess(data.newBalance)
      }
    } catch (error) {
      setTransferResult({
        success: false,
        message: 'ネットワークエラーが発生しました',
      })
    } finally {
      setShowConfirmModal(false)
      setShowResultModal(true)
    }
  }

  const handleCloseResult = () => {
    setShowResultModal(false)
    if (transferResult?.success) {
      // Reset form
      setReceiverStudentId('')
      setReceiverInfo(null)
      setAmount('')
      setTransferResult(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className='modal-overlay'
        onClick={onClose}
      >
        <div
          className='modal-content transfer-modal'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='modal-header'>
            <h2>送る・もらう</h2>
            <button
              className='close-btn'
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className='modal-body'>
            {/* Receiver Student ID Input */}
            <div className='form-group'>
              <label>受取人のID</label>
              <input
                type='text'
                value={receiverStudentId}
                onChange={(e) => setReceiverStudentId(e.target.value)}
                placeholder='学生IDを入力'
                className='form-input'
              />
              {isLoadingReceiver && <div className='loading-spinner'>読み込み中...</div>}
              {receiverInfo && (
                <div className='receiver-info'>
                  <span className='receiver-name'>✓ {receiverInfo.name}</span>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className='form-group'>
              <label>金額</label>
              <div className='amount-input-wrapper'>
                <input
                  type='number'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder='0'
                  className='form-input amount-input'
                  min='1'
                />
                <span className='amount-unit'>枚</span>
              </div>
            </div>

            {/* Transfer Button */}
            <button
              onClick={handleTransfer}
              disabled={!receiverInfo || !amount || Number(amount) <= 0}
              className='transfer-btn'
            >
              送る
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && receiverInfo && (
        <div
          className='modal-overlay'
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className='modal-content confirm-modal'
            onClick={(e) => e.stopPropagation()}
          >
            <h3>送金確認</h3>
            <div className='confirm-details'>
              <p>
                <strong>送金先:</strong> {receiverInfo.name}
              </p>
              <p>
                <strong>金額:</strong> {amount}枚
              </p>
            </div>
            <p className='confirm-question'>この内容で送金しますか？</p>
            <div className='confirm-buttons'>
              <button
                onClick={() => setShowConfirmModal(false)}
                className='cancel-btn'
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmTransfer}
                className='confirm-btn'
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && transferResult && (
        <div
          className='modal-overlay'
          onClick={handleCloseResult}
        >
          <div
            className='modal-content result-modal'
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`result-icon ${transferResult.success ? 'success' : 'error'}`}>
              {transferResult.success ? '✓' : '✕'}
            </div>
            <h3>{transferResult.success ? '送金完了' : '送金失敗'}</h3>
            <p>{transferResult.message}</p>
            <button
              onClick={handleCloseResult}
              className='close-result-btn'
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default TransferModal
