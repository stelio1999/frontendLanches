// src/hooks/useSocket.js//
import { useSocket as useSocketContext } from '../contexts/SocketContext';

export const useSocket = () => {
  const context = useSocketContext();
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export default useSocket;