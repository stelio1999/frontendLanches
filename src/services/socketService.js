// src/services/socketService.js
let io;

export const initSocket = (server) => {
  io = server;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Cliente se identifica
    socket.on('identify', (data) => {
      const { userId, userType } = data;
      
      if (userType === 'client') {
        socket.join(`client_${userId}`);
        console.log(`📱 Client ${userId} joined client_${userId}`);
      } else if (userType === 'kitchen') {
        socket.join('kitchen');
        console.log('🍳 Kitchen connected');
      } else if (userType === 'delivery') {
        socket.join('delivery');
        console.log('🚚 Delivery connected');
      }
    });

    // Cliente segue pedido específico - NOVO
    socket.on('track_order', ({ orderId }) => {
      socket.join(`order_${orderId}`);
      console.log(`📦 Cliente rastreando pedido ${orderId}`);
    });

    // Delivery atualiza localização - ENVIAR PARA CLIENTES
    socket.on('location_update', (data) => {
      const { orderId, lat, lng } = data;
      console.log(`📍 Delivery atualizou localização para pedido ${orderId}:`, { lat, lng });
      
      // Enviar para o cliente que está rastreando o pedido
      io.to(`order_${orderId}`).emit('delivery_location', { lat, lng });
      
      // Também enviar para o cliente específico
      io.to(`client_${orderId}`).emit('delivery_location', { lat, lng });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};