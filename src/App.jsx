// src/App.jsx//
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ClientApp from './pages/ClientApp';
import DeliveryApp from './pages/DeliveryApp';
import KitchenApp from './pages/KitchenApp';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.userType)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
<Route path="/*" element={<ClientApp />} />
        
                <Route 
          path="/delivery/*" 
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kitchen/*" 
          element={
            <ProtectedRoute allowedRoles={['kitchen']}>
              <KitchenApp />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;