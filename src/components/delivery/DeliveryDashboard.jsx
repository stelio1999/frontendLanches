// src/components/delivery/DeliveryDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../common/GlassCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { 
  ShoppingBag as OrderIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Map as MapIcon,
  QrCodeScanner as ScanIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  Timer as TimerIcon,
  DirectionsBike as MotorcycleIcon, // CORRIGIDO: usando DirectionsBike
  Done as DoneIcon,
  Cancel as CancelIcon,
  DeliveryDining as DeliveryIcon // Adicionado como alternativa
} from '@mui/icons-material';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { on, off, emit } = useSocket();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ available: 0, inProgress: 0, completed: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    
    const handleOrderForDelivery = (data) => {
      toast.success(`🆕 Novo pedido #${data.orderNumber} disponível para entrega!`);
      fetchOrders();
    };

    const handleStatusChanged = (data) => {
      if (data.status === 'sent' || data.status === 'delivered') {
        fetchOrders();
      }
    };

    on('order_for_delivery', handleOrderForDelivery);
    on('order_status_changed', handleStatusChanged);

    return () => {
      off('order_for_delivery', handleOrderForDelivery);
      off('order_status_changed', handleStatusChanged);
    };
  }, [on, off]);

  useEffect(() => {
    filterOrders();
  }, [filter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/delivery');
      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (filter === 'available') {
      filtered = filtered.filter(o => o.status === 'ready' && !o.delivery_id);
    } else if (filter === 'my') {
      filtered = filtered.filter(o => o.delivery_id && o.status !== 'ready');
    } else {
      filtered = orders;
    }

    setFilteredOrders(filtered);
  };

  const calculateStats = (ordersData) => {
    const available = ordersData.filter(o => o.status === 'ready' && !o.delivery_id).length;
    const inProgress = ordersData.filter(o => 
      (o.status === 'sent' || o.status === 'in_progress') && o.delivery_id
    ).length;
    const completed = ordersData.filter(o => 
      o.status === 'delivered' && o.delivery_id
    ).length;
    setStats({ available, inProgress, completed });
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await api.patch(`/orders/delivery/${orderId}/accept`);
      if (response.data.success) {
        toast.success('✅ Pedido aceito! Inicie a entrega.');
        await fetchOrders();
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              emit('location_update', {
                orderId,
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.warn('⚠️ Erro ao obter localização:', error);
            }
          );
        }
      }
    } catch (error) {
      console.error('❌ Error accepting order:', error);
      toast.error(error.response?.data?.error || 'Erro ao aceitar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      const response = await api.patch(`/orders/${orderId}/deliver`);
      if (response.data.success) {
        toast.success('✅ Pedido entregue com sucesso!');
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error marking delivered:', error);
      toast.error('Erro ao marcar como entregue');
    }
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleCloseDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'ready': { 
        label: 'Pronto para Entrega', 
        icon: <CheckIcon />, 
        color: '#4CAF50',
        bgColor: '#4CAF5020',
        borderColor: '#4CAF50'
      },
      'sent': { 
        label: 'Em Rota', 
        icon: <MotorcycleIcon />, 
        color: '#FF9800',
        bgColor: '#FF980020',
        borderColor: '#FF9800'
      },
      'in_progress': { 
        label: 'Em Progresso', 
        icon: <TimerIcon />, 
        color: '#2196F3',
        bgColor: '#2196F320',
        borderColor: '#2196F3'
      },
      'delivered': { 
        label: 'Entregue', 
        icon: <DoneIcon />, 
        color: '#4CAF50',
        bgColor: '#4CAF5010',
        borderColor: '#4CAF50'
      },
      'cancelled': { 
        label: 'Cancelado', 
        icon: <CancelIcon />, 
        color: '#F44336',
        bgColor: '#F4433620',
        borderColor: '#F44336'
      },
    };
    return statusMap[status] || { 
      label: status, 
      icon: <CheckIcon />, 
      color: '#9E9E9E',
      bgColor: '#9E9E9E20',
      borderColor: '#9E9E9E'
    };
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return new Date(date).toLocaleDateString('pt-MZ');
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <LoadingSkeleton type="order" count={3} />
      </div>
    );
  }

  return (
    <div style={{ 
      paddingBottom: '80px',
      background: 'var(--bg)',
      minHeight: '100vh'
    }}>
      {/* Header com gradiente */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        padding: 'var(--spacing-lg) var(--spacing-md)',
        paddingTop: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-lg)',
        borderRadius: '0 0 30px 30px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)',
          }}>
            <div>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Entregas
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.9rem',
              }}>
                {orders.length} pedido{orders.length !== 1 ? 's' : ''} no total
              </p>
            </div>
            <button
              onClick={fetchOrders}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                transition: 'all var(--transition-normal)',
              }}
            >
              <RefreshIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--spacing-sm)',
            marginTop: 'var(--spacing-md)',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md)',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <CheckIcon style={{ fontSize: 24, color: '#4CAF50' }} />
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'white',
                marginTop: 'var(--spacing-xs)',
              }}>
                {stats.available}
              </h3>
              <p style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Disponíveis</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md)',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <MotorcycleIcon style={{ fontSize: 24, color: '#FF9800' }} />
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'white',
                marginTop: 'var(--spacing-xs)',
              }}>
                {stats.inProgress}
              </h3>
              <p style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Em Rota</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md)',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <DoneIcon style={{ fontSize: 24, color: '#4CAF50' }} />
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'white',
                marginTop: 'var(--spacing-xs)',
              }}>
                {stats.completed}
              </h3>
              <p style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Entregues</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <AnimatedButton
            variant="primary"
            onClick={() => navigate('/delivery/map')}
            icon={<MapIcon />}
          >
            Ver Mapa
          </AnimatedButton>
          <AnimatedButton
            variant="secondary"
            onClick={() => navigate('/delivery/scan')}
            icon={<ScanIcon />}
          >
            Scanear QR
          </AnimatedButton>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-md)',
          overflowX: 'auto',
          padding: 'var(--spacing-xs) 0',
          scrollbarWidth: 'none',
        }}>
          {[
            { id: 'all', label: 'Todos', icon: <FilterIcon style={{ fontSize: 18 }} /> },
            { id: 'available', label: 'Disponíveis', icon: <CheckIcon style={{ fontSize: 18 }} /> },
            { id: 'my', label: 'Minhas Entregas', icon: <HistoryIcon style={{ fontSize: 18 }} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                border: filter === tab.id ? 'none' : '1px solid var(--border)',
                background: filter === tab.id 
                  ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                  : 'var(--glass-bg)',
                color: filter === tab.id ? 'white' : 'var(--text)',
                fontWeight: filter === tab.id ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                boxShadow: filter === tab.id ? '0 4px 16px rgba(21, 101, 192, 0.3)' : 'none',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <GlassCard style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-xxl) var(--spacing-lg)',
            background: 'var(--glass-bg)',
          }}>
            <div style={{ 
              fontSize: 64, 
              marginBottom: 'var(--spacing-md)',
              opacity: 0.5,
            }}>🛵</div>
            <h3 style={{ 
              fontSize: '1.2rem', 
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 'var(--spacing-sm)',
            }}>
              {filter === 'available' ? 'Nenhum pedido disponível' :
               filter === 'my' ? 'Nenhuma entrega em andamento' :
               'Nenhum pedido encontrado'}
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.95rem',
            }}>
              {filter === 'available' ? 'Aguardando pedidos prontos para entrega...' :
               filter === 'my' ? 'Aceite um pedido para começar' :
               'Os pedidos aparecerão aqui'}
            </p>
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {filteredOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const isMyOrder = order.delivery_id;
              const isAvailable = order.status === 'ready' && !order.delivery_id;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <GlassCard style={{
                    padding: 0,
                    overflow: 'hidden',
                    opacity: order.status === 'delivered' ? 0.7 : 1,
                    border: isMyOrder && order.status !== 'delivered' 
                      ? '2px solid var(--secondary)' 
                      : '1px solid var(--border)',
                    transition: 'all var(--transition-normal)',
                  }}>
                    {/* Card Header com gradiente de status */}
                    <div style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      background: `linear-gradient(135deg, ${statusInfo.color}20, transparent)`,
                      borderBottom: `1px solid ${statusInfo.borderColor}30`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-sm)',
                        }}>
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'var(--text)',
                          }}>
                            Pedido #{order.order_number}
                          </span>
                          {isMyOrder && order.status !== 'ready' && order.status !== 'delivered' && (
                            <span style={{
                              fontSize: '0.65rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--secondary)20',
                              color: 'var(--secondary)',
                              fontWeight: 600,
                            }}>
                              Minha Entrega
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          marginTop: '2px',
                        }}>
                          {getTimeAgo(order.created_at)}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: '4px 14px',
                        borderRadius: 'var(--radius-full)',
                        background: statusInfo.bgColor,
                        border: `1px solid ${statusInfo.borderColor}30`,
                        color: statusInfo.color,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
                      {/* Cliente Info */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--spacing-xs)',
                        marginBottom: 'var(--spacing-sm)',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-xs)',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                        }}>
                          <PersonIcon style={{ fontSize: 16 }} />
                          <span>{order.client_name || 'Cliente'}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-xs)',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                        }}>
                          <PhoneIcon style={{ fontSize: 16 }} />
                          <span>{order.client_phone || 'N/D'}</span>
                        </div>
                      </div>

                      {/* Itens e Total */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--spacing-sm) 0',
                        borderTop: '1px solid var(--border)',
                        borderBottom: '1px solid var(--border)',
                        marginBottom: 'var(--spacing-sm)',
                      }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}
                          </span>
                        </div>
                        <div>
                          <span style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 700, 
                            color: 'var(--secondary)' 
                          }}>
                            {formatPrice(order.total_amount || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Endereço */}
                      {order.delivery_address && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 'var(--spacing-xs)',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          marginBottom: 'var(--spacing-sm)',
                        }}>
                          <LocationIcon style={{ fontSize: 16, marginTop: 2 }} />
                          <span>{order.delivery_address}</span>
                        </div>
                      )}

                      {/* Ações */}
                      <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-sm)',
                        flexWrap: 'wrap',
                        marginTop: 'var(--spacing-sm)',
                      }}>
                        {isAvailable && (
                          <AnimatedButton
                            variant="primary"
                            size="small"
                            onClick={() => handleAcceptOrder(order.id)}
                            icon={<CheckIcon />}
                            style={{ flex: 1 }}
                          >
                            Aceitar Entrega
                          </AnimatedButton>
                        )}

                        {order.status === 'sent' && isMyOrder && (
                          <AnimatedButton
                            variant="success"
                            size="small"
                            onClick={() => handleMarkDelivered(order.id)}
                            icon={<DoneIcon />}
                            style={{ flex: 1 }}
                          >
                            Marcar Entregue
                          </AnimatedButton>
                        )}

                        {order.status === 'in_progress' && isMyOrder && (
                          <div style={{ 
                            flex: 1, 
                            textAlign: 'center', 
                            color: 'var(--text-secondary)',
                            padding: '8px',
                            background: 'var(--glass-bg)',
                            borderRadius: 'var(--radius-md)',
                          }}>
                            <TimerIcon style={{ fontSize: 18 }} />
                            <p style={{ fontSize: '0.8rem', marginTop: 'var(--spacing-xs)' }}>
                              Aguardando confirmação do cliente
                            </p>
                          </div>
                        )}

                        {order.status === 'delivered' && isMyOrder && (
                          <div style={{ 
                            flex: 1, 
                            textAlign: 'center', 
                            color: 'var(--success)',
                            padding: '8px',
                            background: 'var(--success)10',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--success)30',
                          }}>
                            <DoneIcon style={{ fontSize: 18 }} />
                            <p style={{ fontSize: '0.8rem', marginTop: 'var(--spacing-xs)' }}>
                              Entregue em {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString('pt-MZ') : 'hoje'}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => handleOpenDetail(order)}
                          style={{
                            padding: '8px 16px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            color: 'var(--text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                            transition: 'all var(--transition-normal)',
                            flex: isAvailable || order.status === 'sent' ? 0.4 : 1,
                          }}
                        >
                          <ReceiptIcon style={{ fontSize: 16 }} />
                          Detalhes
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div
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
          onClick={handleCloseDetail}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-xl)',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-md)',
            }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                Pedido #{selectedOrder.order_number}
              </h3>
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
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-xs)',
                padding: 'var(--spacing-sm)',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cliente</p>
                  <p style={{ fontWeight: 500 }}>{selectedOrder.client_name || 'Cliente'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Telefone</p>
                  <p style={{ fontWeight: 500 }}>{selectedOrder.client_phone || 'N/D'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status</p>
                  <p style={{ 
                    fontWeight: 500,
                    color: getStatusInfo(selectedOrder.status).color,
                  }}>
                    {getStatusInfo(selectedOrder.status).label}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Data</p>
                  <p style={{ fontWeight: 500 }}>
                    {new Date(selectedOrder.created_at).toLocaleString('pt-MZ')}
                  </p>
                </div>
              </div>
              {selectedOrder.delivery_address && (
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--glass-bg)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Endereço</p>
                  <p style={{ fontWeight: 500 }}>{selectedOrder.delivery_address}</p>
                </div>
              )}
              {selectedOrder.delivered_at && (
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--success)10',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--success)30',
                }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Entregue em</p>
                  <p style={{ fontWeight: 500 }}>
                    {new Date(selectedOrder.delivered_at).toLocaleString('pt-MZ')}
                  </p>
                </div>
              )}
            </div>

            <div style={{
              padding: 'var(--spacing-md)',
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)',
            }}>
              <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>
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
                    {formatPrice(item.total_price || (item.price * item.quantity))}
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
                  {formatPrice(selectedOrder.total_amount)}
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
                  <span>{formatPrice(selectedOrder.delivery_fee)}</span>
                </div>
              )}
            </div>

            <AnimatedButton
              variant="secondary"
              onClick={handleCloseDetail}
              fullWidth
            >
              Fechar
            </AnimatedButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;