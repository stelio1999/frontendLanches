// src/contexts/SocketContext.jsx//
import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.connect();

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
      setConnected(true);
      
      newSocket.emit('identify', {
        userId: user.id,
        userType: user.userType
      });

      toast.success('Conectado ao servidor', {
        icon: '🔌',
        duration: 2000,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setConnected(false);
    });

    newSocket.on('notification', (data) => {
      console.log('📨 Notification:', data);
      toast(data.message, {
        icon: data.icon || '📨',
        duration: 5000,
        style: {
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
        },
      });
    });

    newSocket.on('order_status_update', (data) => {
      const statusMessages = {
        'received': '📦 Pedido recebido!',
        'preparing': '👨‍🍳 Pedido em preparação!',
        'ready': '✅ Pedido pronto!',
        'sent': '🚚 Pedido enviado!',
        'delivered': '📬 Pedido entregue!',
        'cancelled': '❌ Pedido cancelado!',
      };
      
      toast(statusMessages[data.status] || `Status atualizado: ${data.status}`, {
        duration: 5000,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  const value = {
    socket,
    connected,
    emit: (event, data) => {
      if (socket && connected) {
        socket.emit(event, data);
      }
    },
    on: (event, callback) => {
      if (socket) {
        socket.on(event, callback);
        return () => socket.off(event);
      }
      return () => {};
    },
    off: (event) => {
      if (socket) {
        socket.off(event);
      }
    },
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};