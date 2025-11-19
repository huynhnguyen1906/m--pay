import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import './HomePage.scss'

interface User {
  id: number
  student_id: string
  username: string
  name: string
  email: string
  balance: number
}

function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/')
      return
    }
    setUser(JSON.parse(userStr))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  if (!user) return null

  return (
    <div className='home-page'>
      <div className='home-container'>
        {/* Header */}
        <header className='home-header'>
          <div className='header-content'>
            <h1>
              M$<span>PAY</span>
            </h1>
            <button
              onClick={handleLogout}
              className='logout-btn'
            >
              ログアウト
            </button>
          </div>
        </header>

        {/* User Info Card */}
        <div className='user-card'>
          <div className='user-info'>
            <div className='user-avatar'>{user.name.charAt(0)}</div>
            <div className='user-details'>
              <h2>{user.name}</h2>
              <p>ID: {user.student_id}</p>
            </div>
          </div>
          <div className='balance-section'>
            <p className='balance-label'>所持枚</p>
            <div className='balance-amount'>
              <span className='amount'>{user.balance}</span>
              <span className='unit'>枚</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className='qr-section'>
          <div className='qr-placeholder'>
            {/* Placeholder cho QR Code - sẽ implement sau */}
            <div className='qr-text'>QR Code</div>
          </div>
          <div className='barcode-placeholder'>
            {/* Placeholder cho Barcode - sẽ implement sau */}
            <div className='barcode-text'>Barcode</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='action-buttons'>
          <button className='action-btn'>
            <div className='btn-icon'>📷</div>
            <span>コード読取</span>
          </button>
          <button className='action-btn'>
            <div className='btn-icon'>💸</div>
            <span>送る・もらう</span>
          </button>
          <button className='action-btn'>
            <div className='btn-icon'>🕐</div>
            <span>使用履歴</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
