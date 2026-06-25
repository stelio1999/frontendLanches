// src/components/client/ProductCard.jsx//
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import { 
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const ProductCard = ({ product, quantity, onAdd, onRemove }) => {
  const [showDescription, setShowDescription] = useState(false);

  const handleImageClick = () => {
    if (product.description) {
      setShowDescription(true);
    }
  };

  return (
    <>
      <GlassCard style={{ 
        padding: 'var(--spacing-md)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Image */}
        <div 
          onClick={handleImageClick}
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '100%',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            cursor: product.description ? 'pointer' : 'default',
            background: 'var(--border)',
            marginBottom: 'var(--spacing-sm)',
          }}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))',
              color: 'white',
            }}>
              🍔
            </div>
          )}
          
        </div>

        {/* Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h4 style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            marginBottom: 'var(--spacing-xs)',
            lineHeight: 1.2,
            color: 'var(--text)',
          }}>
            {product.title}
          </h4>
          {product.subtitle && (
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-xs)',
              lineHeight: 1.3,
            }}>
              {product.subtitle}
            </p>
          )}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--secondary)',
            }}>
              {new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN',
                minimumFractionDigits: 0,
              }).format(product.price)}
            </span>
            {quantity === 0 ? (
              <button
                onClick={() => onAdd && onAdd()}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CartIcon style={{ fontSize: 16 }} />
                Pedir
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
              }}>
                <button
                  onClick={() => onRemove && onRemove()}
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    transition: 'all var(--transition-normal)',
                  }}
                > 
                  <RemoveIcon style={{ fontSize: 16 }} />
                </button>
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => onAdd && onAdd()}
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all var(--transition-normal)',
                  }}
                >
                  <AddIcon style={{ fontSize: 16 }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Description Modal */}
      <AnimatePresence>
        {showDescription && product.description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setShowDescription(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                background: 'var(--surface)',
                width: '100%',
                maxWidth: '480px',
                maxHeight: '70vh',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                padding: 'var(--spacing-lg)',
                overflowY: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                width: '40px',
                height: '4px',
                background: 'var(--border)',
                borderRadius: 'var(--radius-full)',
                margin: '0 auto var(--spacing-md)',
              }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
                {product.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {product.description}
              </p>
              {product.subtitle && (
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  marginTop: 'var(--spacing-sm)',
                  fontStyle: 'italic',
                }}>
                  {product.subtitle}
                </p>
              )}
              <button
                onClick={() => setShowDescription(false)}
                className="btn-primary"
                style={{ marginTop: 'var(--spacing-lg)' }}
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;