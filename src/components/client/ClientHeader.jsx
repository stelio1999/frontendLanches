// src/components/client/ClientHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import LoginModal from './LoginModal';
import KitchenLogin from '../kitchen/KitchenLogin';
import DeliveryLogin from '../delivery/DeliveryLogin';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Person as PersonIcon,
  ShoppingCart as CartIcon,
  Restaurant as RestaurantIcon,
  DeliveryDining as DeliveryIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import logo from '../../assets/images/logo.png'

const ClientHeader = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showKitchenLogin, setShowKitchenLogin] = useState(false);
  const [showDeliveryLogin, setShowDeliveryLogin] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('delivery'); // 'delivery' ou 'kitchen'
  const [longPressTimer, setLongPressTimer] = useState(null);

  // Cores do tema para efeito de vidro
  const glassColors = {
    dark: {
      background: 'rgba(18, 18, 30, 0.1)',
      border: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px) saturate(180%)',
      text: 'rgba(255, 255, 255, 0.9)',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      iconBg: 'rgba(255, 255, 255, 0.05)',
      iconBorder: 'rgba(255, 255, 255, 0.08)',
      modalBg: 'rgba(18, 18, 30, 0.85)',
      modalSurface: 'rgba(30, 30, 50, 0.1)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(0, 0, 0, 0.06)',
      backdropFilter: 'blur(20px) saturate(180%)',
      text: 'rgba(0, 0, 0, 0.9)',
      textSecondary: 'rgba(0, 0, 0, 0.5)',
      iconBg: 'rgba(0, 0, 0, 0.03)',
      iconBorder: 'rgba(0, 0, 0, 0.06)',
      modalBg: 'rgba(255, 255, 255, 0.85)',
      modalSurface: 'rgba(255, 255, 255, 0.1)',
    }
  };

  const glass = theme === 'dark' ? glassColors.dark : glassColors.light;

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      setShowLoginModal(true);
    }
  };

  // Long press no Profile para abrir modal de roles
  const handleProfileLongPress = () => {
    if (!isAuthenticated) {
      setShowRoleModal(true);
    }
  };

  const handleProfilePressStart = () => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        handleProfileLongPress();
      }, 3000);
      setLongPressTimer(timer);
    }
  };

  const handlePressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleRoleSelect = () => {
    setShowRoleModal(false);
    if (selectedRole === 'delivery') {
      setShowDeliveryLogin(true);
    } else {
      setShowKitchenLogin(true);
    }
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: glass.background,
        backdropFilter: glass.backdropFilter,
        WebkitBackdropFilter: glass.webkitBackdropFilter,
        borderBottom: `1px solid ${glass.border}`,
        padding: '12px 16px',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '480px',
          margin: '0 auto',
        }}>
          {/* Logo com Imagem */}
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <img 
    src={logo} // ou importe a imagem: 
    alt="Delivery Food"
    style={{
      height: '40px',
      width: 'auto',
      cursor: 'pointer',
      objectFit: 'contain',
    }}
    onClick={() => navigate('/')}
  />
</div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Profile com Long Press */}
            <button
              onClick={handleProfileClick}
              onMouseDown={handleProfilePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handleProfilePressStart}
              onTouchEnd={handlePressEnd}
              style={{
                background: isAuthenticated ? 'linear-gradient(135deg, hsl(225, 95%, 56%), hsl(225, 80%, 40%))' : glass.iconBg,
                border: isAuthenticated ? 'none' : `1px solid ${glass.iconBorder}`,
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isAuthenticated ? 'white' : glass.textSecondary,
                transition: 'all 0.3s ease',
                backdropFilter: isAuthenticated ? 'none' : 'blur(10px)',
                WebkitBackdropFilter: isAuthenticated ? 'none' : 'blur(10px)',
                boxShadow: isAuthenticated ? '0 4px 12px rgba(44, 82, 212, 0.3)' : 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isAuthenticated) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAuthenticated) {
                  e.currentTarget.style.background = glass.iconBg;
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              title={!isAuthenticated ? "Pressione por 3 segundos para login delivery/kitchen" : "Perfil"}
            >
              {isAuthenticated && user?.name ? (
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <>
                  <PersonIcon style={{ fontSize: 20 }} />
                  <span style={{
                    position: 'absolute',
                    bottom: -1,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 5,
                    color: glass.textSecondary,
                    opacity: 0.4,
                    letterSpacing: '0.5px',
                  }}>3s</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Seleção de Role (Delivery/Kitchen) */}
      <AnimatePresence>
        {showRoleModal && (
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
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
              }}
              style={{
                background: glass.modalSurface,
                backdropFilter: glass.backdropFilter,
                WebkitBackdropFilter: glass.webkitBackdropFilter,
                width: '90%',
                maxWidth: '380px',
                borderRadius: '24px',
                padding: '32px 24px',
                border: `1px solid ${glass.border}`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                color: glass.text,
                position: 'relative',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowRoleModal(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: `1px solid ${glass.border}`,
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: glass.text,
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

              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '8px',
                textAlign: 'center',
              }}>
                Selecionar Tipo de Login
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: glass.textSecondary,
                textAlign: 'center',
                marginBottom: '24px',
              }}>
                Escolha o tipo de acesso para continuar
              </p>

              {/* Toggle Buttons */}
              <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '24px',
                border: `1px solid ${glass.border}`,
              }}>
                <button
                  onClick={() => setSelectedRole('delivery')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: selectedRole === 'delivery' 
                      ? 'linear-gradient(135deg, hsl(225, 95%, 56%), hsl(225, 80%, 40%))' 
                      : 'transparent',
                    color: selectedRole === 'delivery' ? 'white' : glass.textSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: selectedRole === 'delivery' ? 600 : 400,
                  }}
                >
                  <DeliveryIcon style={{ fontSize: 20 }} />
                  <span>Delivery</span>
                </button>
                <button
                  onClick={() => setSelectedRole('kitchen')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: selectedRole === 'kitchen' 
                      ? 'linear-gradient(135deg, hsl(225, 95%, 56%), hsl(225, 80%, 40%))' 
                      : 'transparent',
                    color: selectedRole === 'kitchen' ? 'white' : glass.textSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: selectedRole === 'kitchen' ? 600 : 400,
                  }}
                >
                  <RestaurantIcon style={{ fontSize: 20 }} />
                  <span>Cozinha</span>
                </button>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleRoleSelect}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, hsl(225, 95%, 56%), hsl(225, 80%, 40%))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(44, 82, 212, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Continuar como {selectedRole === 'delivery' ? 'Delivery' : 'Cozinha'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
      
      <KitchenLogin 
        isOpen={showKitchenLogin} 
        onClose={() => setShowKitchenLogin(false)}
      />
      
      <DeliveryLogin 
        isOpen={showDeliveryLogin} 
        onClose={() => setShowDeliveryLogin(false)}
      />
    </>
  );
};

export default ClientHeader;