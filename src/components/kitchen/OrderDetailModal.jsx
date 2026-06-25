// src/components/kitchen/OrderDetailModal.jsx//
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const OrderDetailModal = ({ order, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleVerifyPayment = async (status) => {
    if (!order.payment) return;
    
    setLoading(true);
    try {
      await api.patch(`/payments/${order.payment.id}/verify`, { status });
      toast.success(`Pagamento ${status === 'approved' ? 'aprovado' : 'rejeitado'}`);
      onClose();
    } catch (error) {
      toast.error('Erro ao verificar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)',
      }}>
        <h3 style={{ fontWeight: 700 }}>
          Pedido #{order.order_number}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--text)',
          }}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Client Info */}
      <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
          Informações do Cliente
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <PersonIcon style={{ fontSize: 20, color: 'var(--secondary)' }} />
            <span>{order.client_name || 'Cliente'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <PhoneIcon style={{ fontSize: 20, color: 'var(--secondary)' }} />
            <span>{order.client_phone || 'Não disponível'}</span>
          </div>
          {order.delivery_address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <LocationIcon style={{ fontSize: 20, color: 'var(--secondary)' }} />
              <span>{order.delivery_address}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Order Items */}
      <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
          Itens do Pedido
        </h4>
        {order.items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--spacing-xs) 0',
              borderBottom: index < order.items.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span>
              {item.quantity}x {item.title}
              {item.observation && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                  Obs: {item.observation}
                </span>
              )}
            </span>
            <span style={{ fontWeight: 500 }}>
              {new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN',
                minimumFractionDigits: 0,
              }).format(item.price * item.quantity)}
            </span>
          </div>
        ))}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 'var(--spacing-sm)',
          borderTop: '2px solid var(--border)',
          marginTop: 'var(--spacing-sm)',
          fontWeight: 700,
          fontSize: '1.1rem',
        }}>
          <span>Total</span>
          <span style={{ color: 'var(--secondary)' }}>
            {new Intl.NumberFormat('pt-MZ', {
              style: 'currency',
              currency: 'MZN',
              minimumFractionDigits: 0,
            }).format(order.total_amount)}
          </span>
        </div>
        {order.delivery_fee > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}>
            <span>Taxa de Entrega</span>
            <span>
              {new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN',
                minimumFractionDigits: 0,
              }).format(order.delivery_fee)}
            </span>
          </div>
        )}
      </GlassCard>

      {/* Payment Info */}
      {order.payment && (
        <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-sm)',
          }}>
            <h4 style={{ fontWeight: 600 }}>Pagamento</h4>
            <button
              onClick={() => setShowPayment(!showPayment)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {showPayment ? 'Ocultar' : 'Ver Detalhes'}
            </button>
          </div>
          <div>
            <p><strong>Método:</strong> {order.payment.method}</p>
            <p><strong>Valor:</strong> {new Intl.NumberFormat('pt-MZ', {
              style: 'currency',
              currency: 'MZN',
              minimumFractionDigits: 0,
            }).format(order.payment.amount)}</p>
            <p><strong>Status:</strong> {order.payment.status}</p>
          </div>

          {showPayment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: 'var(--spacing-md)' }}
            >
              {order.payment.proof && (
                <div style={{
                  background: 'var(--glass-bg)',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  <p><strong>Comprovativo:</strong></p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {order.payment.proof}
                  </p>
                </div>
              )}
              {order.payment.proof_image && (
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <img
                    src={order.payment.proof_image}
                    alt="Comprovativo"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  />
                </div>
              )}
              
              {order.payment.status === 'pending_verification' && (
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <AnimatedButton
                    variant="success"
                    onClick={() => handleVerifyPayment('approved')}
                    loading={loading}
                    icon={<CheckIcon />}
                    style={{ flex: 1 }}
                  >
                    Aprovar
                  </AnimatedButton>
                  <AnimatedButton
                    variant="danger"
                    onClick={() => handleVerifyPayment('rejected')}
                    loading={loading}
                    icon={<CancelIcon />}
                    style={{ flex: 1 }}
                  >
                    Rejeitar
                  </AnimatedButton>
                </div>
              )}
            </motion.div>
          )}
        </GlassCard>
      )}

      <AnimatedButton
        variant="secondary"
        onClick={onClose}
        fullWidth
      >
        Fechar
      </AnimatedButton>
    </div>
  );
};

export default OrderDetailModal;