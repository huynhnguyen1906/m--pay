import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { API_BASE_URL } from '../config/api'
import './HistoryPage.scss'

interface User {
  id: number
  student_id: string
  username: string
  name: string
  email: string
  balance: number
}

interface Transaction {
  id: number
  sender_id: number
  receiver_id: number
  amount: number
  description: string | null
  status: string
  created_at: string
}

function HistoryPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/')
      return
    }
    const user = JSON.parse(userStr)
    setCurrentUser(user)

    // Lấy lịch sử giao dịch
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/transactions/history/${user.id}`)
        const data = await response.json()

        if (data.success) {
          setTransactions(data.transactions)
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [navigate])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatAmount = (transaction: Transaction) => {
    if (!currentUser) return '0'

    const isSent = transaction.sender_id === currentUser.id
    return isSent ? `-${transaction.amount}` : `+${transaction.amount}`
  }

  const getTransactionColor = (transaction: Transaction) => {
    if (!currentUser) return ''
    return transaction.sender_id === currentUser.id ? 'negative' : 'positive'
  }

  const getTransactionName = (transaction: Transaction) => {
    if (!currentUser) return ''
    // Hiển thị description nếu có, không thì hiển thị "送金" hoặc "受取"
    if (transaction.description) return transaction.description
    return transaction.sender_id === currentUser.id ? '送金' : '受取'
  }

  if (!currentUser) return null

  return (
    <div className='history-page'>
      <div className='history-container'>
        {/* Header */}
        <header className='history-header'>
          <button
            onClick={() => navigate('/home')}
            className='back-btn'
          >
            ← 戻る
          </button>
          <h1>使用履歴</h1>
          <div></div>
        </header>

        {/* Balance Summary */}
        <div className='balance-summary'>
          <p className='balance-label'>残高</p>
          <div className='balance-amount'>
            {currentUser.balance}
            <span>枚</span>
          </div>
        </div>

        {/* Transaction List */}
        <div className='transaction-list'>
          {loading ?
            <div className='loading-state'>
              <div className='spinner'></div>
              <p>読み込み中...</p>
            </div>
          : transactions.length === 0 ?
            <div className='empty-state'>
              <p>取引履歴がありません</p>
            </div>
          : transactions.map((transaction) => (
              <div
                key={transaction.id}
                className='transaction-item'
              >
                <div className='transaction-left'>
                  <div className='transaction-date'>{formatDate(transaction.created_at)}</div>
                  <div className='transaction-name'>{getTransactionName(transaction)}</div>
                </div>
                <div className={`transaction-amount ${getTransactionColor(transaction)}`}>
                  {formatAmount(transaction)}枚
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
