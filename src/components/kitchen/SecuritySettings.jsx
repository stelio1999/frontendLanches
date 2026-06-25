// src/components/kitchen/SecuritySettings.jsx//
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import AnimatedButton from '../common/AnimatedButton';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const SecuritySettings = () => {
  const { user, updateUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newEmail: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!formData.newEmail) {
      toast.error('Email é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/profile', {
        email: formData.newEmail
      });
      if (response.data.success) {
        toast.success('Email atualizado com sucesso!');
        updateUser(response.data.data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword) {
      toast.error('Senha atual é obrigatória');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/profile', {
        password: formData.newPassword
      });
      if (response.data.success) {
        toast.success('Senha atualizada com sucesso!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: '80px' }}>
      <h1 style={{
        fontSize: '1.8rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary-light))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Segurança
      </h1>

      {/* Update Email */}
      <GlassCard style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 600,
          marginBottom: 'var(--spacing-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
        }}>
          <EmailIcon style={{ color: 'var(--secondary)' }} />
          Alterar Email
        </h3>
        <form onSubmit={handleUpdateEmail}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-secondary)',
            }}>
              Novo Email
            </label>
            <input
              type="email"
              name="newEmail"
              value={formData.newEmail}
              onChange={handleChange}
              placeholder="seu@email.com"
              style={{
                width: '100%',
                padding: '10px var(--spacing-md)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                color: 'var(--text)',
                outline: 'none',
                transition: 'all var(--transition-normal)',
              }}
              required
            />
          </div>
          <AnimatedButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            icon={<CheckIcon />}
          >
            Atualizar Email
          </AnimatedButton>
        </form>
      </GlassCard>

      {/* Update Password */}
      <GlassCard>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 600,
          marginBottom: 'var(--spacing-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
        }}>
          <LockIcon style={{ color: 'var(--secondary)' }} />
          Alterar Senha
        </h3>
        <form onSubmit={handleUpdatePassword}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-secondary)',
            }}>
              Senha Atual *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Digite sua senha atual"
              style={{
                width: '100%',
                padding: '10px var(--spacing-md)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                color: 'var(--text)',
                outline: 'none',
                transition: 'all var(--transition-normal)',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-secondary)',
            }}>
              Nova Senha *
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 var(--spacing-md)',
              transition: 'all var(--transition-normal)',
            }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1rem',
                  color: 'var(--text)',
                  outline: 'none',
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 'var(--spacing-xs)',
                }}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-secondary)',
            }}>
              Confirmar Nova Senha *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme sua nova senha"
              style={{
                width: '100%',
                padding: '10px var(--spacing-md)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                color: 'var(--text)',
                outline: 'none',
                transition: 'all var(--transition-normal)',
              }}
              required
            />
          </div>

          <AnimatedButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            icon={<CheckIcon />}
          >
            Atualizar Senha
          </AnimatedButton>
        </form>

        <div style={{
          marginTop: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          background: 'var(--warning)20',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--warning)40',
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--warning)' }}>
            ⚠️ Dica de Segurança
          </h4>
          <ul style={{
            marginTop: 'var(--spacing-xs)',
            paddingLeft: 'var(--spacing-md)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
          }}>
            <li>Use uma senha forte com letras maiúsculas, números e caracteres especiais</li>
            <li>Não compartilhe sua senha com ninguém</li>
            <li>Troque sua senha regularmente</li>
          </ul>
        </div>
      </GlassCard>
    </div>
  );
};

export default SecuritySettings;