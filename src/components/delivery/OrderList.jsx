// src/components/delivery/OrderList.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../common/GlassCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import SearchBar from '../client/SearchBar';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  Pending as PendingIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Done as DoneIcon,
  Timer as TimerIcon,
  Directions as DirectionsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const OrderList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();

    // Listen for order updates
    const handleOrderUpdate = (data) => {
      fetchOrders();
    };

    const handleStatusChanged = (data) => {
      if (data.status === 'sent' || data.status === 'delivered' || data.status === 'in_progress') {
        fetchOrders();
      }
    };

    on('order_status_update', handleOrderUpdate);
    on('order_status_changed', handleStatusChanged);

    return () => {
      off('order_status_update', handleOrderUpdate);
      off('order_status_changed', handleStatusChanged);
    };
  }, [on, off]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Buscar todos os pedidos do delivery (aceitos por ele)
      const response = await api.get('/orders/delivery?status=my');
      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        order.client_name?.toLowerCase().includes(query) ||
        order.delivery_address?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: 'Pendente', icon: <PendingIcon />, color: '#FFA500', bgColor: '#FFA50020' },
      'received': { label: 'Recebido', icon: <PendingIcon />, color: '#FF9800', bgColor: '#FF980020' },
      'preparing': { label: 'Preparando', icon: <TimerIcon />, color: '#2196F3', bgColor: '#2196F320' },
      'ready': { label: 'Pronto para Entrega', icon: <CheckIcon />, color: '#4CAF50', bgColor: '#4CAF5020' },
      'sent': { label: 'Em Rota', icon: <DirectionsIcon />, color: '#FF9800', bgColor: '#FF980020' },
      'in_progress': { label: 'Em Progresso', icon: <TimerIcon />, color: '#2196F3', bgColor: '#2196F320' },
      'delivered': { label: 'Entregue', icon: <DoneIcon />, color: '#4CAF50', bgColor: '#4CAF5010' },
      'cancelled': { label: 'Cancelado', icon: <CancelIcon />, color: '#F44336', bgColor: '#F4433620' },
    };
    return statusMap[status] || { 
      label: status, 
      icon: <PendingIcon />, 
      color: '#9E9E9E',
      bgColor: '#9E9E9E20'
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

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
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

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <LoadingSkeleton type="order" count={5} />
      </div>
    );
  }

  return (
    <div style={{ 
      paddingBottom: '80px',
      background: 'var(--bg)',
      minHeight: '100vh'
    }}>
      {/* Header */}
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
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <button
                onClick={() => navigate('/delivery')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all var(--transition-normal)',
                }}
              >
                <ArrowBackIcon />
              </button>
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white',
                }}>
                  Meus Pedidos
                </h1>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.85rem',
                }}>
                  {orders.length} pedido{orders.length !== 1 ? 's' : ''} aceito{orders.length !== 1 ? 's' : ''}
                </p>
              </div>
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
        </div>
      </div>

      <div className="container">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por número, cliente ou endereço..."
        />

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
            { id: 'ready', label: 'Prontos', icon: <CheckIcon style={{ fontSize: 18 }} /> },
            { id: 'sent', label: 'Em Rota', icon: <DirectionsIcon style={{ fontSize: 18 }} /> },
            { id: 'in_progress', label: 'Em Progresso', icon: <TimerIcon style={{ fontSize: 18 }} /> },
            { id: 'delivered', label: 'Entregues', icon: <DoneIcon style={{ fontSize: 18 }} /> },
            { id: 'cancelled', label: 'Cancelados', icon: <CancelIcon style={{ fontSize: 18 }} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: statusFilter === tab.id ? 'none' : '1px solid var(--border)',
                background: statusFilter === tab.id 
                  ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                  : 'var(--glass-bg)',
                color: statusFilter === tab.id ? 'white' : 'var(--text)',
                fontWeight: statusFilter === tab.id ? 600 : 400,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                boxShadow: statusFilter === tab.id ? '0 4px 16px rgba(21, 101, 192, 0.3)' : 'none',
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
          }}>
            <div style={{ fontSize: 64, marginBottom: 'var(--spacing-md)', opacity: 0.5 }}>📋</div>
            <h3 style={{ 
              fontSize: '1.2rem', 
              fontWeight: 600,
              marginBottom: 'var(--spacing-sm)',
            }}>
              {searchQuery ? 'Nenhum pedido encontrado' : 'Nenhum pedido nesta categoria'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {searchQuery ? 'Tente ajustar sua busca' : 'Os pedidos que você aceitou aparecerão aqui'}
            </p>
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {filteredOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const isDelivered = order.status === 'delivered';
              const isInProgress = order.status === 'sent' || order.status === 'in_progress';
              
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
                    opacity: isDelivered ? 0.7 : 1,
                    border: isInProgress ? '2px solid var(--secondary)' : '1px solid var(--border)',
                    transition: 'all var(--transition-normal)',
                  }}>
                    {/* Card Header */}
                    <div style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      background: `linear-gradient(135deg, ${statusInfo.bgColor}, transparent)`,
                      borderBottom: `1px solid ${statusInfo.color}30`,
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
                          {isInProgress && (
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--secondary)20',
                              color: 'var(--secondary)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}>
                              Em Andamento
                            </span>
                          )}
                          {isDelivered && (
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--success)20',
                              color: 'var(--success)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}>
                              Concluído
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
                        border: `1px solid ${statusInfo.color}30`,
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

                      {/* Datas importantes */}
                      <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-md)',
                        flexWrap: 'wrap',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--spacing-sm)',
                      }}>
                        {order.sent_at && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <DirectionsIcon style={{ fontSize: 14, color: 'var(--warning)' }} />
                            Enviado: {new Date(order.sent_at).toLocaleString('pt-MZ')}
                          </span>
                        )}
                        {order.delivered_at && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <DoneIcon style={{ fontSize: 14, color: 'var(--success)' }} />
                            Entregue: {new Date(order.delivered_at).toLocaleString('pt-MZ')}
                          </span>
                        )}
                        {order.cancelled_at && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <CancelIcon style={{ fontSize: 14, color: 'var(--error)' }} />
                            Cancelado: {new Date(order.cancelled_at).toLocaleString('pt-MZ')}
                          </span>
                        )}
                      </div>

                      {/* Ações */}
                      <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-sm)',
                        flexWrap: 'wrap',
                        marginTop: 'var(--spacing-sm)',
                      }}>
                        {order.status === 'sent' && (
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

                        {order.status === 'in_progress' && (
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

                        {order.status === 'delivered' && (
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
                              Entrega concluída
                            </p>
                          </div>
                        )}

                        {order.status === 'cancelled' && (
                          <div style={{ 
                            flex: 1, 
                            textAlign: 'center', 
                            color: 'var(--error)',
                            padding: '8px',
                            background: 'var(--error)10',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--error)30',
                          }}>
                            <CancelIcon style={{ fontSize: 18 }} />
                            <p style={{ fontSize: '0.8rem', marginTop: 'var(--spacing-xs)' }}>
                              Pedido cancelado
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
                            flex: order.status === 'sent' ? 0.4 : 1,
                          }}
                        >
                          <VisibilityIcon style={{ fontSize: 16 }} />
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

        {/* Total de pedidos */}
        {filteredOrders.length > 0 && (
          <div style={{
            marginTop: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Mostrando {filteredOrders.length} de {orders.length} pedido{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
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
              {selectedOrder.cancelled_at && (
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--error)10',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--error)30',
                }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>Cancelado em</p>
                  <p style={{ fontWeight: 500 }}>
                    {new Date(selectedOrder.cancelled_at).toLocaleString('pt-MZ')}
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

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              {selectedOrder.status === 'sent' && (
                <AnimatedButton
                  variant="success"
                  onClick={() => {
                    handleMarkDelivered(selectedOrder.id);
                    handleCloseDetail();
                  }}
                  icon={<DoneIcon />}
                  style={{ flex: 1 }}
                >
                  Marcar Entregue
                </AnimatedButton>
              )}
              <AnimatedButton
                variant="secondary"
                onClick={handleCloseDetail}
                style={{ flex: selectedOrder.status === 'sent' ? 0.5 : 1 }}
              >
                Fechar
              </AnimatedButton>
            </div>

            {selectedOrder.delivery_lat && selectedOrder.delivery_lng && (
              <button
                onClick={() => {
                  const url = `https://www.openstreetmap.org/directions?from=&to=${selectedOrder.delivery_lat},${selectedOrder.delivery_lng}`;
                  window.open(url, '_blank');
                }}
                style={{
                  marginTop: 'var(--spacing-sm)',
                  width: '100%',
                  padding: '8px',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-xs)',
                  fontSize: '0.85rem',
                  transition: 'all var(--transition-normal)',
                }}
              >
                <LocationIcon style={{ fontSize: 16 }} />
                Ver Localização no Mapa
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;