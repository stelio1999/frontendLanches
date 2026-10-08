// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // Verificar se existem dados
        if (!storedToken || !storedUser || storedUser === 'undefined' || storedUser === 'null') {
          // Limpar dados inválidos
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }

        // Configurar token no axios ANTES de validar
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        // Validar token no backend
        try {
          const response = await api.get('/auth/verify');

          if (response.data.success) {
            const userData = response.data.data.user;

            // Atualizar dados do usuário
            setToken(storedToken);
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Token inválido, limpar
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
          }
        } catch (verifyError) {
          console.error('Token inválido ou expirado:', verifyError);
          // Se o token for inválido/expirado, limpar
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (phone, name = '') => {
    try {
      const response = await api.post('/auth/login/phone', { phone, name });
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      setIsAuthenticated(true);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.error || 'Erro ao fazer login' };
    }
  };


  const loginWithPassword = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', {
        phone: identifier.includes('@') ? undefined : identifier,
        email: identifier.includes('@') ? identifier : undefined,
        password
      });
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      setIsAuthenticated(true);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);

      // Extrair mensagem de erro específica do backend
      let errorMessage = 'Erro ao fazer login';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Credenciais inválidas. Verifique o email e a senha.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuário não encontrado.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tempo de conexão esgotado. Tente novamente.';
      } else if (!error.response) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      login,
      loginWithPassword,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};