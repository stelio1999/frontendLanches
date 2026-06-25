// src/components/client/LoginModal.jsx//
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import AnimatedButton from '../common/AnimatedButton';
import GlassCard from '../common/GlassCard';
import { 
  Close as CloseIcon, 
  Phone as PhoneIcon, 
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState('phone'); // 'phone' | 'password'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithPassword } = useAuth();

  const handlePhoneLogin = async (e) => {
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

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    
    const identifier = email || phone;
    if (!identifier || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPassword(identifier, password);
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
            WebkitBackdropFilter: 'blur(8px)',
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
              border: '1px solid var(--border)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-lg)',
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  Entrar
                </h2>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-secondary)',
                  marginTop: 'var(--spacing-xs)',
                }}>
                  {mode === 'phone' ? 'Entre com seu telefone' : 'Entre com email e senha'}
                </p>
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

            {/* Mode Toggle */}
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-lg)',
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              border: '1px solid var(--border)',
            }}>
              <button
                onClick={() => setMode('phone')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'phone' 
                    ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                    : 'transparent',
                  color: mode === 'phone' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: mode === 'phone' ? 600 : 400,
                  transition: 'all var(--transition-normal)',
                  fontSize: '0.85rem',
                }}
              >
                <PhoneIcon style={{ fontSize: 16, marginRight: 'var(--spacing-xs)' }} />
                Telefone
              </button>
              <button
                onClick={() => setMode('password')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'password' 
                    ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                    : 'transparent',
                  color: mode === 'password' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: mode === 'password' ? 600 : 400,
                  transition: 'all var(--transition-normal)',
                  fontSize: '0.85rem',
                }}
              >
                <LockIcon style={{ fontSize: 16, marginRight: 'var(--spacing-xs)' }} />
                Senha
              </button>
            </div>

            {mode === 'phone' ? (
              <form onSubmit={handlePhoneLogin}>
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                  {loading ? 'Entrando...' : 'Entrar com Telefone'}
                </AnimatedButton>
              </form>
            ) : (
              <form onSubmit={handlePasswordLogin}>
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    marginBottom: 'var(--spacing-xs)',
                    color: 'var(--text-secondary)',
                  }}>
                    Email ou Telefone *
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
                      type="text"
                      value={email || phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.includes('@')) {
                          setEmail(value);
                          setPhone('');
                        } else {
                          setPhone(value.replace(/\D/g, ''));
                          setEmail('');
                        }
                      }}
                      placeholder="seu@email.com ou telefone"
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
                  </div>
                </div>

                <AnimatedButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar com Senha'}
                </AnimatedButton>
              </form>
            )}

            <p style={{
              textAlign: 'center',
              marginTop: 'var(--spacing-md)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}>
              Ao entrar, você concorda com os termos de uso
            </p>

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
                <strong>Clientes:</strong> Use o login com telefone para acesso rápido
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;