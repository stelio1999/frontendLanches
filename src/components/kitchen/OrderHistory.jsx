// src/components/kitchen/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../common/GlassCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import SearchBar from '../client/SearchBar';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  Restaurant as RestaurantIcon,
  Pending as PendingIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { on, off } = useSocket();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    fetchHistory();

    const handleStatusChanged = (data) => {
      fetchHistory();
    };

    on('order_status_changed', handleStatusChanged);

    return () => {
      off('order_status_changed', handleStatusChanged);
    };
  }, [on, off]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, statusFilter, orders]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/kitchen/history');
      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        (order.items?.some(item => 
          item.product_name?.toLowerCase().includes(query) ||
          item.title?.toLowerCase().includes(query)
        ))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: 'Pendente', icon: <PendingIcon />, color: 'var(--warning)' },
      'received': { label: 'Recebido', icon: <PendingIcon />, color: 'var(--warning)' },
      'preparing': { label: 'Preparando', icon: <RestaurantIcon />, color: 'var(--info)' },
      'ready': { label: 'Pronto', icon: <CheckIcon />, color: 'var(--success)' },
      'sent': { label: 'Em Rota', icon: <ShippingIcon />, color: 'var(--info)' },
      'delivered': { label: 'Entregue', icon: <CheckIcon />, color: 'var(--success)' },
      'cancelled': { label: 'Cancelado', icon: <CancelIcon />, color: 'var(--error)' },
    };
    return statusMap[status] || { label: status, icon: <PendingIcon />, color: 'var(--text-secondary)' };
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
      fetchHistory();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Erro ao verificar pagamento');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <LoadingSkeleton type="order" count={5} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: '80px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={() => navigate('/kitchen')}
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
            <ArrowBackIcon />
          </button>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary), var(--secondary-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Histórico de Pedidos
          </h1>
        </div>
        <button
          onClick={fetchHistory}
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
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar por número do pedido ou produto..."
      />

      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-md)',
        overflowX: 'auto',
        padding: 'var(--spacing-xs) 0',
        flexWrap: 'wrap',
      }}>
        {['all', 'delivered', 'cancelled', 'sent', 'ready', 'preparing', 'received', 'pending'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: statusFilter === status ? 'none' : '1px solid var(--border)',
              background: statusFilter === status 
                ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                : 'var(--glass-bg)',
              color: statusFilter === status ? 'white' : 'var(--text)',
              fontWeight: statusFilter === status ? 600 : 400,
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
            }}
          >
            {status === 'all' ? (
              <>
                <FilterIcon style={{ fontSize: 14 }} />
                Todos
              </>
            ) : (
              <>
                {getStatusInfo(status).icon}
                {getStatusInfo(status).label}
              </>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <GlassCard style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--spacing-md)' }}>📋</div>
          <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
            Nenhum pedido no histórico
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {searchQuery ? 'Tente ajustar sua busca' : 'Os pedidos finalizados aparecerão aqui'}
          </p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {filteredOrders.map((order, index) => {
            const statusInfo = getStatusInfo(order.status);
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
                    {order.is_delivery && order.delivery_address && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        🚚 {order.delivery_address}
                      </p>
                    )}
                    {order.cancelled_reason && (
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--error)',
                        marginTop: 'var(--spacing-xs)',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        background: 'var(--error)10',
                        borderRadius: 'var(--radius-sm)',
                      }}>
                        ⚠️ Motivo: {order.cancelled_reason}
                      </p>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    flexWrap: 'wrap',
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

                    {order.status === 'cancelled' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Deseja reabrir este pedido?')) {
                            // Implementar reabertura
                          }
                        }}
                        style={{
                          flex: 0.5,
                          padding: '8px',
                          background: 'var(--info)20',
                          border: '1px solid var(--info)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          color: 'var(--info)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'var(--spacing-xs)',
                          transition: 'all var(--transition-normal)',
                        }}
                      >
                        <RefreshIcon style={{ fontSize: 16 }} />
                        Reabrir
                      </button>
                    )}
                  </div>

                  <div style={{
                    marginTop: 'var(--spacing-sm)',
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    flexWrap: 'wrap',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {order.delivered_at && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <CheckIcon style={{ fontSize: 14, color: 'var(--success)' }} />
                        Entregue: {new Date(order.delivered_at).toLocaleString('pt-MZ')}
                      </span>
                    )}
                    {order.cancelled_at && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <CancelIcon style={{ fontSize: 14, color: 'var(--error)' }} />
                        Cancelado: {new Date(order.cancelled_at).toLocaleString('pt-MZ')}
                      </span>
                    )}
                    {order.sent_at && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <ShippingIcon style={{ fontSize: 14, color: 'var(--info)' }} />
                        Enviado: {new Date(order.sent_at).toLocaleString('pt-MZ')}
                      </span>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}

          <div style={{
            marginTop: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Total de {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} no histórico
            </p>
          </div>
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

                {/* Informações de tempo */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-xs)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--glass-bg)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)' }}>
                    <InfoIcon style={{ fontSize: 16, marginRight: 'var(--spacing-xs)', verticalAlign: 'middle' }} />
                    Linha do Tempo
                  </h4>
                  {selectedOrder.created_at && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      📦 Criado: {new Date(selectedOrder.created_at).toLocaleString('pt-MZ')}
                    </div>
                  )}
                  {selectedOrder.preparation_started_at && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      👨‍🍳 Início Preparo: {new Date(selectedOrder.preparation_started_at).toLocaleString('pt-MZ')}
                    </div>
                  )}
                  {selectedOrder.preparation_finished_at && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ✅ Preparo Finalizado: {new Date(selectedOrder.preparation_finished_at).toLocaleString('pt-MZ')}
                    </div>
                  )}
                  {selectedOrder.sent_at && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      🚚 Enviado: {new Date(selectedOrder.sent_at).toLocaleString('pt-MZ')}
                    </div>
                  )}
                  {selectedOrder.delivered_at && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      📬 Entregue: {new Date(selectedOrder.delivered_at).toLocaleString('pt-MZ')}
                    </div>
                  )}
                  {selectedOrder.cancelled_at && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ❌ Cancelado: {new Date(selectedOrder.cancelled_at).toLocaleString('pt-MZ')}
                    </div>
                  )}
                </div>

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
                      {paymentDetails.verified_at && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          marginTop: 'var(--spacing-xs)',
                        }}>
                          <span>Verificado em</span>
                          <span>{new Date(paymentDetails.verified_at).toLocaleString('pt-MZ')}</span>
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

export default OrderHistory;