// src/pages/DeliveryApp.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import DeliveryHeader from '../components/delivery/DeliveryHeader';
import DeliveryDashboard from '../components/delivery/DeliveryDashboard';
import DeliveryMap from '../components/delivery/DeliveryMap';
import OrderList from '../components/delivery/OrderList';
import QRScanner from '../components/delivery/QRScanner';
import BottomNavigation from '../components/common/BottomNavigation';
import toast from 'react-hot-toast';

const DeliveryApp = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { on, off, emit } = useSocket();
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    // Watch location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          emit('location_update', {
            orderId: 'active',
            lat: latitude,
            lng: longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [emit]);

  useEffect(() => {
    const handleNewOrder = (data) => {
      toast.success(`Novo pedido #${data.orderNumber} disponível`);
    };

    on('new_order_available', handleNewOrder);

    return () => {
      off('new_order_available', handleNewOrder);
    };
  }, [on, off]);

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      <DeliveryHeader />
      
      <Routes>
        <Route path="/" element={<DeliveryDashboard />} />
        <Route path="/map" element={<DeliveryMap currentLocation={currentLocation} />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/scan" element={<QRScanner />} />
      </Routes>

      <BottomNavigation userType="delivery" />
    </div>
  );
};

export default DeliveryApp;