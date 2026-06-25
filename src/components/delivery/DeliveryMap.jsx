// src/components/delivery/DeliveryMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import GlassCard from '../common/GlassCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  MyLocation as MyLocationIcon,
  CenterFocusStrong as CenterIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Layers as LayersIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Directions as DirectionsIcon,
  Route as RouteIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

// Ícones customizados
const deliveryIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Criar ícone personalizado para destino
const createDestinationIcon = (color = '#4CAF50') => {
  return divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 1.5s ease-in-out infinite;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Criar ícone para waypoints
const createWaypointIcon = (index) => {
  return divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: #1565c0;
        color: white;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
      ">
        ${index}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const DeliveryMap = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { on, off, emit } = useSocket();
  const mapRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [route, setRoute] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);

  useEffect(() => {
  let watchId = null;

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setCurrentLocation({
          lat: latitude,
          lng: longitude
        });

        emit('location_update', {
          lat: latitude,
          lng: longitude
        });
      },
      (error) => {
        console.warn(error);

        setCurrentLocation({
          lat: -25.9692,
          lng: 32.5732
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  } else {
    setCurrentLocation({
      lat: -25.9692,
      lng: 32.5732
    });
  }

  // AGORA EXECUTA
  fetchMyOrders();

  const handleOrderUpdate = (data) => {
    if (data.status === 'sent' || data.status === 'in_progress') {
      fetchMyOrders();
    }
  };

  on('order_status_update', handleOrderUpdate);

  return () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    off('order_status_update', handleOrderUpdate);
  };
}, []);
  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/delivery?status=my');
      if (response.data.success) {
        const myOrders = response.data.data.filter(o => 
          o.delivery_id === user.id && 
          (o.status === 'sent' || o.status === 'in_progress')
        );
        setOrders(myOrders);
        
        // Se houver pedidos, calcular rota para o primeiro
        if (myOrders.length > 0) {
          await fetchRealRoute(myOrders[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching my orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar rota real usando OSRM API
  const fetchRealRoute = async (order) => {
    if (!currentLocation || !order.delivery_lat || !order.delivery_lng) return;

    setLoadingRoute(true);
    
    try {
      const start = `${currentLocation.lng},${currentLocation.lat}`;
      const end = `${order.delivery_lng},${order.delivery_lat}`;
      
      // Usar OSRM API para calcular rota real
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson&steps=true`
      );
      
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Extrair pontos da rota
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoute(coordinates);
        
        // Distância em km
        const distance = route.distance / 1000;
        setRouteDistance(Math.round(distance * 10) / 10);
        
        // Duração em minutos
        const duration = route.duration / 60;
        setRouteDuration(Math.round(duration));
        
        // Instruções da rota
        const instructions = route.legs[0].steps.map(step => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration
        }));
        setRouteInstructions(instructions);
        
        // Ajustar o mapa para mostrar toda a rota
        if (mapRef.current && coordinates.length > 0) {
          const bounds = coordinates.map(coord => [coord[0], coord[1]]);
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        // Fallback: rota simples se OSRM falhar
        generateSimpleRoute(order);
      }
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
      // Fallback: rota simples
      generateSimpleRoute(order);
    } finally {
      setLoadingRoute(false);
    }
  };

  // Rota simples (fallback) - linha reta com curvatura
  const generateSimpleRoute = (order) => {
    if (!currentLocation || !order.delivery_lat || !order.delivery_lng) return;

    const start = [currentLocation.lat, currentLocation.lng];
    const end = [order.delivery_lat, order.delivery_lng];
    
    const points = [];
    const steps = 30;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Adicionar curvatura para simular ruas
      const lat = start[0] + (end[0] - start[0]) * t + Math.sin(t * Math.PI * 1.5) * 0.002;
      const lng = start[1] + (end[1] - start[1]) * t + Math.cos(t * Math.PI * 1.5) * 0.002;
      points.push([lat, lng]);
    }
    
    setRoute(points);
    
    const distance = calculateDistance(start[0], start[1], end[0], end[1]);
    setRouteDistance(Math.round(distance * 10) / 10);
    setRouteDuration(Math.round(distance / 30 * 60));
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

  const handleOrderSelect = async (order) => {
    setSelectedOrder(order);
    await fetchRealRoute(order);
  };

  const centerMap = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.setView([currentLocation.lat, currentLocation.lng], 15);
    }
  };

  const zoomIn = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      mapRef.current.setZoom(zoom + 1);
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      mapRef.current.setZoom(zoom - 1);
    }
  };

  const openRouteInOSM = () => {
    if (selectedOrder && currentLocation) {
      const url = `https://www.openstreetmap.org/directions?from=&to=${selectedOrder.delivery_lat},${selectedOrder.delivery_lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 'var(--spacing-lg)' }}>
        <LoadingSkeleton type="map" />
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
    }}>
      {/* Mapa */}
      <MapContainer
        ref={mapRef}
        center={[currentLocation?.lat || -25.9692, currentLocation?.lng || 32.5732]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Rota real - Linha grossa destacando a via */}
        {route.length > 0 && (
          <>
            {/* Sombra da rota - mais grossa para destaque */}
            <Polyline
              positions={route}
              color="rgba(21, 101, 192, 0.15)"
              weight={20}
              opacity={0.4}
              smoothFactor={1}
            />
            {/* Linha principal da rota */}
            <Polyline
              positions={route}
              color="#1a237e"
              weight={8}
              opacity={0.8}
              smoothFactor={1}
            />
            {/* Linha de destaque - com efeito de brilho */}
            <Polyline
              positions={route}
              color="#42a5f5"
              weight={4}
              opacity={0.9}
              smoothFactor={1}
              dashArray="15, 10"
            />
            {/* Efeito de glow na rota */}
            <Polyline
              positions={route}
              color="#1565c0"
              weight={12}
              opacity={0.15}
              smoothFactor={1}
            />
          </>
        )}

        {/* Waypoints (pontos de referência da rota) */}
        {route.length > 0 && route.map((point, index) => {
          // Mostrar apenas alguns waypoints para não poluir
          if (index % 5 === 0 && index > 0 && index < route.length - 1) {
            return (
              <Marker
                key={index}
                position={point}
                icon={createWaypointIcon(Math.round(index / 5))}
              />
            );
          }
          return null;
        })}

        {/* Localização atual do delivery */}
        {currentLocation && (
          <>
            <Circle
              center={[currentLocation.lat, currentLocation.lng]}
              radius={30}
              color="#1565c0"
              fillColor="#1565c0"
              fillOpacity={0.15}
              weight={2}
            />
            <Circle
              center={[currentLocation.lat, currentLocation.lng]}
              radius={10}
              color="#1565c0"
              fillColor="#1565c0"
              fillOpacity={0.4}
              weight={2}
            />
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={deliveryIcon}
            >
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>📍 Sua Localização</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Destinos dos pedidos */}
        {orders.map((order) => (
          order.delivery_lat && order.delivery_lng && (
            <React.Fragment key={order.id}>
              {/* Círculo de raio no destino */}
              <Circle
                center={[order.delivery_lat, order.delivery_lng]}
                radius={80}
                color={selectedOrder?.id === order.id ? '#FF6F00' : '#4CAF50'}
                fillColor={selectedOrder?.id === order.id ? '#FF6F00' : '#4CAF50'}
                fillOpacity={0.08}
                weight={2}
                dashArray="5, 5"
              />
              <Marker
                position={[order.delivery_lat, order.delivery_lng]}
                icon={createDestinationIcon(
                  selectedOrder?.id === order.id ? '#FF6F00' : '#4CAF50'
                )}
                eventHandlers={{
                  click: () => handleOrderSelect(order),
                }}
              >
                <Popup>
                  <div style={{ minWidth: '220px' }}>
                    <strong style={{ fontSize: '1rem' }}>
                      📦 Pedido #{order.order_number}
                    </strong>
                    <div style={{ marginTop: 'var(--spacing-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <PersonIcon style={{ fontSize: 16, color: 'var(--text-secondary)' }} />
                        <span>{order.client_name || 'Cliente'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <PhoneIcon style={{ fontSize: 16, color: 'var(--text-secondary)' }} />
                        <span>{order.client_phone || 'N/D'}</span>
                      </div>
                      {order.delivery_address && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
                          <LocationIcon style={{ fontSize: 16, color: 'var(--text-secondary)' }} />
                          <span style={{ fontSize: '0.85rem' }}>{order.delivery_address}</span>
                        </div>
                      )}
                    </div>
                    {selectedOrder?.id === order.id && routeDistance && (
                      <div style={{
                        marginTop: 'var(--spacing-sm)',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        background: 'var(--glass-bg)',
                        borderRadius: 'var(--radius-sm)',
                      }}>
                        <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                          <SpeedIcon style={{ fontSize: 14 }} />
                          <strong>Distância:</strong> {routeDistance} km
                        </p>
                        <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                          <TimerIcon style={{ fontSize: 14 }} />
                          <strong>Tempo estimado:</strong> {routeDuration} min
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        const url = `https://www.openstreetmap.org/directions?from=&to=${order.delivery_lat},${order.delivery_lng}`;
                        window.open(url, '_blank');
                      }}
                      style={{
                        marginTop: 'var(--spacing-sm)',
                        padding: '6px 16px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        width: '100%',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-xs)',
                      }}
                    >
                      <DirectionsIcon style={{ fontSize: 16 }} />
                      Abrir Rota
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          )
        ))}
      </MapContainer>

      {/* Controles do Mapa */}
      <div style={{
        position: 'absolute',
        top: 'var(--spacing-md)',
        right: 'var(--spacing-md)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
      }}>
        <button
          onClick={centerMap}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text)',
            transition: 'all var(--transition-normal)',
          }}
        >
          <MyLocationIcon />
        </button>
        <button
          onClick={zoomIn}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text)',
            transition: 'all var(--transition-normal)',
          }}
        >
          <ZoomInIcon />
        </button>
        <button
          onClick={zoomOut}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text)',
            transition: 'all var(--transition-normal)',
          }}
        >
          <ZoomOutIcon />
        </button>
        <button
          onClick={fetchMyOrders}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text)',
            transition: 'all var(--transition-normal)',
          }}
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Painel de Informações da Rota */}
      {selectedOrder && route.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'var(--spacing-md)',
          left: 'var(--spacing-md)',
          zIndex: 1000,
          maxWidth: '280px',
          width: '100%',
        }}>
          <GlassCard style={{ padding: 'var(--spacing-md)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-sm)',
            }}>
              <RouteIcon style={{ color: 'var(--secondary)' }} />
              <h4 style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Rota para Pedido #{selectedOrder.order_number}
              </h4>
            </div>
            {loadingRoute ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                <div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                  Calculando rota...
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--spacing-xs)',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  <div style={{
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Distância</p>
                    <p style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                      {routeDistance} km
                    </p>
                  </div>
                  <div style={{
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Tempo Estimado</p>
                    <p style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                      {routeDuration} min
                    </p>
                  </div>
                </div>
                
              </>
            )}
          </GlassCard>
        </div>
      )}

      {/* Painel Inferior - Lista de Pedidos */}
      {orders.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: 'var(--spacing-md)',
          background: 'linear-gradient(to top, var(--surface) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}>
          <div style={{
            pointerEvents: 'auto',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            <GlassCard style={{
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-xl)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-sm)',
              }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  🛵 {orders.length} Entrega{orders.length > 1 ? 's' : ''} em Rota
                </h4>
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                }}>
                  {new Date().toLocaleTimeString('pt-MZ')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleOrderSelect(order)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      background: selectedOrder?.id === order.id 
                        ? 'var(--secondary)20' 
                        : 'var(--glass-bg)',
                      border: selectedOrder?.id === order.id 
                        ? '2px solid var(--secondary)' 
                        : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: 'var(--text)',
                      transition: 'all var(--transition-normal)',
                      width: '100%',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        Pedido #{order.order_number}
                      </span>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {order.client_name || 'Cliente'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: order.status === 'sent' ? 'var(--warning)20' : 'var(--info)20',
                        color: order.status === 'sent' ? 'var(--warning)' : 'var(--info)',
                      }}>
                        {order.status === 'sent' ? 'Em Rota' : 'Em Progresso'}
                      </span>
                      <DirectionsIcon style={{ fontSize: 16, color: 'var(--secondary)' }} />
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Nenhum pedido */}
      {orders.length === 0 && !loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          textAlign: 'center',
          width: '80%',
          maxWidth: '320px',
        }}>
          <GlassCard style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{ fontSize: 48, marginBottom: 'var(--spacing-md)' }}>🗺️</div>
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: 600,
              marginBottom: 'var(--spacing-sm)',
            }}>
              Nenhuma Entrega em Rota
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}>
              Aceite um pedido para ver a rota no mapa
            </p>
            <button
              onClick={() => navigate('/delivery')}
              style={{
                marginTop: 'var(--spacing-md)',
                padding: '10px 24px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all var(--transition-normal)',
              }}
            >
              Ver Pedidos
            </button>
          </GlassCard>
        </div>
      )}

      <style>{`
        .leaflet-container {
          background: var(--bg);
        }
        .leaflet-control-zoom a {
          background: var(--surface) !important;
          color: var(--text) !important;
          border-color: var(--border) !important;
        }
        .leaflet-popup-content-wrapper {
          background: var(--surface) !important;
          color: var(--text) !important;
          border-radius: var(--radius-md) !important;
          box-shadow: var(--shadow-lg) !important;
          border: 1px solid var(--border) !important;
        }
        .leaflet-popup-tip {
          background: var(--surface) !important;
        }
        .leaflet-control-attribution {
          background: var(--surface) !important;
          color: var(--text-secondary) !important;
          font-size: 8px !important;
        }
        .custom-div-icon {
          background: transparent;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        /* Scrollbar personalizada para o painel de pedidos */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: var(--glass-bg);
          border-radius: var(--radius-full);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--secondary);
          border-radius: var(--radius-full);
        }
      `}</style>
    </div>
  );
};

export default DeliveryMap;