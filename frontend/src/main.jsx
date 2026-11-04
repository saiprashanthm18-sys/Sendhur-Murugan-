import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e3a5f',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '14px'
              },
              success: {
                style: { background: '#065f46', color: '#fff' },
                iconTheme: { primary: '#6ee7b7', secondary: '#065f46' }
              },
              error: {
                style: { background: '#7f1d1d', color: '#fff' },
                iconTheme: { primary: '#fca5a5', secondary: '#7f1d1d' }
              }
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
