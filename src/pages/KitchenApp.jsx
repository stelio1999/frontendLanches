// src/pages/KitchenApp.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import KitchenHeader from '../components/kitchen/KitchenHeader';
import KitchenDashboard from '../components/kitchen/KitchenDashboard';
import OrderDetailModal from '../components/kitchen/OrderDetailModal';
import ProductManagement from '../components/kitchen/ProductManagement';
import SecuritySettings from '../components/kitchen/SecuritySettings';
import OrderHistory from '../components/kitchen/OrderHistory';
import BottomNavigation from '../components/common/BottomNavigation';
import toast from 'react-hot-toast';

const KitchenApp = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { on, off } = useSocket();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Proteção extra: verificar se o usuário é realmente da cozinha
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.userType !== 'kitchen')) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  useEffect(() => {
    const handleNewOrder = (data) => {
      toast.success(`🆕 Novo pedido #${data.orderNumber}`);
    };

    const handlePaymentProof = (data) => {
      toast.info(`📷 Comprovativo recebido para pedido #${data.orderNumber}`);
    };

    on('new_order', handleNewOrder);
    on('payment_proof_submitted', handlePaymentProof);

    return () => {
      off('new_order', handleNewOrder);
      off('payment_proof_submitted', handlePaymentProof);
    };
  }, [on, off]);

  // Enquanto estiver carregando, não renderizar
  if (loading) {
    return null;
  }

  // Se não for kitchen, não renderizar
  if (!isAuthenticated || user?.userType !== 'kitchen') {
    return null;
  }

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleCloseDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      <KitchenHeader />
      
      <Routes>
        <Route path="/" element={<KitchenDashboard onOrderClick={handleOrderClick} />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/history" element={<OrderHistory />} />
        <Route path="/security" element={<SecuritySettings />} />
      </Routes>

      {showOrderDetail && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content bottom" onClick={e => e.stopPropagation()}>
            <OrderDetailModal 
              order={selectedOrder} 
              onClose={handleCloseDetail}
            />
          </div>
        </div>
      )}

      <BottomNavigation userType="kitchen" />
    </div>
  );
};

export default KitchenApp;