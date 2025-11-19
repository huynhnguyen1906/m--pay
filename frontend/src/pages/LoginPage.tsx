import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import './LoginPage.scss'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/home')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('サーバーに接続できません')
      console.log(err)
    }
  }

  return (
    <div className='login-page'>
      <div className='login-container'>
        <div className='login-header'>
          <h1>
            M$<span>PAY</span>
          </h1>
          <p>学校内部送金システム</p>
        </div>

        <form
          onSubmit={handleLogin}
          className='login-form'
        >
          <div className='form-group'>
            <label htmlFor='username'>学生番号 / ユーザー名</label>
            <input
              type='text'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='学生番号またはユーザー名を入力'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>パスワード</label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='パスワードを入力'
              required
            />
          </div>

          {error && <div className='error-message'>{error}</div>}

          <button
            type='submit'
            className='login-button'
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
