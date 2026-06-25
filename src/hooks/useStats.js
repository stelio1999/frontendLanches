// src/hooks/useStats.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useStats = () => {
  const [stats, setStats] = useState({
    ordersDelivered: 0,
    availableProducts: 0,
    averageRating: 0,
    totalOrders: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/public');
        setStats({
          ...response.data.data,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar estatísticas'
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};