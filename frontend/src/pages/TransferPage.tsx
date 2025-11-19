import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { API_BASE_URL } from '../config/api'
import './TransferPage.scss'

interface User {
  id: number
  student_id: string
  username: string
  name: string
  email: string
  balance: number
}

function TransferPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [receiverStudentId, setReceiverStudentId] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingReceiver, setLoadingReceiver] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/')
      return
    }
    setCurrentUser(JSON.parse(userStr))
  }, [navigate])

  // Auto-load tên học sinh khi nhập student_id
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (receiverStudentId && receiverStudentId.length >= 3) {
        setLoadingReceiver(true)
        setError('')
        setReceiverName('')

        try {
          const response = await fetch(`${API_BASE_URL}/api/users/student/${receiverStudentId}`)
          const data = await response.json()

          if (data.success) {
            setReceiverName(data.user.name)
          } else {
            setError(data.message)
          }
        } catch (err) {
          setError('サーバーに接続できません')
          console.log(err)
        } finally {
          setLoadingReceiver(false)
        }
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [receiverStudentId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!receiverName) {
      setError('有効な学生番号を入力してください')
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError('送金額を正しく入力してください')
      return
    }

    if (currentUser && receiverStudentId === currentUser.student_id) {
      setError('自分自身に送金できません')
      return
    }

    setShowConfirm(true)
  }

  const handleConfirmTransfer = async () => {
    if (!currentUser) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderStudentId: currentUser.student_id,
          receiverStudentId,
          amount: Number(amount),
          description,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Cập nhật balance trong localStorage
        const updatedUser = { ...currentUser, balance: currentUser.balance - Number(amount) }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        // Hiển thị popup thành công
        setTransferSuccess(true)
        setResultMessage('送金が完了しました！')
        setShowConfirm(false)
        setShowResult(true)
      } else {
        // Hiển thị popup thất bại
        setTransferSuccess(false)
        setResultMessage(data.message)
        setShowConfirm(false)
        setShowResult(true)
      }
    } catch (err) {
      setTransferSuccess(false)
      setResultMessage('サーバーに接続できません')
      setShowConfirm(false)
      setShowResult(true)
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) return null

  return (
    <div className='transfer-page'>
      <div className='transfer-container'>
        {/* Header */}
        <header className='transfer-header'>
          <button
            onClick={() => navigate('/home')}
            className='back-btn'
          >
            ← 戻る
          </button>
          <h1>送金</h1>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='transfer-form'
        >
          <div className='current-balance'>
            <p>現在の残高</p>
            <div className='balance'>
              {currentUser.balance} <span>枚</span>
            </div>
          </div>

          <div className='form-group'>
            <label htmlFor='receiverStudentId'>送金先学生番号</label>
            <input
              type='text'
              id='receiverStudentId'
              value={receiverStudentId}
              onChange={(e) => setReceiverStudentId(e.target.value)}
              placeholder='学生番号を入力'
              required
            />
          </div>

          {loadingReceiver && (
            <div className='loading-receiver'>
              <div className='spinner'></div>
              <span>学生情報を取得中...</span>
            </div>
          )}

          {receiverName && !loadingReceiver && (
            <div className='receiver-info'>
              <span className='label'>送金先:</span>
              <span className='name'>{receiverName}</span>
            </div>
          )}

          <div className='form-group'>
            <label htmlFor='amount'>送金額（枚）</label>
            <input
              type='number'
              id='amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='送金額を入力'
              min='1'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='description'>メッセージ（任意）</label>
            <textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='メッセージを入力'
              rows={3}
            />
          </div>

          {error && <div className='error-message'>{error}</div>}

          <button
            type='submit'
            className='transfer-button'
            disabled={loading || loadingReceiver || !receiverName}
          >
            送金する
          </button>
        </form>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className='modal-overlay'>
          <div className='modal'>
            <h2>送金確認</h2>
            <div className='modal-content'>
              <div className='confirm-row'>
                <span className='label'>送金先:</span>
                <span className='value'>{receiverName}</span>
              </div>
              <div className='confirm-row'>
                <span className='label'>学生番号:</span>
                <span className='value'>{receiverStudentId}</span>
              </div>
              <div className='confirm-row'>
                <span className='label'>送金額:</span>
                <span className='value amount'>{amount} 枚</span>
              </div>
              {description && (
                <div className='confirm-row'>
                  <span className='label'>メッセージ:</span>
                  <span className='value'>{description}</span>
                </div>
              )}
            </div>
            <div className='modal-actions'>
              <button
                onClick={() => setShowConfirm(false)}
                className='cancel-btn'
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmTransfer}
                className='confirm-btn'
                disabled={loading}
              >
                {loading ? '送金中...' : '送金する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && (
        <div className='modal-overlay'>
          <div className='modal result-modal'>
            <div className='result-icon'>
              {transferSuccess ?
                <div className='success-icon'>✓</div>
              : <div className='error-icon'>✕</div>}
            </div>
            <h2>{transferSuccess ? '送金完了' : '送金失敗'}</h2>
            <p className='result-message'>{resultMessage}</p>
            <button
              onClick={() => {
                setShowResult(false)
                if (transferSuccess) {
                  navigate('/home')
                }
              }}
              className='ok-btn'
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransferPage
