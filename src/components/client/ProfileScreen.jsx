// src/components/client/ProfileScreen.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import AnimatedButton from '../common/AnimatedButton';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import LoginModal from './LoginModal';
import DeleteAccountModal from './DeleteAccountModal';
import toast from 'react-hot-toast';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
  ShoppingBag as OrderIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ArrowForward as ArrowIcon,
  Login as LoginIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import ChangePhoneModal from './ChangePhoneModal';
import api from '../../services/api';

const ProfileScreen = () => {
  const navigate = useNavigate();
  
  const { user, updateUser, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const menuItems = [
    { 
      icon: <OrderIcon />, 
      label: 'Meus Pedidos', 
      onClick: () => navigate('/orders'),
      color: 'var(--secondary)'
    },
    { 
      icon: <HistoryIcon />, 
      label: 'Histórico', 
      onClick: () => navigate('/orders'),
      color: 'var(--info)'
    },
    { 
      icon: theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />,
      label: theme === 'light' ? 'Modo Escuro' : 'Modo Claro',
      onClick: toggleTheme,
      color: 'var(--warning)' 
    },
    { 
      icon: <PhoneIcon />, 
      label: 'Alterar Telefone', 
      onClick: () => setShowPhoneModal(true),
      color: 'var(--text-secondary)'
    },
    { 
      icon: <HelpIcon />, 
      label: 'Ajuda', 
      onClick: () => navigate('/help'),
      color: 'var(--text-secondary)'
    },
  ];

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    toast.success('Bem-vindo!');
  };

  const handlePhoneSuccess = (updatedUser) => {
    updateUser(updatedUser);
    toast.success('Telefone atualizado com sucesso!');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: '80px' }}>
      <h1 style={{
        fontSize: '1.8rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary-light))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Perfil
      </h1>

      {isAuthenticated && user ? (
        // User Info - Logged In
        <>
          <GlassCard style={{ 
            marginBottom: 'var(--spacing-lg)',
            padding: 'var(--spacing-lg)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-md)',
              fontSize: '32px',
              color: 'white',
              boxShadow: '0 4px 20px rgba(21, 101, 192, 0.3)',
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon style={{ fontSize: 40 }} />}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {user?.name || 'Cliente'}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-xs)',
              marginTop: 'var(--spacing-xs)',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}>
              <PhoneIcon style={{ fontSize: 16 }} />
              <span>{user?.phone || 'Telefone não cadastrado'}</span>
            </div>
            {user?.email && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-xs)',
                marginTop: 'var(--spacing-xs)',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}>
                <EmailIcon style={{ fontSize: 16 }} />
                <span>{user.email}</span>
              </div>
            )}
            <div style={{
              marginTop: 'var(--spacing-md)',
              padding: '4px 16px',
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}>
              Cliente
            </div>
          </GlassCard>

          {/* Menu Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={item.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-md)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  width: '100%',
                  color: 'var(--text)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: item.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
                <ArrowIcon style={{ color: 'var(--text-secondary)' }} />
              </motion.button>
            ))}
          </div>

          {/* Botão Excluir Conta - Destacado */}
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAccount}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-md)',
                width: '100%',
                background: 'var(--error)10',
                border: '2px solid var(--error)30',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--error)',
                transition: 'all var(--transition-normal)',
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            >
              <DeleteIcon style={{ fontSize: 20 }} />
              <span>Excluir Conta</span>
              <WarningIcon style={{ fontSize: 18, opacity: 0.7 }} />
            </motion.button>
            <p style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginTop: 'var(--spacing-xs)',
              opacity: 0.5,
            }}>
              Esta ação é irreversível e removerá todos os seus dados
            </p>
          </div>

          {/* Logout Button */}
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <AnimatedButton
              variant="secondary"
              fullWidth
              onClick={handleLogout}
              loading={loading}
              disabled={loading}
              icon={<LogoutIcon />}
            >
              {loading ? 'Saindo...' : 'Sair da Conta'}
            </AnimatedButton>
          </div>
        </>
      ) : (
        // Not Logged In
        <GlassCard style={{ 
          textAlign: 'center',
          padding: 'var(--spacing-xl)',
        }}>
          <PersonIcon style={{ fontSize: 64, color: 'var(--text-secondary)', opacity: 0.3 }} />
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: 600,
            marginTop: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-sm)',
          }}>
            Faça login para acessar
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            Entre com seu telefone para ver seus pedidos e muito mais
          </p>
          <AnimatedButton
            variant="primary"
            onClick={() => setShowLoginModal(true)}
            icon={<LoginIcon />}
          >
            Entrar
          </AnimatedButton>
        </GlassCard>
      )}

      {/* App Info */}
      <div style={{
        marginTop: 'var(--spacing-xl)',
        padding: 'var(--spacing-md)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.75rem',
        borderTop: '1px solid var(--border)',
      }}>
        <p>Delivery Food v1.0.0</p>
        <p style={{ marginTop: 'var(--spacing-xs)' }}>
          © 2024 Delivery Food - Moçambique
        </p>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Change Phone Modal */}
      <ChangePhoneModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        user={user}
        onSuccess={handlePhoneSuccess}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};

export default ProfileScreen;