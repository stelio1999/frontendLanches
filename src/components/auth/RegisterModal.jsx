// src/components/auth/RegisterModal.jsx//
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import AnimatedButton from '../common/AnimatedButton';
import { Close as CloseIcon, Person as PersonIcon, Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

const RegisterModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { loginWithPassword } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone || formData.phone.length < 9) {
      toast.error('Número de telefone inválido');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Primeiro registra, depois faz login
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: 'client'
      });

      if (response.data.success) {
        // Login automático
        const loginResult = await loginWithPassword(formData.phone, formData.password);
        if (loginResult.success) {
          toast.success('Cadastro realizado com sucesso!');
          onSuccess && onSuccess(loginResult.user);
          onClose();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar');
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
              width: '100%',
              maxWidth: '400px',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-xl)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
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
                Criar Conta
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
                  Nome Completo *
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
                  <PersonIcon style={{ color: 'var(--text-secondary)', marginRight: 'var(--spacing-sm)' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
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
                  Email
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '1rem',
                      color: 'var(--text)',
                      outline: 'none',
                    }}
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
                  Telefone *
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
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

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--text-secondary)',
                }}>
                  Confirmar Senha *
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
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirme sua senha"
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

              <AnimatedButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Criar Conta'}
              </AnimatedButton>

              <p style={{
                textAlign: 'center',
                marginTop: 'var(--spacing-md)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}>
                Ao criar uma conta, você concorda com os termos de uso
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterModal;