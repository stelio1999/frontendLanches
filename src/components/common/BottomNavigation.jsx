// src/components/common/BottomNavigation.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon,
  ShoppingBag as ShoppingBagIcon,
  Person as PersonIcon,
  Map as MapIcon,
  History as HistoryIcon,
  QrCodeScanner as ScanIcon,
  Settings as SettingsIcon,
  Restaurant as RestaurantIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const BottomNavigation = ({ userType = 'client' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Efeito para esconder/mostrar a barra ao rolar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Cores baseadas no tema com efeito de vidro
  const themeColors = {
    dark: {
      background: 'rgba(18, 18, 30, 0.1)',
      text: 'rgba(255, 255, 255, 0.6)',
      textActive: 'rgba(255, 255, 255, 1)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      border: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px) saturate(180%)',
      webkitBackdropFilter: 'blur(20px) saturate(180%)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      text: 'rgba(0, 0, 0, 0.5)',
      textActive: 'rgba(0, 0, 0, 0.9)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      border: 'rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(20px) saturate(180%)',
      webkitBackdropFilter: 'blur(20px) saturate(180%)',
    }
  };

  const colors = theme === 'dark' ? themeColors.dark : themeColors.light;

  const getItems = () => {
    switch(userType) {
      case 'client':
        return [
          { icon: HomeIcon, label: 'Início', path: '/' },
          { icon: ShoppingBagIcon, label: 'Menu', path: '/menu' },
          { icon: ReceiptIcon, label: 'Pedidos', path: '/orders' },
          { icon: PersonIcon, label: 'Perfil', path: '/profile' },
        ];
      case 'delivery':
        return [
          { icon: HomeIcon, label: 'Dashboard', path: '/delivery' },
          { icon: MapIcon, label: 'Mapa', path: '/delivery/map' },
          { icon: ShoppingBagIcon, label: 'Pedidos', path: '/delivery/orders' },
          { icon: ScanIcon, label: 'Scan', path: '/delivery/scan' },
        ];
      case 'kitchen':
        return [
          { icon: HomeIcon, label: 'Dashboard', path: '/kitchen' },
          { icon: RestaurantIcon, label: 'Produtos', path: '/kitchen/products' },
          { icon: HistoryIcon, label: 'Histórico', path: '/kitchen/history' },
          { icon: SettingsIcon, label: 'Config', path: '/kitchen/security' },
        ];
      default:
        return [];
    }
  };

  const items = getItems();

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: 0,
      right: 0,
      background: colors.background,
      backdropFilter: colors.backdropFilter,
      WebkitBackdropFilter: colors.webkitBackdropFilter,
      width: '88%',
      maxWidth: '480px',
      margin: '0 auto',
      boxShadow: colors.shadow,
      padding: '0.75rem 1rem',
      borderRadius: '4rem',
      zIndex: 100,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isVisible ? 'translateY(0)' : 'translateY(calc(100% + 2rem))',
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? colors.textActive : colors.text,
                transition: 'all 0.3s ease',
                position: 'relative',
                padding: '4px 12px',
                minWidth: '56px',
                height: 'auto',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = colors.textActive;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = colors.text;
                }
              }}
            >
              <item.icon style={{ 
                fontSize: '1.5rem',
                transition: 'transform 0.3s ease',
              }} />
              <span style={{
                fontSize: '0.625rem',
                marginTop: '2px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.3s ease',
                letterSpacing: '0.3px',
              }}>
                {item.label}
              </span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: 'hsl(225, 95%, 56%)',
                  boxShadow: '0 0 8px rgba(44, 82, 212, 0.4)',
                }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;