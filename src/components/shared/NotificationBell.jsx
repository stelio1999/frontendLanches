// src/components/shared/NotificationBell.jsx//
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import { useSocket } from '../../hooks/useSocket';
import { 
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const NotificationBell = () => {
  const { on, off } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleNotification = (data) => {
      const newNotif = {
        id: Date.now(),
        ...data,
        read: false,
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Auto dismiss após 5 segundos
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 5000);
    };

    on('notification', handleNotification);

    return () => {
      off('notification', handleNotification);
    };
  }, [on, off]);

  const getIcon = (type) => {
    switch(type) {
      case 'success':
        return <CheckIcon style={{ color: 'var(--success)' }} />;
      case 'warning':
        return <WarningIcon style={{ color: 'var(--warning)' }} />;
      case 'error':
        return <WarningIcon style={{ color: 'var(--error)' }} />;
      default:
        return <InfoIcon style={{ color: 'var(--info)' }} />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text)',
          padding: 'var(--spacing-xs)',
          transition: 'all var(--transition-normal)',
        }}
      >
        {unreadCount > 0 ? (
          <NotificationsActiveIcon style={{ fontSize: 28, color: 'var(--secondary)' }} />
        ) : (
          <NotificationsIcon style={{ fontSize: 28 }} />
        )}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'var(--error)',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '320px',
              maxHeight: '400px',
              zIndex: 1000,
            }}
          >
            <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-md)',
                borderBottom: '1px solid var(--border)',
              }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Notificações
                </h4>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: 'var(--secondary)',
                        fontWeight: 500,
                      }}
                    >
                      Marcar todas
                    </button>
                  )}
                  <button
                    onClick={clearNotifications}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontSize: '1.2rem',
                    }}
                  >
                    <CloseIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>

              <div style={{
                maxHeight: '340px',
                overflowY: 'auto',
                padding: 'var(--spacing-sm)',
              }}>
                {notifications.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: 'var(--spacing-xl) var(--spacing-md)',
                    color: 'var(--text-secondary)',
                  }}>
                    <NotificationsIcon style={{ fontSize: 40, opacity: 0.3 }} />
                    <p style={{ marginTop: 'var(--spacing-sm)' }}>
                      Nenhuma notificação
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        marginBottom: 'var(--spacing-xs)',
                        borderRadius: 'var(--radius-sm)',
                        background: notif.read ? 'transparent' : 'var(--glass-bg)',
                        borderLeft: `3px solid ${notif.type === 'success' ? 'var(--success)' : 
                                   notif.type === 'warning' ? 'var(--warning)' : 
                                   notif.type === 'error' ? 'var(--error)' : 'var(--info)'}`,
                        transition: 'all var(--transition-normal)',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--spacing-sm)',
                      }}>
                        {getIcon(notif.type)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: '0.9rem',
                            fontWeight: notif.read ? 400 : 600,
                            marginBottom: '2px',
                          }}>
                            {notif.title}
                          </p>
                          <p style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            wordWrap: 'break-word',
                          }}>
                            {notif.message}
                          </p>
                          <span style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-secondary)',
                            opacity: 0.6,
                          }}>
                            {new Date(notif.timestamp).toLocaleString('pt-MZ')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating notifications */}
      <div style={{
        position: 'fixed',
        top: 'var(--spacing-md)',
        right: 'var(--spacing-md)',
        zIndex: 9999,
        maxWidth: '350px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {notifications.slice(0, 3).map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                pointerEvents: 'auto',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                boxShadow: 'var(--shadow-lg)',
                borderLeft: `4px solid ${
                  notif.type === 'success' ? 'var(--success)' : 
                  notif.type === 'warning' ? 'var(--warning)' : 
                  notif.type === 'error' ? 'var(--error)' : 'var(--info)'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                {getIcon(notif.type)}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {notif.title}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {notif.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationBell;