// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ClientApp from './pages/ClientApp';
import DeliveryApp from './pages/DeliveryApp';
import KitchenApp from './pages/KitchenApp';

const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid var(--border)',
      borderTopColor: 'var(--secondary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
      Carregando...
    </p>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.userType)) {
    if (user?.userType === 'client') {
      return <Navigate to="/" replace />;
    } else if (user?.userType === 'kitchen') {
      return <Navigate to="/kitchen" replace />;
    } else if (user?.userType === 'delivery') {
      return <Navigate to="/delivery" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Rotas da Cozinha */}
      <Route 
        path="/kitchen/*" 
        element={
          <ProtectedRoute allowedRoles={['kitchen']}>
            <KitchenApp />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas do Delivery */}
      <Route 
        path="/delivery/*" 
        element={
          <ProtectedRoute allowedRoles={['delivery']}>
            <DeliveryApp />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas do Cliente */}
      <Route path="/*" element={
        isAuthenticated && user?.userType !== 'client' ? (
          user?.userType === 'kitchen' ? <Navigate to="/kitchen" replace /> :
          user?.userType === 'delivery' ? <Navigate to="/delivery" replace /> :
          <ClientApp />
        ) : (
          <ClientApp />
        )
      } />
    </Routes>
  );
}

export default App;