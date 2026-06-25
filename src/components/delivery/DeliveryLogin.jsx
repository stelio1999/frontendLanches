// src/components/delivery/DeliveryLogin.jsx//
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import AnimatedButton from '../common/AnimatedButton';
import { useAuth } from '../../hooks/useAuth';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DeliveryDining as DeliveryIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const DeliveryLogin = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { loginWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (attempts >= 3) {
      setIsLocked(true);
      setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 30000);
    }
  }, [attempts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error('Conta temporariamente bloqueada. Aguarde 30 segundos.');
      return;
    }

    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPassword(email, password);
      if (result.success) {
        if (result.user.userType !== 'delivery') {
          toast.error('Acesso negado. Esta conta não é de delivery.');
          return;
        }
        toast.success('Login realizado com sucesso!');
        onClose && onClose();
        navigate('/delivery');
      } else {
        setAttempts(prev => prev + 1);
        toast.error(result.error || 'Credenciais inválidas');
      }
    } catch (error) {
      setAttempts(prev => prev + 1);
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-md)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-xl)',
          maxWidth: '400px',
          width: '100%',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
          }}>
            <DeliveryIcon style={{ fontSize: 32, color: 'var(--secondary)' }} />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                Delivery Login
              </h2>
              <p style={{ 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
              }}>
                Acesso para entregadores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text)',
              transition: 'all var(--transition-normal)',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-secondary)',
            }}>
              Email *
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 var(--spacing-md)',
              transition: 'all var(--transition-normal)',
            }}>
              <EmailIcon style={{ color: 'var(--text-secondary)', marginRight: 'var(--spacing-sm)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="delivery@email.com"
                style={{
                  flex: 1,
                  padding: '12px 0',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1rem',
                  color: 'var(--text)',
                  outline: 'none',
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-secondary)',
            }}>
              Senha *
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 var(--spacing-md)',
              transition: 'all var(--transition-normal)',
            }}>
              <LockIcon style={{ color: 'var(--text-secondary)', marginRight: 'var(--spacing-sm)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                style={{
                  flex: 1,
                  padding: '12px 0',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1rem',
                  color: 'var(--text)',
                  outline: 'none',
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 'var(--spacing-xs)',
                }}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
            </div>
          </div>

          {isLocked && (
            <div style={{
              padding: 'var(--spacing-sm)',
              background: 'var(--error)20',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--spacing-md)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--error)',
            }}>
              ⚠️ Conta bloqueada temporariamente. Aguarde 30 segundos.
            </div>
          )}

          <AnimatedButton
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading || isLocked}
            icon={<DeliveryIcon />}
          >
            {loading ? 'Entrando...' : 'Entrar como Delivery'}
          </AnimatedButton>

          <div style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}>
              <strong>Dica:</strong> Mantenha pressionado o ícone de delivery por 3 segundos no menu principal para acessar esta tela
            </p>
          </div>

          <div style={{
            marginTop: 'var(--spacing-md)',
            textAlign: 'center',
          }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                // Abrir modal de registro ou redirecionar
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--secondary)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              Não tem conta? Entre em contato com o administrador
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DeliveryLogin;