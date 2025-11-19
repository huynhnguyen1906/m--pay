import { useEffect, useRef, useState } from 'react'

import { Html5Qrcode } from 'html5-qrcode'

import './ScannerModal.scss'

interface ScannerModalProps {
  onScanSuccess: (studentId: string) => void
  onClose: () => void
}

const ScannerModal = ({ onScanSuccess, onClose }: ScannerModalProps) => {
  const [error, setError] = useState<string>('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isScanning = useRef(false)

  useEffect(() => {
    const startScanner = async () => {
      if (isScanning.current) return

      try {
        const html5QrCode = new Html5Qrcode('qr-reader')
        scannerRef.current = html5QrCode
        isScanning.current = true

        await html5QrCode.start(
          { facingMode: 'environment' }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Successfully scanned
            html5QrCode.stop().then(() => {
              isScanning.current = false
              onScanSuccess(decodedText)
            })
          },
          () => {
            // Scan error (ignore, continues scanning)
          }
        )
      } catch (err) {
        console.error('Scanner error:', err)
        setError('カメラの起動に失敗しました。カメラの権限を確認してください。')
        isScanning.current = false
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current
          .stop()
          .then(() => {
            isScanning.current = false
          })
          .catch((err) => console.error('Error stopping scanner:', err))
      }
    }
  }, [onScanSuccess])

  const handleClose = () => {
    if (scannerRef.current && isScanning.current) {
      scannerRef.current
        .stop()
        .then(() => {
          isScanning.current = false
          onClose()
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err)
          onClose()
        })
    } else {
      onClose()
    }
  }

  return (
    <div
      className='modal-overlay'
      onClick={handleClose}
    >
      <div
        className='modal-content scanner-modal'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='scanner-header'>
          <h2>QR・バーコードを読み取る</h2>
          <button
            className='close-btn'
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <div className='scanner-body'>
          {error ?
            <div className='error-message'>{error}</div>
          : <>
              <div id='qr-reader' />
              <p className='scanner-instruction'>QRコードまたはバーコードをカメラに向けてください</p>
            </>
          }
        </div>
      </div>
    </div>
  )
}

export default ScannerModal
