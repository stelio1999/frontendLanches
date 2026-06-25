// src/components/client/SettingsScreen.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import AnimatedButton from '../common/AnimatedButton';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowBack as ArrowBackIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
  Description as DescriptionIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Dangerous as DangerousIcon
} from '@mui/icons-material';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('pt');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);

  const languages = [
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const settingsSections = [
    {
      title: 'Preferências',
      items: [
        {
          icon: theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />,
          label: theme === 'light' ? 'Modo Escuro' : 'Modo Claro',
          description: theme === 'light' ? 'Ative o modo escuro' : 'Ative o modo claro',
          onClick: toggleTheme,
          type: 'toggle',
          isActive: true,
        },
        {
          icon: notifications ? <NotificationsActiveIcon /> : <NotificationsIcon />,
          label: 'Notificações',
          description: notifications ? 'Notificações ativas' : 'Notificações desativadas',
          onClick: () => setNotifications(!notifications),
          type: 'toggle',
          isActive: notifications,
        },
        {
          icon: <LanguageIcon />,
          label: 'Idioma',
          description: languages.find(l => l.code === language)?.label || 'Português',
          onClick: () => setShowLanguageModal(true),
          type: 'select',
          isActive: true,
        },
      ]
    },
    {
      title: 'Segurança',
      items: [
        {
          icon: <SecurityIcon />,
          label: 'Alterar Senha',
          description: 'Atualize sua senha de acesso',
          onClick: () => navigate('/change-password'),
          type: 'link',
          isActive: true,
        },
        {
          icon: <PhoneIcon />,
          label: 'Alterar Telefone',
          description: user?.phone || 'Número não cadastrado',
          onClick: () => navigate('/change-phone'),
          type: 'link',
          isActive: true,
        },
        {
          icon: <EmailIcon />,
          label: 'Alterar Email',
          description: user?.email || 'Email não cadastrado',
          onClick: () => navigate('/change-email'),
          type: 'link',
          isActive: true,
        },
      ]
    },
    {
      title: 'Suporte',
      items: [
        {
          icon: <HelpIcon />,
          label: 'Central de Ajuda',
          description: 'Perguntas frequentes e suporte',
          onClick: () => navigate('/help'),
          type: 'link',
          isActive: true,
        },
        {
          icon: <DescriptionIcon />,
          label: 'Termos de Uso',
          description: 'Leia nossos termos e condições',
          onClick: () => navigate('/terms'),
          type: 'link',
          isActive: true,
        },
        {
          icon: <LocationIcon />,
          label: 'Política de Privacidade',
          description: 'Como protegemos seus dados',
          onClick: () => navigate('/privacy'),
          type: 'link',
          isActive: true,
        },
      ]
    },
    {
      title: 'Conta',
      items: [
        {
          icon: <DeleteIcon />,
          label: 'Excluir Conta',
          description: 'Remover permanentemente sua conta',
          onClick: () => setShowDeleteModal(true),
          type: 'danger',
          isActive: true,
        },
      ]
    },
  ];

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Digite "DELETE" para confirmar a exclusão');
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete('/auth/account', {
        data: { confirmation: deleteConfirmation }
      });

      if (response.data.success) {
        toast.success('Conta excluída com sucesso!');
        setShowDeleteModal(false);
        await logout();
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Erro ao excluir conta:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        if (errorData.pendingOrders && errorData.pendingOrders.length > 0) {
          setPendingOrders(errorData.pendingOrders);
          toast.error(`Você tem ${errorData.pendingOrders.length} pedido(s) pendente(s)`);
        } else {
          toast.error(errorData.error || 'Não é possível excluir a conta');
        }
      } else {
        toast.error(error.response?.data?.error || 'Erro ao excluir conta');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setShowLanguageModal(false);
    toast.success('Idioma alterado para ' + languages.find(l => l.code === code)?.label);
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text)',
            transition: 'all var(--transition-normal)',
          }}
        >
          <ArrowBackIcon />
        </button>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--primary), var(--secondary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Configurações
        </h1>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex} style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--spacing-sm)',
            paddingLeft: 'var(--spacing-xs)',
          }}>
            {section.title}
          </h3>
          <GlassCard style={{ padding: 'var(--spacing-xs)' }}>
            {section.items.map((item, itemIndex) => (
              <motion.button
                key={itemIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: itemIndex * 0.05 }}
                onClick={item.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-md)',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  borderBottom: itemIndex < section.items.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  transition: 'all var(--transition-normal)',
                  borderRadius: 'var(--radius-sm)',
                }}
                whileHover={{ backgroundColor: 'var(--glass-bg)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: item.type === 'danger' 
                      ? 'var(--error)20' 
                      : 'var(--glass-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.type === 'danger' ? 'var(--error)' : 'var(--secondary)',
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <div>
                  {item.type === 'toggle' ? (
                    <div style={{
                      position: 'relative',
                      width: '48px',
                      height: '28px',
                      background: item.isActive ? 'var(--secondary)' : 'var(--border)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'all var(--transition-normal)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: item.isActive ? '24px' : '2px',
                        width: '24px',
                        height: '24px',
                        background: 'white',
                        borderRadius: '50%',
                        transition: 'all var(--transition-normal)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  ) : item.type === 'select' ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                    }}>
                      <span>{languages.find(l => l.code === language)?.flag}</span>
                      <span>{languages.find(l => l.code === language)?.label}</span>
                      <ArrowBackIcon style={{ fontSize: 16, transform: 'rotate(180deg)', opacity: 0.5 }} />
                    </div>
                  ) : item.type === 'danger' ? (
                    <div style={{
                      color: 'var(--error)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                    }}>
                      Excluir
                      <ArrowBackIcon style={{ fontSize: 16, transform: 'rotate(180deg)', opacity: 0.5 }} />
                    </div>
                  ) : (
                    <ArrowBackIcon style={{ 
                      fontSize: 18, 
                      color: 'var(--text-secondary)',
                      transform: 'rotate(180deg)',
                      opacity: 0.4,
                    }} />
                  )}
                </div>
              </motion.button>
            ))}
          </GlassCard>
        </div>
      ))}

      {/* Version Info */}
      <div style={{
        textAlign: 'center',
        padding: 'var(--spacing-md)',
        color: 'var(--text-secondary)',
        fontSize: '0.75rem',
        opacity: 0.5,
      }}>
        <p>Delivery Food v1.0.0</p>
        <p style={{ marginTop: 'var(--spacing-xs)' }}>
          © 2024 Delivery Food - Moçambique
        </p>
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
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
          onClick={() => setShowLanguageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-xl)',
              maxWidth: '380px',
              width: '100%',
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
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                <LanguageIcon style={{ marginRight: 'var(--spacing-xs)', verticalAlign: 'middle' }} />
                Selecionar Idioma
              </h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text)',
                }}
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-md)',
                    background: language === lang.code ? 'var(--secondary)10' : 'var(--glass-bg)',
                    border: language === lang.code ? '2px solid var(--secondary)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-normal)',
                    color: 'var(--text)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <span style={{ fontSize: 24 }}>{lang.flag}</span>
                    <span style={{ fontWeight: language === lang.code ? 600 : 400 }}>
                      {lang.label}
                    </span>
                  </div>
                  {language === lang.code && (
                    <CheckIcon style={{ color: 'var(--secondary)', fontSize: 20 }} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-md)',
          }}
          onClick={() => {
            setShowDeleteModal(false);
            setPendingOrders([]);
            setDeleteConfirmation('');
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-xl)',
              maxWidth: '420px',
              width: '100%',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'var(--error)15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                border: '2px solid var(--error)30',
              }}>
                <DangerousIcon style={{ fontSize: 36, color: 'var(--error)' }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--error)' }}>
                Excluir Conta Permanentemente
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'var(--spacing-sm)' }}>
                Esta ação <strong style={{ color: 'var(--error)' }}>NÃO PODE SER DESFEITA</strong>. 
                Todos os seus dados serão removidos permanentemente.
              </p>
            </div>

            {/* Verificação de pedidos pendentes */}
            {pendingOrders.length > 0 && (
              <div style={{
                padding: 'var(--spacing-md)',
                background: 'var(--warning)10',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--warning)30',
                marginBottom: 'var(--spacing-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                  <WarningIcon style={{ color: 'var(--warning)' }} />
                  <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--warning)' }}>
                    Pedidos Pendentes
                  </h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Não é possível excluir a conta enquanto houver pedidos pendentes:
                </p>
                <ul style={{
                  marginTop: 'var(--spacing-sm)',
                  paddingLeft: 'var(--spacing-md)',
                  fontSize: '0.85rem',
                  color: 'var(--text)',
                  lineHeight: 2,
                }}>
                  {pendingOrders.map((order) => (
                    <li key={order.id}>
                      Pedido #{order.order_number} - Status: {order.status}
                    </li>
                  ))}
                </ul>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginTop: 'var(--spacing-sm)',
                  fontStyle: 'italic',
                }}>
                  * Aguarde a conclusão de todos os pedidos ou cancele-os para prosseguir
                </p>
                <AnimatedButton
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPendingOrders([]);
                    setDeleteConfirmation('');
                  }}
                  style={{ marginTop: 'var(--spacing-sm)' }}
                >
                  Voltar
                </AnimatedButton>
              </div>
            )}

            {/* Formulário de confirmação */}
            {pendingOrders.length === 0 && (
              <>
                <div style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--error)05',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--error)20',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                    Para confirmar a exclusão, digite <strong style={{ color: 'var(--error)' }}>DELETE</strong> no campo abaixo:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                    placeholder="Digite DELETE"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--glass-bg)',
                      border: `2px solid ${deleteConfirmation === 'DELETE' ? 'var(--success)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      color: 'var(--text)',
                      outline: 'none',
                      textAlign: 'center',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      transition: 'all var(--transition-normal)',
                    }}
                  />
                  {deleteConfirmation && deleteConfirmation !== 'DELETE' && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: 'var(--spacing-xs)' }}>
                      ⚠️ Digite exatamente "DELETE" para confirmar
                    </p>
                  )}
                  {deleteConfirmation === 'DELETE' && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: 'var(--spacing-xs)' }}>
                      ✅ Confirmação válida. Clique em "Excluir Permanentemente" para prosseguir.
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <AnimatedButton
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmation('');
                    }}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </AnimatedButton>
                  <AnimatedButton
                    variant="danger"
                    onClick={handleDeleteAccount}
                    loading={loading}
                    disabled={loading || deleteConfirmation !== 'DELETE'}
                    icon={<DeleteIcon />}
                    style={{ flex: 1 }}
                  >
                    {loading ? 'Excluindo...' : 'Excluir Permanentemente'}
                  </AnimatedButton>
                </div>
              </>
            )}

            <div style={{
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-sm)',
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                Esta ação é irreversível. Todos os dados serão removidos permanentemente.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;