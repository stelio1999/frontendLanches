// src/components/client/DeleteAccountModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Close as CloseIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Dangerous as DangerousIcon
} from '@mui/icons-material';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('confirm'); // 'confirm' | 'pending' | 'error'
  const [confirmation, setConfirmation] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      toast.error('Digite "DELETE" para confirmar');
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete('/auth/account', {
        data: { confirmation: confirmation }
      });

      if (response.data.success) {
        toast.success('Conta excluída com sucesso!');
        setStep('pending');
        await logout();
        setTimeout(() => {
          onClose();
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erro ao excluir conta:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        if (errorData.pendingOrders && errorData.pendingOrders.length > 0) {
          setPendingOrders(errorData.pendingOrders);
          setStep('error');
          toast.error(`Você tem ${errorData.pendingOrders.length} pedido(s) pendente(s)`);
        } else {
          toast.error(errorData.error || 'Não é possível excluir a conta');
        }
      } else {
        toast.error(error.response?.data?.error || 'Erro ao excluir conta');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-md)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-xl)',
              maxWidth: '420px',
              width: '100%',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-lg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--error)15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--error)30',
                }}>
                  <DangerousIcon style={{ fontSize: 24, color: 'var(--error)' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--error)' }}>
                  Excluir Conta
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
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

            {/* Conteúdo */}
            {step === 'confirm' && (
              <>
                <div style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--error)05',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--error)20',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                    <WarningIcon style={{ color: 'var(--error)', fontSize: 20, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
                        Atenção: Esta ação é irreversível!
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                        Ao excluir sua conta, todos os seus dados serão removidos permanentemente:
                      </p>
                      <ul style={{
                        marginTop: 'var(--spacing-sm)',
                        paddingLeft: 'var(--spacing-md)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 2,
                      }}>
                        <li>✓ Seus dados pessoais</li>
                        <li>✓ Histórico de pedidos</li>
                        <li>✓ Notificações</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--glass-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                    Para confirmar a exclusão, digite <strong style={{ color: 'var(--error)' }}>DELETE</strong>:
                  </p>
                  <input
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                    placeholder="Digite DELETE"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--surface)',
                      border: `2px solid ${confirmation === 'DELETE' ? 'var(--success)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      color: 'var(--text)',
                      outline: 'none',
                      textAlign: 'center',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      transition: 'all var(--transition-normal)',
                    }}
                    autoFocus
                  />
                  {confirmation && confirmation !== 'DELETE' && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: 'var(--spacing-xs)' }}>
                      ⚠️ Digite exatamente "DELETE" em maiúsculas
                    </p>
                  )}
                  {confirmation === 'DELETE' && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: 'var(--spacing-xs)' }}>
                      ✅ Confirmação válida. Clique em "Excluir Permanentemente"
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <AnimatedButton
                    variant="secondary"
                    onClick={onClose}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </AnimatedButton>
                  <AnimatedButton
                    variant="danger"
                    onClick={handleDelete}
                    loading={loading}
                    disabled={loading || confirmation !== 'DELETE'}
                    icon={<DeleteIcon />}
                    style={{ flex: 1.5 }}
                  >
                    {loading ? 'Excluindo...' : 'Excluir Permanentemente'}
                  </AnimatedButton>
                </div>
              </>
            )}

            {step === 'pending' && (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'var(--success)20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--spacing-md)',
                  border: '2px solid var(--success)30',
                }}>
                  <CheckIcon style={{ fontSize: 36, color: 'var(--success)' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--success)' }}>
                  Conta Excluída!
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                  Sua conta foi removida com sucesso. Todos os dados foram apagados.
                </p>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)', 
                  marginTop: 'var(--spacing-md)',
                  opacity: 0.6,
                }}>
                  Redirecionando para a página inicial...
                </p>
              </div>
            )}

            {step === 'error' && (
              <div>
                <div style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--warning)10',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--warning)30',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <WarningIcon style={{ color: 'var(--warning)' }} />
                    <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--warning)' }}>
                      Pedidos Pendentes
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Não é possível excluir a conta enquanto houver pedidos pendentes:
                  </p>
                  <ul style={{
                    marginTop: 'var(--spacing-sm)',
                    paddingLeft: 'var(--spacing-md)',
                    fontSize: '0.85rem',
                    color: 'var(--text)',
                    lineHeight: 2.2,
                  }}>
                    {pendingOrders.map((order) => (
                      <li key={order.id}>
                        Pedido #{order.order_number} - <span style={{ 
                          color: order.status === 'received' ? 'var(--warning)' : 
                                 order.status === 'preparing' ? 'var(--info)' : 
                                 'var(--text-secondary)'
                        }}>{order.status}</span>
                      </li>
                    ))}
                  </ul>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: 'var(--spacing-sm)',
                    fontStyle: 'italic',
                  }}>
                    * Aguarde a conclusão de todos os pedidos ou cancele-os para prosseguir
                  </p>
                </div>
                <AnimatedButton
                  variant="secondary"
                  onClick={() => {
                    setStep('confirm');
                    setPendingOrders([]);
                  }}
                  fullWidth
                >
                  Voltar
                </AnimatedButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteAccountModal;