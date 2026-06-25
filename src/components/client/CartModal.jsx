// src/components/client/CartModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import AnimatedButton from '../common/AnimatedButton';
import GlassCard from '../common/GlassCard';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  DeliveryDining as DeliveryIcon,
  LocalShipping as ShippingIcon,
  Close as CloseIcon,
  ShoppingBag as BagIcon,
  Restaurant as RestaurantIcon,
  Directions as DirectionsIcon,
  DeleteSweep as DeleteSweepIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import LocationPickerModal from './LocationPickerModal';


const CartModal = ({ onProceed, onClose }) => {
  const { items, totalItems, totalPrice, addItem, removeItem, deleteItem, clearCart } = useCart();
  const { user } = useAuth();
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [deliveryLocation, setDeliveryLocation] = useState({
    address: '',
    lat: null,
    lng: null
  });

  const handleAdd = (item) => {
    addItem(item);
  };

  const handleRemove = (itemId) => {
    removeItem(itemId);
  };

  const handleDelete = (itemId) => {
    deleteItem(itemId);
  };

  const handleProceed = () => {
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }

    if (isDelivery && !deliveryLocation.address) {
      toast.error('Por favor, insira o endereço de entrega');
      return;
    }

    onProceed && onProceed({
      items,
      totalAmount: totalPrice + deliveryFee,
      deliveryFee,
      isDelivery,
      deliveryAddress: isDelivery ? deliveryLocation.address : null,
      deliveryLat: isDelivery ? deliveryLocation.lat : null,
      deliveryLng: isDelivery ? deliveryLocation.lng : null,
    });
  };

  const handleClearCart = () => {
    if (window.confirm('Tem certeza que deseja remover todos os itens?')) {
      clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--spacing-xxl) var(--spacing-lg)',
      }}>
        <div style={{
          fontSize: 64,
          marginBottom: 'var(--spacing-md)',
          opacity: 0.3,
        }}>🛒</div>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 600,
          marginBottom: 'var(--spacing-sm)',
          color: 'var(--text)',
        }}>
          Seu carrinho está vazio
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Adicione alguns produtos deliciosos do nosso cardápio
        </p>
        <AnimatedButton
          variant="secondary"
          onClick={onClose}
          style={{ marginTop: 'var(--spacing-md)' }}
        >
          Voltar ao Cardápio
        </AnimatedButton>
      </div>
    );
  }

  return (
    <div style={{
      maxHeight: '70vh',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}
      className="hide-scrollbar"
    >
      {/* Header com gradiente */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        margin: '-4px -24px 20px -24px',
        padding: '20px 24px 16px 24px',
        borderRadius: '0 0 30px 30px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <h2 style={{
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: 700,
                marginBottom: '2px',
              }}>
                Seu Pedido
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.85rem',
              }}>
                {totalItems} {totalItems === 1 ? 'item' : 'itens'} no carrinho
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--spacing-sm) 0',
              borderBottom: '1px solid var(--border)',
              gap: 'var(--spacing-md)',
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              flexShrink: 0,
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
            }}>
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))',
                  color: 'white',
                }}>
                  🍔
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                marginBottom: '2px',
                color: 'var(--text)',
              }}>
                {item.title}
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginBottom: '2px',
              }}>
                {item.subtitle || 'Item do cardápio'}
              </p>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--secondary)'
              }}>
                {new Intl.NumberFormat('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                }).format(item.price * item.quantity)}
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
            }}>
              <button
                onClick={() => handleRemove(item.id)}
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
                  transition: 'all var(--transition-normal)',
                }}
              >
                <RemoveIcon style={{ fontSize: 18 }} />
              </button>
              <span style={{
                fontSize: '1rem',
                fontWeight: 700,
                minWidth: '24px',
                textAlign: 'center',
                color: 'var(--text)',
              }}>
                {item.quantity}
              </span>
              <button
                onClick={() => handleAdd(item)}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all var(--transition-normal)',
                  boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)',
                }}
              >
                <AddIcon style={{ fontSize: 18 }} />
              </button>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--error)',
                padding: 'var(--spacing-xs)',
                transition: 'all var(--transition-normal)',
                opacity: 0.6,
              }}
            >
              <DeleteIcon style={{ fontSize: 20 }} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Delivery Toggle - Estilizado */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-md)',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: isDelivery
                ? 'linear-gradient(135deg, var(--secondary), var(--secondary-light))'
                : 'var(--glass-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDelivery ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
              {isDelivery ? <DirectionsIcon /> : <RestaurantIcon />}
            </div>
            <div>
              <h4 style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text)',
              }}>
                {isDelivery ? 'Entrega a Domicílio' : 'Retirar no Local'}
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                {isDelivery ? 'Receba seu pedido em casa' : 'Retire seu pedido na loja'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDelivery(!isDelivery)}
            style={{
              position: 'relative',
              width: '52px',
              height: '30px',
              background: isDelivery ? 'var(--secondary)' : 'var(--border)',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '3px',
              left: isDelivery ? '26px' : '3px',
              width: '24px',
              height: '24px',
              background: 'white',
              borderRadius: '50%',
              transition: 'all var(--transition-normal)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
        {isDelivery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 'var(--spacing-md)' }}
          >
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-secondary)',
            }}>
              Endereço de Entrega *
            </label>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'stretch'
              }}
            >
              <textarea
                value={deliveryLocation.address}
                readOnly
                placeholder="Selecionar localização no mapa..."
                style={{
                  flex: 1,
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  color: 'var(--text)',
                  resize: 'vertical',
                  minHeight: '60px'
                }}
              />

              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                style={{
                  width: '60px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background:
                    'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DirectionsIcon />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Summary - Estilizado */}
      <div style={{
        background: 'linear-gradient(135deg, var(--glass-bg), var(--surface))',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-md)',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 'var(--spacing-xs) 0',
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
            {new Intl.NumberFormat('pt-MZ', {
              style: 'currency',
              currency: 'MZN',
              minimumFractionDigits: 0,
            }).format(totalPrice)}
          </span>
        </div>
        {isDelivery && deliveryFee > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--spacing-xs) 0',
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>Taxa de Entrega</span>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>
              {new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN',
                minimumFractionDigits: 0,
              }).format(deliveryFee)}
            </span>
          </div>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 'var(--spacing-sm)',
          marginTop: 'var(--spacing-xs)',
          borderTop: '2px solid var(--border)',
        }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
            Total
          </span>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--secondary)',
          }}>
            {new Intl.NumberFormat('pt-MZ', {
              style: 'currency',
              currency: 'MZN',
              minimumFractionDigits: 0,
            }).format(totalPrice + deliveryFee)}
          </span>
        </div>
      </div>

      {/* Actions - Botões Melhorados */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        marginTop: 'var(--spacing-sm)',
      }}>
        {/* Botão Limpar - Estilizado */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleClearCart}
          style={{
            flex: 0.7,
            padding: '14px 20px',
            background: 'transparent',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-xs)',
          }}
        >
          <DeleteSweepIcon style={{ fontSize: 20 }} />
          Limpar
        </motion.button>

        {/* Botão Prosseguir - Premium */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(21, 101, 192, 0.4)' }}
          whileTap={{ scale: 0.96 }}
          onClick={handleProceed}
          style={{
            flex: 1.3,
            padding: '14px 24px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-sm)',
            boxShadow: '0 4px 16px rgba(21, 101, 192, 0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Efeito de brilho */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'shine 3s ease-in-out infinite',
          }} />

          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            Finalizar Pedido
            <ArrowForwardIcon style={{ fontSize: 20 }} />
          </span>
        </motion.button>
      </div>

      {!user && (
        <div style={{
          marginTop: 'var(--spacing-md)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          background: 'var(--warning)10',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--warning)30',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>
            ⚠️ Você será solicitado a fazer login antes de finalizar o pedido
          </p>
        </div>
      )}

      {/* Estilos para esconder scrollbar e animação */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes shine {
          0%, 100% { transform: translateX(-30%) rotate(45deg); }
          50% { transform: translateX(30%) rotate(45deg); }
        }
      `}</style>


      <LocationPickerModal
  isOpen={showLocationModal}
  onClose={() => setShowLocationModal(false)}
  onConfirm={(location) => {
    setDeliveryLocation(location);
  }}
/>
    </div>
  );
};

export default CartModal;