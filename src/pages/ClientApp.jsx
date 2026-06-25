// src/pages/ClientApp.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from '../components/client/LoginModal';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useSocket } from '../hooks/useSocket';
import ClientHeader from '../components/client/ClientHeader';
import WelcomeScreen from '../components/client/WelcomeScreen';
import MenuScreen from '../components/client/MenuScreen';
import ProfileScreen from '../components/client/ProfileScreen';
import CartModal from '../components/client/CartModal';
import PaymentModal from '../components/client/PaymentModal';
import OrderTracking from '../components/client/OrderTracking';
import BottomNavigation from '../components/common/BottomNavigation';
import { 
  ShoppingCart as CartIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import SettingsScreen from '../components/client/SettingsScreen';
const ClientApp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { on, off } = useSocket();
  const { theme } = useTheme();
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showLogin, setShowLogin] = useState(false);

  // Cores do tema para efeito de vidro
  const glassColors = {
    dark: {
      background: 'rgba(18, 18, 30, 0.1)',
      surface: 'rgba(30, 30, 50, 0.75)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 -8px 32px rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(20px) saturate(180%)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      surface: 'rgba(255, 255, 255, 0.75)',
      border: 'rgba(255, 255, 255, 0.3)',
      shadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
      backdropFilter: 'blur(20px) saturate(180%)',
      text: '#1a1a2e',
      textSecondary: 'rgba(0, 0, 0, 0.5)',
    }
  };

  const glass = theme === 'dark' ? glassColors.dark : glassColors.light;

  useEffect(() => {
    // Listen for order status updates
    const handleOrderUpdate = (data) => {
      toast.success(`Pedido #${data.orderNumber}: ${data.status}`);
      setNotifications(prev => [{
        id: Date.now(),
        ...data,
        read: false,
        timestamp: new Date().toISOString()
      }, ...prev]);
    };

    on('order_status_update', handleOrderUpdate);
    on('payment_verification', (data) => {
      toast.success(data.message);
    });

    return () => {
      off('order_status_update', handleOrderUpdate);
      off('payment_verification');
    };
  }, [on, off]);

  const handleOpenCart = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setShowCart(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowCart(true);
  };

  const handleProceedToPayment = (order) => {
    setCurrentOrder(order);
    setShowCart(false);
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setCurrentOrder(null);
    toast.success('Pedido realizado com sucesso!');
    navigate('/orders');
  };

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      <ClientHeader />
      
      <Routes>

<Route path="/settings" element={<SettingsScreen />} /> 
 
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/menu" element={<MenuScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/orders" element={<OrderTracking />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />
        <Route path="/cart" element={
          <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700,
              marginBottom: 'var(--spacing-lg)',
            }}>
              Meu Carrinho
            </h2>
            <CartModal onProceed={handleProceedToPayment} />
          </div>
        } />
      </Routes>

      {/* Floating Cart Button - com efeito de vidro */}
      {totalItems > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpenCart}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(225, 95%, 56%), hsl(225, 80%, 40%))',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(44, 82, 212, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <CartIcon style={{ fontSize: 28 }} />
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'hsl(0, 84%, 60%)',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}>
            {totalItems}
          </span>
        </motion.button>
      )}

      {/* Cart Modal - com efeito de vidro */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 200,
                mass: 0.8,
              }}
              style={{
                background: glass.surface,
                backdropFilter: glass.backdropFilter,
                WebkitBackdropFilter: glass.webkitBackdropFilter,
                width: '100%',
                maxWidth: '480px',
                maxHeight: '85vh',
                borderRadius: '32px 32px 0 0',
                overflow: 'hidden',
                borderTop: `1px solid ${glass.border}`,
                boxShadow: glass.shadow,
                display: 'flex',
                flexDirection: 'column',
                color: glass.text,
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div style={{
                width: '40px',
                height: '4px',
                background: glass.border,
                borderRadius: '4px',
                margin: '12px auto',
                cursor: 'grab',
                flexShrink: 0,
              }} />
              
               
              
              <div style={{ 
                padding: '0 24px 24px',
                flex: 1,
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="hide-scrollbar"
              >
                <CartModal 
                  onProceed={handleProceedToPayment} 
                  onClose={() => setShowCart(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal - com efeito de vidro */}
      <AnimatePresence>
        {showPayment && currentOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 200,
                mass: 0.8,
              }}
              style={{
                background: glass.surface,
                backdropFilter: glass.backdropFilter,
                WebkitBackdropFilter: glass.webkitBackdropFilter,
                width: '100%',
                maxWidth: '480px',
                maxHeight: '85vh',
                borderRadius: '32px 32px 0 0',
                overflow: 'hidden',
                borderTop: `1px solid ${glass.border}`,
                boxShadow: glass.shadow,
                display: 'flex',
                flexDirection: 'column',
                color: glass.text,
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div style={{
                width: '40px',
                height: '4px',
                background: glass.border,
                borderRadius: '4px',
                margin: '12px auto',
                cursor: 'grab',
                flexShrink: 0,
              }} />
              
              {/* Close Button - com efeito de vidro */}
              <button
                onClick={() => setShowPayment(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: `1px solid ${glass.border}`,
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: glass.text,
                  zIndex: 10,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
              
              <div style={{ 
                padding: '0 24px 24px',
                flex: 1,
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="hide-scrollbar"
              >
                <PaymentModal 
                  order={currentOrder} 
                  onComplete={handlePaymentComplete}
                  onClose={() => setShowPayment(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavigation userType="client" />
      
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
      
      {/* Estilos para esconder scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ClientApp;