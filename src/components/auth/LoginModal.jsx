// src/components/auth/LoginModal.jsx//
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import AnimatedButton from '../common/AnimatedButton';
import { Close as CloseIcon, Phone as PhoneIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 9) {
      toast.error('Por favor, insira um número de telefone válido');
      return;
    }

    setLoading(true);
    try {
      const result = await login(phone, name);
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        onSuccess && onSuccess(result.user);
        onClose();
      } else {
        toast.error(result.error || 'Erro ao fazer login');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '10%',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              background: 'var(--surface)',
              width: '100%',
              maxWidth: '400px',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-xl)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: '0 var(--spacing-md)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-lg)',
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                Entrar
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--glass-bg)',
                  border: 'none',
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
                  Número de Telefone *
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
                  <PhoneIcon style={{ color: 'var(--text-secondary)', marginRight: 'var(--spacing-sm)' }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="84 123 4567"
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
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginTop: 'var(--spacing-xs)',
                  display: 'block',
                }}>
                  Exemplo: 841234567
                </span>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--text-secondary)',
                }}>
                  Seu Nome (opcional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  style={{
                    width: '100%',
                    padding: '12px var(--spacing-md)',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    color: 'var(--text)',
                    outline: 'none',
                    transition: 'all var(--transition-normal)',
                  }}
                />
              </div>

              <AnimatedButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </AnimatedButton>

              <p style={{
                textAlign: 'center',
                marginTop: 'var(--spacing-md)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}>
                Ao entrar, você concorda com os termos de uso
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;