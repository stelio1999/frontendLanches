// src/components/delivery/DeliveryHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Person as PersonIcon,
  DeliveryDining as DeliveryIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const DeliveryHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Cores do tema para efeito de vidro
  const glassColors = {
    dark: {
      background: 'rgba(18, 18, 30, 0.85)',
      border: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px) saturate(180%)',
      text: 'rgba(255, 255, 255, 0.9)',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      iconBg: 'rgba(255, 255, 255, 0.05)',
      iconBorder: 'rgba(255, 255, 255, 0.08)',
      modalBg: 'rgba(18, 18, 30, 0.85)',
      modalSurface: 'rgba(30, 30, 50, 0.75)',
      shadow: '0 8px 32px rgba(0,0,0,0.4)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(0, 0, 0, 0.06)',
      backdropFilter: 'blur(20px) saturate(180%)',
      text: 'rgba(0, 0, 0, 0.9)',
      textSecondary: 'rgba(0, 0, 0, 0.5)',
      iconBg: 'rgba(0, 0, 0, 0.03)',
      iconBorder: 'rgba(0, 0, 0, 0.06)',
      modalBg: 'rgba(255, 255, 255, 0.85)',
      modalSurface: 'rgba(255, 255, 255, 0.75)',
      shadow: '0 8px 32px rgba(0,0,0,0.1)',
    }
  };

  const glass = theme === 'dark' ? glassColors.dark : glassColors.light;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
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
        boxShadow: glass.shadow,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '480px',
          margin: '0 auto',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/delivery')}
            >
              <DeliveryIcon style={{ 
                fontSize: 24, 
                color: 'hsl(225, 95%, 56%)',
              }} />
              <span style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, hsl(225, 95%, 56%), hsl(225, 80%, 40%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              }}>
                Delivery
              </span>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                background: 'linear-gradient(135deg, hsl(225, 95%, 56%), hsl(225, 80%, 40%))',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 600,
              }}>
                ENTREGADOR
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Notifications */}
            <button
              onClick={handleNotificationsClick}
              style={{
                background: glass.iconBg,
                border: `1px solid ${glass.iconBorder}`,
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: glass.textSecondary,
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              <NotificationsIcon style={{ fontSize: 20 }} />
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'hsl(0, 80%, 56%)',
                border: `2px solid ${glass.background}`,
              }} />
            </button>

            {/* Profile */}
            <button
              onClick={handleProfileClick}
              style={{
                background: 'linear-gradient(135deg, hsl(225, 95%, 56%), hsl(225, 80%, 40%))',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(44, 82, 212, 0.3)',
              }}
            >
              {user?.name ? (
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <PersonIcon style={{ fontSize: 20 }} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Profile Menu Dropdown */}
      <AnimatePresence>
        {showProfileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '72px',
              right: '16px',
              zIndex: 200,
              background: glass.modalSurface,
              backdropFilter: glass.backdropFilter,
              WebkitBackdropFilter: glass.webkitBackdropFilter,
              borderRadius: '16px',
              padding: '8px',
              minWidth: '200px',
              border: `1px solid ${glass.border}`,
              boxShadow: glass.shadow,
              color: glass.text,
            }}
          >
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${glass.border}`,
            }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {user?.name || 'Entregador'}
              </p>
              <p style={{ fontSize: '0.75rem', color: glass.textSecondary }}>
                {user?.email || 'delivery@delivery.com'}
              </p>
            </div>

            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate('/delivery');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                width: '100%',
                background: 'none',
                border: 'none',
                borderRadius: '10px',
                color: glass.text,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <DeliveryIcon style={{ fontSize: 20, color: glass.textSecondary }} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate('/delivery/map');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                width: '100%',
                background: 'none',
                border: 'none',
                borderRadius: '10px',
                color: glass.text,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <SettingsIcon style={{ fontSize: 20, color: glass.textSecondary }} />
              <span>Mapa</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                width: '100%',
                background: 'none',
                border: 'none',
                borderRadius: '10px',
                color: 'hsl(0, 80%, 56%)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '4px',
                borderTop: `1px solid ${glass.border}`,
                paddingTop: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <LogoutIcon style={{ fontSize: 20 }} />
              <span>Sair</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeliveryHeader;