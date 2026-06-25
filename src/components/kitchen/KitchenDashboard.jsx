// src/components/kitchen/KitchenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../common/GlassCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { 
  Restaurant as RestaurantIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const KitchenDashboard = ({ onOrderClick }) => {
  const navigate = useNavigate();
  const { on, off } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ received: 0, preparing: 0, ready: 0, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    fetchOrders();
    
    // Listen for new orders
    const handleNewOrder = (data) => {
      toast.success(`🆕 Novo pedido #${data.orderNumber} recebido`);
      fetchOrders();
    };

    const handleNewPayment = (data) => {
      toast.info(`💳 Pagamento recebido para pedido #${data.orderNumber}`);
      fetchOrders();
    };

    const handlePaymentProof = (data) => {
      toast.info(`📷 Comprovativo recebido para pedido #${data.orderNumber}`);
      fetchOrders();
    };

    // Listen for status changes
    const handleStatusChanged = (data) => {
      toast.info(`📦 Pedido #${data.orderNumber} mudou para ${data.status}`);
      fetchOrders();
    };

    on('new_order', handleNewOrder);
    on('new_payment', handleNewPayment);
    on('payment_proof_submitted', handlePaymentProof);
    on('order_status_changed', handleStatusChanged);

    return () => {
      off('new_order', handleNewOrder);
      off('new_payment', handleNewPayment);
      off('payment_proof_submitted', handlePaymentProof);
      off('order_status_changed', handleStatusChanged);
    };
  }, [on, off]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/kitchen?status=all');
      if (response.data.success) {
        const allOrders = response.data.data;
        const activeOrders = allOrders.filter(o => 
          !['delivered', 'cancelled'].includes(o.status)
        );
        const sortedOrders = activeOrders.sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
        setOrders(sortedOrders);
        calculateStats(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    const received = ordersData.filter(o => o.status === 'received').length;
    const preparing = ordersData.filter(o => o.status === 'preparing').length;
    const ready = ordersData.filter(o => o.status === 'ready').length;
    const total = ordersData.length;
    setStats({ received, preparing, ready, total });
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Status atualizado para ${status}`);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  // Dentro do componente KitchenDashboard, atualizar a função handleOpenPayment

const handleOpenPayment = async (order) => {
  setSelectedOrder(order);
  setShowPaymentModal(true);
  setLoadingPayment(true);
  
  try {
    // CORRIGIDO: Usar a nova rota /payments/order/:orderId
    const response = await api.get(`/payments/order/${order.id}`);
    if (response.data.success) {
      setPaymentDetails(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching payment:', error);
    if (error.response?.status === 404) {
      toast.info('Nenhum pagamento encontrado para este pedido');
    } else {
      toast.error('Erro ao carregar detalhes do pagamento');
    }
  } finally {
    setLoadingPayment(false);
  }
};

  const handleClosePayment = () => {
    setShowPaymentModal(false);
    setSelectedOrder(null);
    setPaymentDetails(null);
  };

  const handleVerifyPayment = async (paymentId, status) => {
    try {
      await api.patch(`/payments/${paymentId}/verify`, { status });
      toast.success(`Pagamento ${status === 'approved' ? 'aprovado' : 'rejeitado'}`);
      handleClosePayment();
      fetchOrders();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Erro ao verificar pagamento');
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: 'Pendente', icon: <PendingIcon />, color: 'var(--warning)' },
      'received': { label: 'Recebido', icon: <PendingIcon />, color: 'var(--warning)' },
      'payment_verification': { label: 'Verificando Pagamento', icon: <PaymentIcon />, color: 'var(--secondary)' },
      'preparing': { label: 'Preparando', icon: <RestaurantIcon />, color: 'var(--info)' },
      'ready': { label: 'Pronto', icon: <CheckIcon />, color: 'var(--success)' },
      'sent': { label: 'Em Rota', icon: <PendingIcon />, color: 'var(--info)' },
      'delivered': { label: 'Entregue', icon: <CheckIcon />, color: 'var(--success)' },
      'cancelled': { label: 'Cancelado', icon: <CancelIcon />, color: 'var(--error)' },
    };
    return statusMap[status] || { label: status, icon: <PendingIcon />, color: 'var(--text-secondary)' };
  };

  const getNextStatus = (currentStatus) => {
    const steps = ['received', 'preparing', 'ready'];
    const currentIndex = steps.indexOf(currentStatus);
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
  };

  const getPreviousStatus = (currentStatus) => {
    const steps = ['received', 'preparing', 'ready'];
    const currentIndex = steps.indexOf(currentStatus);
    return currentIndex > 0 ? steps[currentIndex - 1] : null;
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <LoadingSkeleton type="order" count={3} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: '80px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary), var(--secondary-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Cozinha
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {stats.total} pedido{stats.total !== 1 ? 's' : ''} em andamento
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={fetchOrders}
            style={{
              padding: '8px 12px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              transition: 'all var(--transition-normal)',
            }}
          >
            <RefreshIcon style={{ fontSize: 18 }} />
          </button>
          <AnimatedButton
            variant="secondary"
            size="small"
            onClick={() => navigate('/kitchen/products')}
            icon={<RestaurantIcon />}
          >
            Gerenciar
          </AnimatedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <GlassCard style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
          <PendingIcon style={{ fontSize: 20, color: 'var(--warning)' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 'var(--spacing-xs)' }}>
            {stats.received}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Recebidos</p>
        </GlassCard>
        <GlassCard style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
          <RestaurantIcon style={{ fontSize: 20, color: 'var(--info)' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 'var(--spacing-xs)' }}>
            {stats.preparing}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Preparando</p>
        </GlassCard>
        <GlassCard style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
          <CheckIcon style={{ fontSize: 20, color: 'var(--success)' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 'var(--spacing-xs)' }}>
            {stats.ready}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Prontos</p>
        </GlassCard>
        <GlassCard style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
          <CheckIcon style={{ fontSize: 20, color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 'var(--spacing-xs)' }}>
            {stats.total}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total</p>
        </GlassCard>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <GlassCard style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--spacing-md)' }}>🍽️</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Nenhum pedido na cozinha
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'var(--spacing-sm)' }}>
            Aguardando novos pedidos...
          </p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {orders.map((order, index) => {
            const statusInfo = getStatusInfo(order.status);
            const nextStatus = getNextStatus(order.status);
            const prevStatus = getPreviousStatus(order.status);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <GlassCard>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--spacing-sm)',
                  }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>
                        Pedido #{order.order_number}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(order.created_at).toLocaleString('pt-MZ')}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: statusInfo.color + '20',
                      color: statusInfo.color,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </div>
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <p style={{ fontSize: '0.9rem' }}>
                      <strong>Itens:</strong> {order.items?.length || 0}
                    </p>
                    <p style={{ fontSize: '0.9rem' }}>
                      <strong>Total:</strong>{' '}
                      {new Intl.NumberFormat('pt-MZ', {
                        style: 'currency',
                        currency: 'MZN',
                        minimumFractionDigits: 0,
                      }).format(order.total_amount || 0)}
                    </p>
                    {order.is_delivery && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        🚚 Delivery - {order.delivery_address || 'Endereço não informado'}
                      </p>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    flexWrap: 'wrap',
                  }}>
                    {/* Botão para avançar status */}
                    {nextStatus && order.status !== 'payment_verification' && (
  <AnimatedButton
    variant="primary"
    size="small"
    onClick={() => handleStatusUpdate(order.id, nextStatus)}
    icon={<CheckIcon />}
    style={{ flex: 1 }}
  >
    {nextStatus === 'preparing' ? 'Iniciar Preparo' :
     nextStatus === 'ready' ? 'Marcar Pronto' :
     `Avançar para ${getStatusInfo(nextStatus).label}`}
  </AnimatedButton>
)}
                    
                    {/* Botão para voltar status */}
                    {prevStatus && order.status !== 'received' && (
                      <AnimatedButton
                        variant="secondary"
                        size="small"
                        onClick={() => handleStatusUpdate(order.id, prevStatus)}
                        style={{ flex: 0.5 }}
                      >
                        Voltar
                      </AnimatedButton>
                    )}

                    {/* Botão cancelar */}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <AnimatedButton
                        variant="danger"
                        size="small"
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja cancelar este pedido?')) {
                            handleStatusUpdate(order.id, 'cancelled');
                          }
                        }}
                        icon={<CancelIcon />}
                        style={{ flex: 0.5 }}
                      >
                        Cancelar
                      </AnimatedButton>
                    )}
                  </div>

                  <div style={{
                    marginTop: 'var(--spacing-sm)',
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                  }}>
                    <button
                      onClick={() => handleOpenDetail(order)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-xs)',
                        transition: 'all var(--transition-normal)',
                      }}
                    >
                      <ReceiptIcon style={{ fontSize: 18 }} />
                      Detalhes
                    </button>
                    <button
                      onClick={() => handleOpenPayment(order)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-xs)',
                        transition: 'all var(--transition-normal)',
                      }}
                    >
                      <PaymentIcon style={{ fontSize: 18 }} />
                      Pagamento
                    </button>
                  </div>

                  {/* Timer de preparo */}
                  {order.status === 'preparing' && order.estimated_preparation_time && (
                    <div style={{
                      marginTop: 'var(--spacing-sm)',
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      background: 'var(--info)20',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      color: 'var(--info)',
                    }}>
                      ⏱️ Tempo estimado: {order.estimated_preparation_time} min
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE DETALHES DO PEDIDO - DE BAIXO PARA CIMA */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
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
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                background: 'var(--surface)',
                width: '100%',
                maxWidth: '480px',
                maxHeight: '85vh',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                overflow: 'hidden',
                borderTop: '1px solid var(--border)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div style={{
                width: '40px',
                height: '4px',
                background: 'var(--border)',
                borderRadius: 'var(--radius-full)',
                margin: 'var(--spacing-md) auto',
              }} />

              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 var(--spacing-lg) var(--spacing-md)',
                borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    Detalhes do Pedido
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    #{selectedOrder.order_number}
                  </p>
                </div>
                <button
                  onClick={handleCloseDetail}
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

              {/* Content - Scrollable */}
              <div style={{
                padding: 'var(--spacing-lg)',
                overflowY: 'auto',
                maxHeight: 'calc(85vh - 120px)',
              }}>
                {/* Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--glass-bg)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  {getStatusInfo(selectedOrder.status).icon}
                  <span style={{ fontWeight: 500 }}>
                    Status: {getStatusInfo(selectedOrder.status).label}
                  </span>
                </div>

                {/* Cliente Info */}
                <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)', fontSize: '0.95rem' }}>
                    <PersonIcon style={{ fontSize: 18, marginRight: 'var(--spacing-xs)', verticalAlign: 'middle' }} />
                    Informações do Cliente
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <PersonIcon style={{ fontSize: 18, color: 'var(--secondary)' }} />
                      <span>{selectedOrder.client_name || 'Cliente'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <PhoneIcon style={{ fontSize: 18, color: 'var(--secondary)' }} />
                      <span>{selectedOrder.client_phone || 'Não disponível'}</span>
                    </div>
                    {selectedOrder.is_delivery && selectedOrder.delivery_address && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                        <LocationIcon style={{ fontSize: 18, color: 'var(--secondary)', marginTop: 2 }} />
                        <span>{selectedOrder.delivery_address}</span>
                      </div>
                    )}
                  </div>
                </GlassCard>

                {/* Itens do Pedido */}
                <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)', fontSize: '0.95rem' }}>
                    <ReceiptIcon style={{ fontSize: 18, marginRight: 'var(--spacing-xs)', verticalAlign: 'middle' }} />
                    Itens do Pedido
                  </h4>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-xs) 0',
                      borderBottom: index < selectedOrder.items.length - 1 ? '1px solid var(--border)' : 'none',
                      fontSize: '0.9rem',
                    }}>
                      <div>
                        <span>
                          {item.quantity}x {item.product_name || item.title}
                        </span>
                        {item.observations && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--text-secondary)', 
                            display: 'block',
                            fontStyle: 'italic',
                          }}>
                            Obs: {item.observations}
                          </span>
                        )}
                      </div>
                      <span style={{ fontWeight: 500 }}>
                        {new Intl.NumberFormat('pt-MZ', {
                          style: 'currency',
                          currency: 'MZN',
                          minimumFractionDigits: 0,
                        }).format(item.total_price || (item.price * item.quantity))}
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
                    fontSize: '1.05rem',
                  }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--secondary)' }}>
                      {new Intl.NumberFormat('pt-MZ', {
                        style: 'currency',
                        currency: 'MZN',
                        minimumFractionDigits: 0,
                      }).format(selectedOrder.total_amount)}
                    </span>
                  </div>
                  {selectedOrder.delivery_fee > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginTop: 'var(--spacing-xs)',
                    }}>
                      <span>Taxa de Entrega</span>
                      <span>
                        {new Intl.NumberFormat('pt-MZ', {
                          style: 'currency',
                          currency: 'MZN',
                          minimumFractionDigits: 0,
                        }).format(selectedOrder.delivery_fee)}
                      </span>
                    </div>
                  )}
                </GlassCard>

                {/* Observações */}
                {selectedOrder.observations && (
                  <div style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    background: 'var(--warning)10',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--warning)30',
                    marginBottom: 'var(--spacing-md)',
                  }}>
                    <p style={{ fontSize: '0.9rem' }}>
                      <strong>Observações:</strong> {selectedOrder.observations}
                    </p>
                  </div>
                )}

                {/* Botão Fechar */}
                <AnimatedButton
                  variant="secondary"
                  onClick={handleCloseDetail}
                  fullWidth
                >
                  Fechar
                </AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL DE PAGAMENTO - DE BAIXO PARA CIMA */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showPaymentModal && selectedOrder && (
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
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={handleClosePayment}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                background: 'var(--surface)',
                width: '100%',
                maxWidth: '480px',
                maxHeight: '85vh',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                overflow: 'hidden',
                borderTop: '1px solid var(--border)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div style={{
                width: '40px',
                height: '4px',
                background: 'var(--border)',
                borderRadius: 'var(--radius-full)',
                margin: 'var(--spacing-md) auto',
              }} />

              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 var(--spacing-lg) var(--spacing-md)',
                borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    <PaymentIcon style={{ fontSize: 20, marginRight: 'var(--spacing-xs)', verticalAlign: 'middle' }} />
                    Detalhes do Pagamento
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Pedido #{selectedOrder.order_number}
                  </p>
                </div>
                <button
                  onClick={handleClosePayment}
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

              {/* Content - Scrollable */}
              <div style={{
                padding: 'var(--spacing-lg)',
                overflowY: 'auto',
                maxHeight: 'calc(85vh - 120px)',
              }}>
                {loadingPayment ? (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                      Carregando detalhes do pagamento...
                    </p>
                  </div>
                ) : paymentDetails ? (
                  <>
                    {/* Resumo do Pagamento */}
                    <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--spacing-sm)',
                      }}>
                        <span style={{ fontWeight: 500 }}>Método</span>
                        <span style={{ fontWeight: 600 }}>
                          {paymentDetails.method === 'bank_transfer' ? 'Transferência Bancária' :
                           paymentDetails.method === 'mobile_transfer' ? 'Transferência Móvel' :
                           'Pagamento Presencial'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--spacing-sm)',
                      }}>
                        <span style={{ fontWeight: 500 }}>Valor</span>
                        <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '1.1rem' }}>
                          {new Intl.NumberFormat('pt-MZ', {
                            style: 'currency',
                            currency: 'MZN',
                            minimumFractionDigits: 0,
                          }).format(paymentDetails.amount)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontWeight: 500 }}>Status</span>
                        <span style={{
                          padding: '2px 12px',
                          borderRadius: 'var(--radius-full)',
                          background: paymentDetails.status === 'approved' ? 'var(--success)20' :
                                   paymentDetails.status === 'rejected' ? 'var(--error)20' :
                                   'var(--warning)20',
                          color: paymentDetails.status === 'approved' ? 'var(--success)' :
                                 paymentDetails.status === 'rejected' ? 'var(--error)' :
                                 'var(--warning)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}>
                          {paymentDetails.status === 'approved' ? '✅ Aprovado' :
                           paymentDetails.status === 'rejected' ? '❌ Rejeitado' :
                           paymentDetails.status === 'pending_verification' ? '⏳ Em Verificação' :
                           '⏳ Pendente'}
                        </span>
                      </div>
                      {paymentDetails.reference && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 'var(--spacing-sm)',
                          paddingTop: 'var(--spacing-sm)',
                          borderTop: '1px solid var(--border)',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                        }}>
                          <span>Referência</span>
                          <span style={{ fontWeight: 500 }}>{paymentDetails.reference}</span>
                        </div>
                      )}
                    </GlassCard>

                    {/* Comprovativo */}
                    {(paymentDetails.proof || paymentDetails.proof_image) && (
                      <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
                        <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)', fontSize: '0.95rem' }}>
                          <InfoIcon style={{ fontSize: 18, marginRight: 'var(--spacing-xs)', verticalAlign: 'middle' }} />
                          Comprovativo
                        </h4>
                        {paymentDetails.proof && (
                          <div style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            background: 'var(--glass-bg)',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: 'var(--spacing-sm)',
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                          }}>
                            {paymentDetails.proof}
                          </div>
                        )}
                        {paymentDetails.proof_image && (
                          <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            <img
                              src={paymentDetails.proof_image}
                              alt="Comprovativo"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '250px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                              }}
                            />
                          </div>
                        )}
                      </GlassCard>
                    )}

                    {/* Botões de Ação - Apenas se estiver pendente */}
                    {paymentDetails.status === 'pending_verification' && (
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <AnimatedButton
                          variant="success"
                          onClick={() => handleVerifyPayment(paymentDetails.id, 'approved')}
                          icon={<CheckIcon />}
                          style={{ flex: 1 }}
                        >
                          Aprovar Pagamento
                        </AnimatedButton>
                        <AnimatedButton
                          variant="danger"
                          onClick={() => handleVerifyPayment(paymentDetails.id, 'rejected')}
                          icon={<CancelIcon />}
                          style={{ flex: 1 }}
                        >
                          Rejeitar
                        </AnimatedButton>
                      </div>
                    )}

                    {paymentDetails.status === 'approved' && (
                      <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--success)20',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--success)30',
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-md)',
                      }}>
                        <CheckIcon style={{ color: 'var(--success)', fontSize: 28 }} />
                        <p style={{ color: 'var(--success)', fontWeight: 600, marginTop: 'var(--spacing-xs)' }}>
                          Pagamento aprovado!
                        </p>
                        {paymentDetails.verified_at && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Verificado em {new Date(paymentDetails.verified_at).toLocaleString('pt-MZ')}
                          </p>
                        )}
                      </div>
                    )}

                    {paymentDetails.status === 'rejected' && (
                      <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--error)20',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--error)30',
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-md)',
                      }}>
                        <CancelIcon style={{ color: 'var(--error)', fontSize: 28 }} />
                        <p style={{ color: 'var(--error)', fontWeight: 600, marginTop: 'var(--spacing-xs)' }}>
                          Pagamento rejeitado
                        </p>
                      </div>
                    )}

                    {/* Botão Fechar */}
                    <AnimatedButton
                      variant="secondary"
                      onClick={handleClosePayment}
                      fullWidth
                    >
                      Fechar
                    </AnimatedButton>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <PaymentIcon style={{ fontSize: 48, color: 'var(--text-secondary)', opacity: 0.3 }} />
                    <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                      Nenhum pagamento encontrado para este pedido
                    </p>
                    <AnimatedButton
                      variant="secondary"
                      onClick={handleClosePayment}
                      fullWidth
                      style={{ marginTop: 'var(--spacing-md)' }}
                    >
                      Fechar
                    </AnimatedButton>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KitchenDashboard;