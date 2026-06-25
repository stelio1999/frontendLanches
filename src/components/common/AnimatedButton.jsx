// src/components/common/AnimatedButton.jsx//
import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const getVariantStyles = () => {
    switch(variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'white',
          boxShadow: '0 4px 16px rgba(21, 101, 192, 0.3)',
        };
      case 'secondary':
        return {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text)',
        };
      case 'outline':
        return {
          background: 'transparent',
          border: '2px solid var(--secondary)',
          color: 'var(--secondary)',
        };
      case 'danger':
        return {
          background: 'var(--error)',
          color: 'white',
          boxShadow: '0 4px 16px rgba(198, 40, 40, 0.3)',
        };
      case 'success':
        return {
          background: 'var(--success)',
          color: 'white',
          boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)',
        };
      default:
        return {
          background: 'var(--primary)',
          color: 'white',
        };
    }
  };

  const getSizeStyles = () => {
    switch(size) {
      case 'small':
        return { padding: '6px 16px', fontSize: '0.85rem' };
      case 'large':
        return { padding: '16px 32px', fontSize: '1.1rem' };
      default:
        return { padding: '12px 24px', fontSize: '1rem' };
    }
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`animated-button ${className}`}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        width: fullWidth ? '100%' : 'auto',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-normal)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-sm)',
        opacity: disabled || loading ? 0.6 : 1,
        position: 'relative',
        ...props.style,
      }}
      {...props}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="spinner" style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}
      <span style={{ opacity: loading ? 0 : 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        {icon && iconPosition === 'left' && <span>{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span>{icon}</span>}
      </span>
    </motion.button>
  );
};

export default AnimatedButton;