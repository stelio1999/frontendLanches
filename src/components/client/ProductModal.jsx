// src/components/client/ProductModal.jsx//
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../common/AnimatedButton';
import GlassCard from '../common/GlassCard';
import { useCart } from '../../hooks/useCart';
import { 
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const ProductModal = ({ isOpen, product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem, getItemQuantity } = useCart();

  if (!product) return null;

  const currentQuantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`${quantity}x ${product.title} adicionado ao carrinho!`);
    onClose();
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={onClose}
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
              maxHeight: '85vh',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              overflow: 'hidden',
              borderTop: '1px solid var(--border)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div style={{
              width: '40px',
              height: '4px',
              background: 'var(--border)',
              borderRadius: 'var(--radius-full)',
              margin: 'var(--spacing-md) auto',
            }} />

            {/* Image */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '280px',
              background: 'var(--glass-bg)',
              overflow: 'hidden',
            }}>
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                  background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))',
                  color: 'white',
                }}>
                  🍔
                </div>
              )}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: 'var(--spacing-md)',
                  right: 'var(--spacing-md)',
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all var(--transition-normal)',
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: 'var(--spacing-lg)',
              overflowY: 'auto',
              maxHeight: 'calc(85vh - 320px)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'var(--spacing-sm)',
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    {product.title}
                  </h2>
                  {product.subtitle && (
                    <p style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-secondary)',
                    }}>
                      {product.subtitle}
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--secondary)',
                }}>
                  {new Intl.NumberFormat('pt-MZ', {
                    style: 'currency',
                    currency: 'MZN',
                    minimumFractionDigits: 0,
                  }).format(product.price)}
                </span>
              </div>

              {product.description && (
                <GlassCard style={{
                  marginBottom: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  background: 'var(--glass-bg)',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--spacing-sm)',
                  }}>
                    <InfoIcon style={{ 
                      color: 'var(--secondary)', 
                      fontSize: 20,
                      marginTop: 2,
                    }} />
                    <p style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}>
                      {product.description}
                    </p>
                  </div>
                </GlassCard>
              )}

              {product.category && (
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: 'var(--glass-bg)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  {product.category}
                </div>
              )}

              {/* Quantity Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-md)',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-md)',
                border: '1px solid var(--border)',
              }}>
                <span style={{ fontWeight: 500 }}>Quantidade</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                }}>
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                      color: 'var(--text)',
                      opacity: quantity <= 1 ? 0.4 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all var(--transition-normal)',
                    }}
                  >
                    <RemoveIcon style={{ fontSize: 20 }} />
                  </button>
                  <span style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    minWidth: '32px',
                    textAlign: 'center',
                  }}>
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      cursor: 'pointer',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all var(--transition-normal)',
                    }}
                  >
                    <AddIcon style={{ fontSize: 20 }} />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-md)',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-md)',
                border: '1px solid var(--border)',
              }}>
                <span style={{ fontWeight: 500 }}>Total</span>
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--secondary)',
                }}>
                  {new Intl.NumberFormat('pt-MZ', {
                    style: 'currency',
                    currency: 'MZN',
                    minimumFractionDigits: 0,
                  }).format(product.price * quantity)}
                </span>
              </div>

              <AnimatedButton
                variant="primary"
                fullWidth
                onClick={handleAddToCart}
                icon={<CartIcon />}
                style={{
                  padding: '16px',
                  fontSize: '1.1rem',
                }}
              >
                Adicionar ao Carrinho
              </AnimatedButton>

              {currentQuantity > 0 && (
                <p style={{
                  textAlign: 'center',
                  marginTop: 'var(--spacing-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}>
                  Já tem {currentQuantity} no carrinho
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;