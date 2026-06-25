// src/components/client/PaymentModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../common/AnimatedButton';
import GlassCard from '../common/GlassCard';
import BankTransfer from './BankTransfer';
import MobileTransfer from './MobileTransfer';
import InPersonPayment from './InPersonPayment';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  AccountBalance as BankIcon,
  PhoneAndroid as MobileIcon,
  Payment as CashIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon
} from '@mui/icons-material';


const PaymentModal = ({ order, onComplete, onClose }) => {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const paymentMethods = [
    { 
      id: 'bank_transfer', 
      label: 'Transferência Bancária', 
      icon: <BankIcon />, 
      description: 'BIM ou BCI',
      color: '#1a237e',
    },
    { 
      id: 'mobile_transfer', 
      label: 'Transferência Móvel', 
      icon: <MobileIcon />, 
      description: 'M-Pesa ou E-Mola',
      color: '#e65100',
    },
    { 
      id: 'in_person', 
      label: 'Pagamento Presencial', 
      icon: <CashIcon />, 
      description: 'Retire e pague na loja',
      color: '#2e7d32',
    },
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setPaymentData(null);
    setShowConfirmation(false);
  };

  const handlePaymentSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/orders', {
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee || 0,
        isDelivery: order.isDelivery || false,
        deliveryAddress: order.deliveryAddress || null,

         deliveryLat: order.deliveryLat ?? null,
  deliveryLng: order.deliveryLng ?? null,

        paymentMethod: selectedMethod,
        ...data
      });

      if (response.data.success) {
        const { order: createdOrder, payment } = response.data.data;
        console.log('📦 Pedido criado:', createdOrder);
        console.log('💳 Pagamento criado:', payment);
        
        setPaymentData({ 
          order: createdOrder, 
          payment: payment 
        });
        
        // Se for pagamento presencial, não precisa de comprovativo
        if (selectedMethod === 'in_person') {
          setShowConfirmation(true);
          toast.success('Pedido realizado com sucesso!');
          clearCart();
          setTimeout(() => {
            onComplete && onComplete(createdOrder);
          }, 2000);
        } else {
          toast.success('Pedido criado! Envie o comprovativo de pagamento.');
        }
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error(error.response?.data?.error || 'Erro ao realizar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleProofSubmit = async (proofData) => {
    // Verificar se temos o paymentData
    if (!paymentData) {
      toast.error('Nenhum pagamento encontrado');
      console.error('❌ paymentData é null/undefined');
      return;
    }

    // Verificar se temos o payment id
    const paymentId = paymentData.payment?.id;
    if (!paymentId) {
      toast.error('ID do pagamento não encontrado');
      console.error('❌ paymentId é null/undefined', paymentData);
      return;
    }

    console.log('📤 Enviando comprovativo para paymentId:', paymentId);

    setLoading(true);
    try {
      let response;
      
      // Se for FormData, enviar como multipart
      if (proofData instanceof FormData) {
        // Adicionar o paymentId no FormData para debug
        proofData.append('paymentId', paymentId);
        
        response = await api.post(
          `/payments/${paymentId}/proof`,
          proofData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Envio normal (JSON)
        response = await api.post(`/payments/${paymentId}/proof`, proofData);
      }
      
      if (response.data.success) {
        setShowConfirmation(true);
        toast.success('Comprovativo enviado com sucesso! Aguarde verificação.');
        clearCart();
        setTimeout(() => {
          onComplete && onComplete(paymentData.order);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar comprovativo:', error);
      console.error('❌ Detalhes:', error.response?.data);
      const errorMsg = error.response?.data?.error || 'Erro ao enviar comprovativo';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethodContent = () => {
    switch(selectedMethod) {
      case 'bank_transfer':
        return (
          <BankTransfer 
            onSubmit={handlePaymentSubmit}
            onProofSubmit={handleProofSubmit}
            order={order}
            paymentData={paymentData}
            loading={loading}
          />
        );
      case 'mobile_transfer':
        return (
          <MobileTransfer 
            onSubmit={handlePaymentSubmit}
            onProofSubmit={handleProofSubmit}
            order={order}
            paymentData={paymentData}
            loading={loading}
          />
        );
      case 'in_person':
        return (
          <InPersonPayment 
            onSubmit={handlePaymentSubmit}
            order={order}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  // Tela de confirmação
  if (showConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-xl) var(--spacing-lg)',
        }}
      >
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--spacing-lg)',
          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)',
        }}>
          <CheckIcon style={{ fontSize: 48, color: 'white' }} />
        </div>
        <h3 style={{ 
          fontSize: '1.4rem', 
          fontWeight: 700, 
          marginBottom: 'var(--spacing-sm)',
          color: 'var(--text)',
        }}>
          Pedido Realizado! 🎉
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: 'var(--spacing-sm)',
          fontSize: '0.95rem',
        }}>
          {selectedMethod === 'in_person' 
            ? 'Seu pedido foi confirmado! Aguarde a preparação.'
            : 'Comprovativo enviado! Aguarde a verificação do pagamento.'}
        </p>
        <div style={{
          padding: 'var(--spacing-md)',
          background: 'linear-gradient(135deg, var(--glass-bg), var(--surface))',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-md)',
          border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Número do Pedido
          </p>
          <p style={{ 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: 'var(--secondary)',
          }}>
            #{paymentData?.order?.order_number}
          </p>
        </div>
        <AnimatedButton
          variant="primary"
          onClick={() => {
            onComplete && onComplete(paymentData?.order);
          }}
          icon={<CheckIcon />}
          style={{ marginTop: 'var(--spacing-md)' }}
        >
          Acompanhar Pedido
        </AnimatedButton>
      </motion.div>
    );
  }

  return (
    <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
      {/* Header com gradiente */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        margin: '-4px -24px 20px -24px',
        padding: '20px 24px 16px 24px',
        borderRadius: '0 0 30px 30px',
        position: 'relative',
        overflow: 'hidden',
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
              }}>
                {!selectedMethod ? 'Pagamento' : paymentMethods.find(m => m.id === selectedMethod)?.label}
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.85rem',
              }}>
                {!selectedMethod 
                  ? 'Selecione a forma de pagamento' 
                  : 'Total: ' + new Intl.NumberFormat('pt-MZ', {
                      style: 'currency',
                      currency: 'MZN',
                      minimumFractionDigits: 0,
                    }).format(order.totalAmount)}
              </p>
            </div>
             
          </div>
        </div>
      </div>

      {!selectedMethod ? (
        <>
          {/* Resumo do pedido */}
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Itens</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.items.length}</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Subtotal</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--secondary)' }}>
                {new Intl.NumberFormat('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                }).format(order.totalAmount)}
              </p>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Entrega</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {order.isDelivery ? '🏠' : '🏪'}
              </p>
            </div>
          </div>

          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-md)',
          }}>
            Escolha como deseja pagar:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {paymentMethods.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMethodSelect(method.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  textAlign: 'left',
                  width: '100%',
                  color: 'var(--text)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${method.color}30, ${method.color}10)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: method.color,
                  flexShrink: 0,
                  border: `2px solid ${method.color}40`,
                }}>
                  {method.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {method.label}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {method.description}
                  </p>
                </div>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ArrowBackIcon style={{ 
                    fontSize: 14, 
                    transform: 'rotate(180deg)',
                    color: 'var(--text-secondary)',
                  }} />
                </div>
              </motion.button>
            ))}
          </div>

          <div style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            background: 'var(--warning)10',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--warning)30',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
          }}>
            <SecurityIcon style={{ fontSize: 18, color: 'var(--warning)' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>
              Pagamento seguro. Todos os dados são criptografados.
            </p>
          </div>
        </>
      ) : (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-md)',
          }}>
            <button
              onClick={() => setSelectedMethod(null)}
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
              <ArrowBackIcon style={{ fontSize: 18 }} />
            </button>
            <span style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)',
            }}>
              Voltar para formas de pagamento
            </span>
          </div>

          {renderPaymentMethodContent()}

          {/* Resumo rápido */}
          <div style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Total a pagar
            </span>
            <span style={{ 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              color: 'var(--secondary)' 
            }}>
              {new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN',
                minimumFractionDigits: 0,
              }).format(order.totalAmount)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentModal;