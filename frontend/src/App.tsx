import { BrowserRouter, Route, Routes } from 'react-router-dom'

import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import TransferPage from './pages/TransferPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={<LoginPage />}
        />
        <Route
          path='/home'
          element={<HomePage />}
        />
        <Route
          path='/transfer'
          element={<TransferPage />}
        />
        <Route
          path='/history'
          element={<HistoryPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
