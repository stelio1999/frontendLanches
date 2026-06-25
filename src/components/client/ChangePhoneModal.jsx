// src/components/client/ChangePhoneModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Close as CloseIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ChangePhoneModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [phone, setPhone] = useState(user?.phone || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    const pattern = /^(8|84|85|82|83|86|87)\d{8}$/;
    return pattern.test(cleaned);
  };

  const handleSendCode = async () => {
    setError('');

    if (!phone || phone.length < 9) {
      setError('Por favor, insira um número de telefone válido');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Número de telefone inválido. Use o formato 841234567');
      return;
    }

    if (phone === user?.phone) {
      setError('O novo telefone deve ser diferente do atual');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/send-verification-code', { phone });
      if (response.data.success) {
        setCodeSent(true);
        setStep('verify');
        toast.success('Código de verificação enviado!');
        // Iniciar timer de 60 segundos
        setTimer(60);
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao enviar código:', error);
      setError(error.response?.data?.error || 'Erro ao enviar código de verificação');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');

    if (!verificationCode || verificationCode.length < 4) {
      setError('Por favor, insira o código de verificação');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/change-phone', {
        phone,
        verificationCode
      });
      
      if (response.data.success) {
        toast.success('Telefone alterado com sucesso!');
        onSuccess && onSuccess(response.data.user);
        onClose();
        // Resetar estados
        setStep('phone');
        setVerificationCode('');
        setCodeSent(false);
        setTimer(0);
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      setError(error.response?.data?.error || 'Código de verificação inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    if (timer > 0) return;
    handleSendCode();
  };

  const handleClose = () => {
    onClose();
    // Resetar estados
    setTimeout(() => {
      setStep('phone');
      setVerificationCode('');
      setCodeSent(false);
      setTimer(0);
      setError('');
    }, 300);
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
          onClick={handleClose}
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
              maxHeight: '85vh',
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
                      <PhoneIcon style={{ fontSize: 24 }} />
                      {step === 'phone' ? 'Alterar Telefone' : 'Verificar Código'}
                    </h2>
                    <p style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.85rem',
                    }}>
                      {step === 'phone' 
                        ? 'Digite seu novo número de telefone' 
                        : 'Digite o código enviado para seu novo número'}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
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
              {/* Aviso */}
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Ao alterar seu número, você precisará verificar o novo número 
                    através de um código de confirmação enviado por SMS.
                  </p>
                </div>
              </div>

              {step === 'phone' ? (
                // Passo 1: Digitar novo telefone
                <>
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      marginBottom: 'var(--spacing-xs)',
                      color: 'var(--text-secondary)',
                    }}>
                      Novo Número de Telefone *
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--glass-bg)',
                      border: error ? '2px solid var(--error)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0 12px',
                      transition: 'all 0.3s ease',
                    }}>
                      <PhoneIcon style={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\s/g, ''));
                          setError('');
                        }}
                        placeholder="841234567"
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
                    </div>
                    {error && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '4px' }}>
                        {error}
                      </p>
                    )}
                    <p style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                    }}>
                      Digite o número com DDD. Exemplo: 841234567
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleClose}
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
                      onClick={handleSendCode}
                      loading={loading}
                      disabled={loading || !phone}
                      icon={<CheckIcon />}
                      style={{ flex: 2 }}
                    >
                      Enviar Código
                    </AnimatedButton>
                  </div>
                </>
              ) : (
                // Passo 2: Verificar código
                <>
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--success)10',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--success)30',
                    marginBottom: 'var(--spacing-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Código enviado para
                      </p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                        {phone}
                      </p>
                    </div>
                    <button
                      onClick={handleResendCode}
                      disabled={timer > 0}
                      style={{
                        padding: '6px 16px',
                        background: timer > 0 ? 'var(--border)' : 'var(--secondary)',
                        color: timer > 0 ? 'var(--text-secondary)' : 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        cursor: timer > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {timer > 0 ? `${timer}s` : 'Reenviar'}
                    </button>
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      marginBottom: 'var(--spacing-xs)',
                      color: 'var(--text-secondary)',
                    }}>
                      Código de Verificação *
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--glass-bg)',
                      border: error ? '2px solid var(--error)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0 12px',
                      transition: 'all 0.3s ease',
                    }}>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(e.target.value.replace(/\D/g, ''));
                          setError('');
                        }}
                        placeholder="Digite o código de 6 dígitos"
                        maxLength={6}
                        style={{
                          flex: 1,
                          padding: '14px 12px',
                          border: 'none',
                          background: 'transparent',
                          fontSize: '0.95rem',
                          color: 'var(--text)',
                          outline: 'none',
                          fontFamily: 'inherit',
                          letterSpacing: '4px',
                          fontWeight: 600,
                        }}
                      />
                    </div>
                    {error && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '4px' }}>
                        {error}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setStep('phone');
                        setError('');
                      }}
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
                      Voltar
                    </button>
                    <AnimatedButton
                      variant="primary"
                      onClick={handleVerifyCode}
                      loading={loading}
                      disabled={loading || verificationCode.length < 4}
                      icon={<CheckIcon />}
                      style={{ flex: 2 }}
                    >
                      Confirmar
                    </AnimatedButton>
                  </div>
                </>
              )}
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

export default ChangePhoneModal;