// src/components/client/OrderTracking.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import QRCode from '../shared/QRCode';
import Map from '../shared/Map';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { 
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  LocalShipping as ShippingIcon,
  Restaurant as RestaurantIcon,
  Cancel as CancelIcon,
  Map as MapIcon,
  QrCode as QrCodeIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Route as RouteIcon
} from '@mui/icons-material';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { on, off } = useSocket();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryRoute, setDeliveryRoute] = useState([]);
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [deliveryETA, setDeliveryETA] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Listen for order updates
    const handleOrderUpdate = (data) => {
      setOrders(prev => prev.map(order => 
        order.id === data.orderId ? { ...order, status: data.status } : order
      ));
      toast.success(`Status atualizado: ${data.status}`);
      
      // Se o pedido foi enviado, começar a rastrear
      if (data.status === 'sent') {
        setIsTracking(true);
        startTracking(data.orderId);
      }
      
      // Se o pedido foi entregue, parar rastreamento
      if (data.status === 'delivered') {
        setIsTracking(false);
        setDeliveryLocation(null);
        setDeliveryRoute([]);
      }
    };

    // Listen for delivery location updates
    const handleDeliveryLocation = (data) => {
      console.log('📍 Localização do delivery recebida:', data);
      setDeliveryLocation({ lat: data.lat, lng: data.lng });
      
      // Atualizar rota se tiver delivery_location e destino
      if (selectedOrder?.delivery_lat && selectedOrder?.delivery_lng) {
        updateRoute(data.lat, data.lng, selectedOrder.delivery_lat, selectedOrder.delivery_lng);
      }
    };

    on('order_status_update', handleOrderUpdate);
    on('delivery_location', handleDeliveryLocation);

    return () => {
      off('order_status_update', handleOrderUpdate);
      off('delivery_location', handleDeliveryLocation);
    };
  }, [on, off, selectedOrder]);

  const startTracking = (orderId) => {
    // Emitir para o servidor que o cliente está rastreando o pedido
    const socket = useSocket();
    socket.emit('track_order', { orderId });
  };

  const updateRoute = (startLat, startLng, endLat, endLng) => {
    // Gerar pontos da rota (simulação)
    const points = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = startLat + (endLat - startLat) * t + Math.sin(t * Math.PI * 2) * 0.001;
      const lng = startLng + (endLng - startLng) * t + Math.cos(t * Math.PI * 2) * 0.001;
      points.push([lat, lng]);
    }
    
    setDeliveryRoute(points);
    
    // Calcular distância aproximada
    const distance = calculateDistance(startLat, startLng, endLat, endLng);
    setDeliveryDistance(Math.round(distance * 10) / 10);
    
    // Estimar ETA (assumindo 30km/h)
    const etaMinutes = Math.round((distance / 30) * 60);
    setDeliveryETA(etaMinutes);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/client');
      if (response.data.success) {
        setOrders(response.data.data);
        if (orderId) {
          const order = response.data.data.find(o => o.id === orderId);
          if (order) {
            setSelectedOrder(order);
            // Se o pedido estiver em rota, iniciar tracking
            if (order.status === 'sent' || order.status === 'in_progress') {
              setIsTracking(true);
              startTracking(order.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: 'Pendente', icon: <PendingIcon />, color: '#FFA726', bgColor: '#FFA72620' },
      'received': { label: 'Recebido', icon: <CheckIcon />, color: '#4CAF50', bgColor: '#4CAF5020' },
      'preparing': { label: 'Em Preparação', icon: <RestaurantIcon />, color: '#42A5F5', bgColor: '#42A5F520' },
      'ready': { label: 'Pronto', icon: <CheckIcon />, color: '#66BB6A', bgColor: '#66BB6A20' },
      'sent': { label: 'Em Rota', icon: <ShippingIcon />, color: '#FF9800', bgColor: '#FF980020' },
      'delivered': { label: 'Entregue', icon: <CheckIcon />, color: '#4CAF50', bgColor: '#4CAF5020' },
      'cancelled': { label: 'Cancelado', icon: <CancelIcon />, color: '#EF5350', bgColor: '#EF535020' },
    };
    return statusMap[status] || { label: status, icon: <PendingIcon />, color: '#9E9E9E', bgColor: '#9E9E9E20' };
  };

  const getStatusSteps = (currentStatus) => {
    const steps = ['received', 'preparing', 'ready', 'sent', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    return steps.map((step, index) => ({
      ...getStatusInfo(step),
      status: step,
      isCompleted: index <= currentIndex,
      isActive: index === currentIndex,
    }));
  };

  const handleOpenQRCode = (order) => {
    setSelectedOrder(order);
    setShowQRCode(true);
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false);
  };

  const handleCopyQRCode = () => {
    const qrData = selectedOrder?.id || '';
    navigator.clipboard.writeText(qrData).then(() => {
      toast.success('ID do pedido copiado!');
    }).catch(() => {
      toast.error('Erro ao copiar');
    });
  };

  const handleDownloadQRCode = () => {
    const svgElement = document.querySelector('.qr-code-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `qrcode-pedido-${selectedOrder?.order_number || 'pedido'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('QR Code baixado!');
      };
      
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    }
  };

  const handleShareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code do Pedido',
          text: `Pedido #${selectedOrder?.order_number}`,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Erro ao compartilhar');
        }
      }
    } else {
      handleCopyQRCode();
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    return formatDate(date);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <LoadingSkeleton type="order" count={3} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={{ 
        paddingTop: 'var(--spacing-xxl)',
        textAlign: 'center',
      }}>
        <div style={{ 
          fontSize: 80, 
          marginBottom: 'var(--spacing-md)',
          opacity: 0.3,
        }}>📦</div>
        <h3 style={{ 
          fontSize: '1.3rem', 
          fontWeight: 700, 
          marginBottom: 'var(--spacing-sm)',
          color: 'var(--text)',
        }}>
          Nenhum pedido encontrado
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Você ainda não fez nenhum pedido.
        </p>
        <button
          onClick={() => navigate('/menu')}
          style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(21, 101, 192, 0.3)',
            transition: 'all var(--transition-normal)',
          }}
        >
          Fazer Pedido Agora
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: '80px' }}>
      {/* Header com gradiente */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        margin: '-16px -16px 24px -16px',
        padding: '24px 20px 20px 20px',
        borderRadius: '0 0 30px 30px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-20px',
          width: '120px',
          height: '120px',
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
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '2px',
          }}>
            {selectedOrder ? 'Detalhes do Pedido' : 'Meus Pedidos'}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem',
          }}>
            {selectedOrder 
              ? `Pedido #${selectedOrder.order_number}`
              : `${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'} encontrado${orders.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      </div>

      {selectedOrder && !showQRCode ? (
        // Order Detail View
        <div>
          <button
            onClick={() => setSelectedOrder(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              background: 'none',
              border: 'none',
              color: 'var(--secondary)',
              cursor: 'pointer',
              marginBottom: 'var(--spacing-md)',
              fontSize: '0.9rem',
              fontWeight: 500,
              padding: 'var(--spacing-xs) 0',
            }}
          >
            <ArrowBackIcon style={{ fontSize: 20 }} />
            Voltar para lista
          </button>

          <GlassCard style={{ 
            marginBottom: 'var(--spacing-md)',
            overflow: 'hidden',
            padding: 0,
          }}>
            {/* Card Header com status */}
            <div style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              background: `linear-gradient(135deg, ${getStatusInfo(selectedOrder.status).color}15, transparent)`,
              borderBottom: `2px solid ${getStatusInfo(selectedOrder.status).color}30`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--spacing-sm)',
            }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Pedido #{selectedOrder.order_number}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginTop: '2px' }}>
                  <TimeIcon style={{ fontSize: 14, color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
              </div>
              <div style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                background: getStatusInfo(selectedOrder.status).bgColor,
                color: getStatusInfo(selectedOrder.status).color,
                fontWeight: 600,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                border: `1px solid ${getStatusInfo(selectedOrder.status).color}30`,
              }}>
                {getStatusInfo(selectedOrder.status).icon}
                {getStatusInfo(selectedOrder.status).label}
              </div>
            </div>

            {/* Tracking Info - Mostrar apenas se estiver em rota */}
            {(selectedOrder.status === 'sent' || selectedOrder.status === 'in_progress') && (
              <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: `linear-gradient(135deg, #FF980015, #FFA72610)`,
                borderBottom: `1px solid #FF980030`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF9800, #FFA726)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}>
                      <MyLocationIcon style={{ fontSize: 16 }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Entregador em rota
                      </p>
                      {deliveryDistance && deliveryETA && (
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                          {deliveryDistance} km • ~{deliveryETA} min
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMap(true)}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #FF9800, #FFA726)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      transition: 'all var(--transition-normal)',
                    }}
                  >
                    <MapIcon style={{ fontSize: 16 }} />
                    Ver no Mapa
                  </button>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                padding: '0 var(--spacing-sm)',
              }}>
                {getStatusSteps(selectedOrder.status).map((step, index, array) => (
                  <div key={step.status} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    position: 'relative',
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: step.isCompleted 
                        ? `linear-gradient(135deg, ${step.color}, ${step.color}80)`
                        : 'var(--border)',
                      color: step.isCompleted ? 'white' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      marginBottom: 'var(--spacing-xs)',
                      position: 'relative',
                      zIndex: 2,
                      transition: 'all var(--transition-normal)',
                      boxShadow: step.isActive ? `0 0 0 4px ${step.color}30` : 'none',
                    }}>
                      {step.isCompleted ? <CheckIcon style={{ fontSize: 18 }} /> : step.icon}
                    </div>
                    <span style={{
                      fontSize: '0.6rem',
                      textAlign: 'center',
                      color: step.isActive ? 'var(--text)' : 'var(--text-secondary)',
                      fontWeight: step.isActive ? 700 : 400,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                    }}>
                      {step.label}
                    </span>
                    {index < array.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        top: '18px',
                        left: 'calc(50% + 18px)',
                        right: 'calc(-50% + 18px)',
                        height: '3px',
                        background: step.isCompleted ? step.color : 'var(--border)',
                        zIndex: 1,
                        borderRadius: 'var(--radius-full)',
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div style={{ padding: '0 var(--spacing-lg) var(--spacing-lg)' }}>
              <div style={{
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                border: '1px solid var(--border)',
              }}>
                <h4 style={{ 
                  fontWeight: 600, 
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  fontSize: '0.95rem',
                }}>
                  <ReceiptIcon style={{ fontSize: 18, color: 'var(--secondary)' }} />
                  Itens do Pedido
                </h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-xs) 0',
                    borderBottom: index < selectedOrder.items.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>
                      <strong>{item.quantity}x</strong> {item.title}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
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
              </div>
            </div>

            {/* Actions */}
            <div style={{ 
              padding: '0 var(--spacing-lg) var(--spacing-lg)',
              display: 'flex',
              gap: 'var(--spacing-sm)',
              flexWrap: 'wrap',
            }}>
              {(selectedOrder.status === 'sent' || selectedOrder.status === 'in_progress') && (
                <button
                  onClick={() => setShowMap(true)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-xs)',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #FF9800, #FFA726)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all var(--transition-normal)',
                    fontWeight: 500,
                    boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)',
                  }}
                >
                  <MapIcon style={{ fontSize: 20 }} />
                  Rastrear Entrega
                </button>
              )}
              <button
                onClick={() => handleOpenQRCode(selectedOrder)}
                style={{
                  flex: (selectedOrder.status === 'sent' || selectedOrder.status === 'in_progress') ? 1 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-xs)',
                  padding: '14px',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all var(--transition-normal)',
                  boxShadow: '0 4px 16px rgba(21, 101, 192, 0.3)',
                  fontWeight: 500,
                }}
              >
                <QrCodeIcon style={{ fontSize: 20 }} />
                Meu QR Code
              </button>
            </div>
          </GlassCard>
        </div>
      ) : (
        // Order List - Cards Melhorados
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const isInRoute = order.status === 'sent' || order.status === 'in_progress';
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <GlassCard 
                  onClick={() => setSelectedOrder(order)}
                  style={{ 
                    cursor: 'pointer',
                    overflow: 'hidden',
                    padding: 0,
                    transition: 'all var(--transition-normal)',
                    border: isInRoute ? `2px solid #FF980060` : `2px solid ${statusInfo.color}20`,
                  }}
                >
                  {/* Barra de status no topo */}
                  <div style={{
                    height: '4px',
                    background: isInRoute 
                      ? 'linear-gradient(90deg, #FF9800, #FFA726, #FF9800)'
                      : `linear-gradient(90deg, ${statusInfo.color}, ${statusInfo.color}60)`,
                    animation: isInRoute ? 'pulse 2s ease-in-out infinite' : 'none',
                  }} />
                  
                  <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <div>
                        <h4 style={{ 
                          fontWeight: 700, 
                          fontSize: '1rem',
                          color: 'var(--text)',
                        }}>
                          Pedido #{order.order_number}
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 'var(--spacing-xs)',
                          marginTop: '2px',
                        }}>
                          <TimeIcon style={{ fontSize: 14, color: 'var(--text-secondary)' }} />
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--text-secondary)' 
                          }}>
                            {getTimeAgo(order.created_at)}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 14px',
                        borderRadius: 'var(--radius-full)',
                        background: isInRoute ? '#FF980020' : statusInfo.bgColor,
                        color: isInRoute ? '#FF9800' : statusInfo.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        border: `1px solid ${isInRoute ? '#FF980040' : statusInfo.color + '30'}`,
                      }}>
                        {isInRoute ? <MyLocationIcon style={{ fontSize: 14 }} /> : statusInfo.icon}
                        {isInRoute ? 'Em Rota' : statusInfo.label}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'var(--spacing-sm)',
                      paddingTop: 'var(--spacing-sm)',
                      borderTop: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </span>
                        {order.is_delivery && (
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            background: 'var(--info)20',
                            color: 'var(--info)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}>
                            <ShippingIcon style={{ fontSize: 12 }} />
                            Delivery
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--secondary)',
                      }}>
                        {new Intl.NumberFormat('pt-MZ', {
                          style: 'currency',
                          currency: 'MZN',
                          minimumFractionDigits: 0,
                        }).format(order.total_amount)}
                      </span>
                    </div>

                    {/* Indicador de clique */}
                    <div style={{
                      marginTop: 'var(--spacing-sm)',
                      textAlign: 'right',
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      opacity: 0.5,
                    }}>
                      Clique para ver detalhes →
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Map Modal com Rota e Localização em Tempo Real */}
      <AnimatePresence>
        {showMap && selectedOrder && (
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
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--spacing-md)',
            }}
            onClick={() => setShowMap(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflow: 'hidden',
                border: '1px solid var(--border)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>
                    <RouteIcon style={{ marginRight: 'var(--spacing-xs)', verticalAlign: 'middle', color: 'var(--secondary)' }} />
                    Rastreamento da Entrega
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Pedido #{selectedOrder.order_number}
                    {deliveryLocation && (
                      <span style={{ marginLeft: 'var(--spacing-sm)', color: '#FF9800' }}>
                        • Entregador em rota
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowMap(false)}
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
              <div style={{ height: '400px', position: 'relative' }}>
                <Map 
                  lat={selectedOrder.delivery_lat || -25.9692}
                  lng={selectedOrder.delivery_lng || 32.5732}
                  marker={selectedOrder.delivery_address || 'Local da Entrega'}
                  deliveryLocation={deliveryLocation}
                  route={deliveryRoute}
                  showDelivery={true}
                />
                
                {/* Info overlay no mapa */}
                {deliveryLocation && deliveryDistance && deliveryETA && (
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-md)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Distância</p>
                      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                        {deliveryDistance} km
                      </p>
                    </div>
                    <div style={{ width: '1px', height: '30px', background: 'var(--border)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tempo Estimado</p>
                      <p style={{ fontWeight: 700, fontSize: '1rem', color: '#FF9800' }}>
                        ~{deliveryETA} min
                      </p>
                    </div>
                    <div style={{ width: '1px', height: '30px', background: 'var(--border)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Status</p>
                      <p style={{ fontWeight: 600, fontSize: '0.8rem', color: '#4CAF50' }}>
                        <MyLocationIcon style={{ fontSize: 14, verticalAlign: 'middle' }} />
                        Em Rota
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRCode && selectedOrder && (
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
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--spacing-md)',
            }}
            onClick={handleCloseQRCode}
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
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header com gradiente */}
              <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                margin: '-24px -24px 20px -24px',
                padding: '20px 24px 16px 24px',
                borderRadius: '20px 20px 0 0',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-20px',
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
                      <h3 style={{ 
                        fontWeight: 700, 
                        fontSize: '1.1rem',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                      }}>
                        <QrCodeIcon style={{ fontSize: 24 }} />
                        QR Code do Pedido
                      </h3>
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: 'rgba(255,255,255,0.8)',
                        marginTop: '2px',
                      }}>
                        #{selectedOrder.order_number}
                      </p>
                    </div>
                    <button
                      onClick={handleCloseQRCode}
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
                        transition: 'all var(--transition-normal)',
                      }}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 'var(--spacing-lg)',
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--spacing-md)',
                border: '2px solid var(--border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                <QRCode 
                  value={selectedOrder.id}
                  size={200}
                  label={`Pedido #${selectedOrder.order_number}`}
                  showLabel={true}
                />
              </div>

              {/* Instruções */}
              <div style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-md)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-secondary)',
                }}>
                  📱 Mostre este QR Code ao entregador para confirmar a entrega
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={handleDownloadQRCode}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-xs)',
                    transition: 'all var(--transition-normal)',
                    fontWeight: 500,
                  }}
                >
                  <DownloadIcon style={{ fontSize: 18 }} />
                  Baixar
                </button>
                <button
                  onClick={handleShareQRCode}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-xs)',
                    transition: 'all var(--transition-normal)',
                    fontWeight: 500,
                    boxShadow: '0 4px 16px rgba(21, 101, 192, 0.3)',
                  }}
                >
                  <ShareIcon style={{ fontSize: 18 }} />
                  Compartilhar
                </button>
              </div>

              <button
                onClick={handleCopyQRCode}
                style={{
                  width: '100%',
                  marginTop: 'var(--spacing-sm)',
                  padding: '10px',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-xs)',
                  transition: 'all var(--transition-normal)',
                }}
              >
                <ContentCopyIcon style={{ fontSize: 16 }} />
                Copiar ID do Pedido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;