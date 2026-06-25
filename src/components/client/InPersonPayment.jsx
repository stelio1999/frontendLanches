// src/components/client/InPersonPayment.jsx//
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from '../common/AnimatedButton';
import GlassCard from '../common/GlassCard';
import { 
  Store as StoreIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const InPersonPayment = ({ onSubmit, order, loading }) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    onSubmit && onSubmit({});
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <GlassCard variant="accent" style={{ 
          textAlign: 'center',
          marginBottom: 'var(--spacing-md)',
          padding: 'var(--spacing-xl)',
        }}>
          <StoreIcon style={{ 
            fontSize: 64, 
            color: 'var(--accent)',
            marginBottom: 'var(--spacing-md)',
          }} />
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: 600,
            marginBottom: 'var(--spacing-sm)',
          }}>
            Pagamento Presencial
          </h3>
          <p style={{ 
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            Esta opção não está disponível para entrega a domicílio.
            Você deverá levantar o seu pedido no local.
          </p>
        </GlassCard>

        <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-md)',
          }}>
            <InfoIcon style={{ color: 'var(--info)', marginTop: 2 }} />
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Informações Importantes
              </h4>
              <ul style={{ 
                marginTop: 'var(--spacing-sm)',
                paddingLeft: 'var(--spacing-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.8,
              }}>
                <li>✓ Retire seu pedido na loja</li>
                <li>✓ Pague na hora da retirada</li>
                <li>✓ Aceitamos dinheiro e cartões</li>
                <li>✓ Horário de funcionamento: 08:00 - 22:00</li>
              </ul>
            </div>
          </div>

          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-md)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-xs)',
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>
                {new Intl.NumberFormat('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                }).format(order.totalAmount)}
              </span>
            </div>
            {order.deliveryFee > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 'var(--spacing-xs)',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Taxa de Entrega</span>
                <span style={{ fontWeight: 600 }}>
                  {new Intl.NumberFormat('pt-MZ', {
                    style: 'currency',
                    currency: 'MZN',
                    minimumFractionDigits: 0,
                  }).format(order.deliveryFee)}
                </span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 'var(--spacing-sm)',
              borderTop: '2px solid var(--border)',
              fontSize: '1.1rem',
              fontWeight: 700,
            }}>
              <span>Total a Pagar</span>
              <span style={{ color: 'var(--secondary)' }}>
                {new Intl.NumberFormat('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                }).format(order.totalAmount + (order.deliveryFee || 0))}
              </span>
            </div>
          </div>

          <AnimatedButton
            variant={confirmed ? 'success' : 'primary'}
            fullWidth
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            icon={confirmed ? <CheckIcon /> : <StoreIcon />}
          >
            {confirmed ? 'Confirmar Pagamento' : 'Confirmar Retirada no Local'}
          </AnimatedButton>

          {confirmed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 'var(--spacing-sm)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}
            >
              Clique em "Confirmar Pagamento" para finalizar seu pedido
            </motion.p>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default InPersonPayment;