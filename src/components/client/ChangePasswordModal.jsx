// src/components/client/ChangePasswordModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Close as CloseIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import AnimatedButton from '../common/AnimatedButton';
import GlassCard from '../common/GlassCard';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ChangePasswordModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const hasPassword = user?.hasPassword || false;

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('A senha deve ter pelo menos 6 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }
    return errors;
  };

  const handleSubmit = async () => {
    setErrors({});

    // Validar nova senha
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setErrors({ newPassword: passwordErrors });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: ['As senhas não coincidem'] });
      return;
    }

    // Se o usuário já tem senha, validar a senha atual
    if (hasPassword && !currentPassword) {
      setErrors({ currentPassword: ['A senha atual é obrigatória'] });
      return;
    }

    setLoading(true);
    try {
     const payload = {
  newPassword,
  ...(hasPassword && currentPassword ? { currentPassword } : {})
};

      const response = await api.put('/auth/change-password', payload);
      
      if (response.data.success) {
        toast.success(hasPassword ? 'Senha alterada com sucesso!' : 'Senha criada com sucesso!');
        onSuccess && onSuccess();
        onClose();
        // Limpar campos
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      const errorMsg = error.response?.data?.error || 'Erro ao alterar senha';
      if (error.response?.status === 401) {
        setErrors({ currentPassword: ['Senha atual incorreta'] });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: 'Fraca', color: 'var(--error)' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { label: 'Muito Fraca', color: 'var(--error)' },
      { label: 'Fraca', color: 'var(--error)' },
      { label: 'Média', color: 'var(--warning)' },
      { label: 'Boa', color: 'var(--info)' },
      { label: 'Forte', color: 'var(--success)' },
      { label: 'Muito Forte', color: 'var(--success)' },
    ];

    return levels[Math.min(score, 5)];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={onClose}
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
              background: 'var(--surface)',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              overflow: 'hidden',
              borderTop: '1px solid var(--border)',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div style={{
              width: '40px',
              height: '4px',
              background: 'var(--border)',
              borderRadius: 'var(--radius-full)',
              margin: '12px auto 0',
              flexShrink: 0,
              cursor: 'grab',
            }} />

            {/* Header com gradiente */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              margin: '0 -24px 20px -24px',
              padding: '20px 24px 16px 24px',
              borderRadius: '0 0 30px 30px',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%',
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '80px',
                height: '80px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <h2 style={{
                      color: 'white',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      marginBottom: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <LockIcon style={{ fontSize: 24 }} />
                      {hasPassword ? 'Alterar Senha' : 'Criar Senha'}
                    </h2>
                    <p style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.85rem',
                    }}>
                      {hasPassword 
                        ? 'Digite sua senha atual e a nova senha' 
                        : 'Crie uma senha para proteger sua conta'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CloseIcon style={{ fontSize: 20 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{
              padding: '0 20px 20px',
              flex: 1,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="hide-scrollbar"
            >
              {/* Aviso se não tiver senha */}
              {!hasPassword && (
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--warning)15',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--warning)30',
                  marginBottom: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}>
                  <WarningIcon style={{ fontSize: 20, color: 'var(--warning)', marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 600 }}>
                      Atenção!
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Ao criar uma senha, você só poderá fazer login utilizando ela. 
                      O login com telefone será desativado.
                    </p>
                  </div>
                </div>
              )}

              {/* Senha Atual - apenas se já tiver senha */}
              {hasPassword && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    marginBottom: 'var(--spacing-xs)',
                    color: 'var(--text-secondary)',
                  }}>
                    Senha Atual *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--glass-bg)',
                    border: errors.currentPassword ? '2px solid var(--error)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0 12px',
                    transition: 'all 0.3s ease',
                  }}>
                    <LockIcon style={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                      style={{
                        flex: 1,
                        padding: '14px 12px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.95rem',
                        color: 'var(--text)',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        padding: '4px',
                      }}
                    >
                      {showCurrentPassword ? <VisibilityOffIcon style={{ fontSize: 20 }} /> : <VisibilityIcon style={{ fontSize: 20 }} />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '4px' }}>
                      {errors.currentPassword[0]}
                    </p>
                  )}
                </div>
              )}

              {/* Nova Senha */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--text-secondary)',
                }}>
                  {hasPassword ? 'Nova Senha' : 'Senha'} *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--glass-bg)',
                  border: errors.newPassword ? '2px solid var(--error)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 12px',
                  transition: 'all 0.3s ease',
                }}>
                  <LockIcon style={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors({});
                    }}
                    placeholder="Digite sua nova senha"
                    style={{
                      flex: 1,
                      padding: '14px 12px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.95rem',
                      color: 'var(--text)',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: '4px',
                    }}
                  >
                    {showNewPassword ? <VisibilityOffIcon style={{ fontSize: 20 }} /> : <VisibilityIcon style={{ fontSize: 20 }} />}
                  </button>
                </div>

                {/* Força da senha */}
                {newPassword && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <div style={{
                        flex: 1,
                        height: '4px',
                        background: 'var(--border)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${(getPasswordStrength(newPassword).level / 5) * 100}%`,
                          height: '100%',
                          background: getPasswordStrength(newPassword).color,
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        color: getPasswordStrength(newPassword).color,
                        fontWeight: 600,
                        minWidth: '60px',
                        textAlign: 'right',
                      }}>
                        {getPasswordStrength(newPassword).label}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                    }}>
                      Mínimo 6 caracteres, com letras maiúsculas, minúsculas e números
                    </p>
                  </div>
                )}

                {errors.newPassword && (
                  <div style={{ marginTop: '4px' }}>
                    {errors.newPassword.map((err, index) => (
                      <p key={index} style={{ fontSize: '0.8rem', color: 'var(--error)' }}>
                        • {err}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
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
                  border: errors.confirmPassword ? '2px solid var(--error)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 12px',
                  transition: 'all 0.3s ease',
                }}>
                  <LockIcon style={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({});
                    }}
                    placeholder="Confirme sua nova senha"
                    style={{
                      flex: 1,
                      padding: '14px 12px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.95rem',
                      color: 'var(--text)',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: '4px',
                    }}
                  >
                    {showConfirmPassword ? <VisibilityOffIcon style={{ fontSize: 20 }} /> : <VisibilityIcon style={{ fontSize: 20 }} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '4px' }}>
                    {errors.confirmPassword[0]}
                  </p>
                )}
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                  }}
                >
                  Cancelar
                </button>
                <AnimatedButton
                  variant="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  icon={<CheckIcon />}
                  style={{ flex: 2 }}
                >
                  {hasPassword ? 'Alterar Senha' : 'Criar Senha'}
                </AnimatedButton>
              </div>
            </div>

            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChangePasswordModal;