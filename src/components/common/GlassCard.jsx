// src/components/common/GlassCard.jsx//
import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  onClick,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch(variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.15), rgba(21, 101, 192, 0.15))',
          border: '1px solid rgba(21, 101, 192, 0.2)',
        };
      case 'accent':
        return {
          background: 'linear-gradient(135deg, rgba(255, 111, 0, 0.12), rgba(255, 152, 0, 0.12))',
          border: '1px solid rgba(255, 152, 0, 0.2)',
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.12), rgba(76, 175, 80, 0.12))',
          border: '1px solid rgba(76, 175, 80, 0.2)',
        };
      default:
        return {
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`glass-card ${className}`}
      style={{
        ...getVariantStyles(),
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-lg)',
        boxShadow: 'var(--shadow)',
        transition: 'all var(--transition-normal)',
        cursor: onClick ? 'pointer' : 'default',
        ...props.style,
      }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;