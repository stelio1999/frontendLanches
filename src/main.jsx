// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // ← ADICIONAR
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <CartProvider>
              <App />
              <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid var(--border)',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);