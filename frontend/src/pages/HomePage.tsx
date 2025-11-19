import { useEffect, useState } from 'react'

import { QRCodeSVG } from 'qrcode.react'
import Barcode from 'react-barcode'
import { useNavigate } from 'react-router-dom'

import ScannerModal from '../components/ScannerModal'
import TransferModal from '../components/TransferModal'
import { API_BASE_URL } from '../config/api'
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
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [scannedStudentId, setScannedStudentId] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/')
      return
    }
    const localUser = JSON.parse(userStr)
    setUser(localUser)

    // Refresh user data từ API
    const refreshUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${localUser.id}`)
        const data = await response.json()

        if (data.success) {
          const updatedUser = data.user
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    }

    refreshUserData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleScanCode = () => {
    setShowScanner(true)
  }

  const handleScanSuccess = (studentId: string) => {
    setScannedStudentId(studentId)
    setShowScanner(false)
    setShowTransferModal(true)
  }

  const handleTransferSuccess = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
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
            <QRCodeSVG
              value={user.student_id}
              size={200}
              level='H'
            />
          </div>
          <div className='barcode-placeholder'>
            <Barcode
              value={user.student_id}
              height={60}
              width={2}
              displayValue={false}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='action-buttons'>
          <button
            className='action-btn'
            onClick={handleScanCode}
          >
            <div className='btn-icon'>📷</div>
            <span>コード読取</span>
          </button>
          <button
            className='action-btn'
            onClick={() => setShowTransferModal(true)}
          >
            <div className='btn-icon'>💸</div>
            <span>送る・もらう</span>
          </button>
          <button
            className='action-btn'
            onClick={() => navigate('/history')}
          >
            <div className='btn-icon'>🕐</div>
            <span>使用履歴</span>
          </button>
        </div>
      </div>

      {/* Transfer Modal */}
      {user && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false)
            setScannedStudentId('')
          }}
          currentUser={user}
          initialStudentId={scannedStudentId}
          onTransferSuccess={handleTransferSuccess}
        />
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <ScannerModal
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}

export default HomePage
