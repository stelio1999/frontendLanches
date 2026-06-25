// src/components/client/MobileTransfer.jsx//
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from '../common/AnimatedButton';
import GlassCard from '../common/GlassCard';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  PhoneAndroid as PhoneIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon,
  CheckCircle as CheckIcon,
  FileUpload as FileIcon
} from '@mui/icons-material';

const MobileTransfer = ({ onSubmit, onProofSubmit, order, paymentData, loading }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await api.get('/payments/wallets');
      if (response.data.success) {
        setWallets(Object.entries(response.data.data).map(([id, data]) => ({
          id,
          ...data
        })));
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      // Fallback data
      setWallets([
        { id: 'mpesa', name: 'M-Pesa', number: '84 123 4567', accountHolder: 'Delivery Food, Lda' },
        { id: 'emola', name: 'E-Mola', number: '85 123 4567', accountHolder: 'Delivery Food, Lda' }
      ]);
    }
  };

  const handleWalletSelect = (walletId) => {
    setSelectedWallet(walletId);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
        setProofImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  
  // src/components/client/MobileTransfer.jsx
// Atualizar a função handleSubmit

const handleSubmit = () => {
  if (!selectedWallet) {
    toast.error('Selecione uma carteira móvel');
    return;
  }

  if (!proofText && !proofImage) {
    toast.error('Envie o comprovativo (texto ou imagem)');
    return;
  }

  console.log('📤 Enviando comprovativo - paymentData:', paymentData);

  // Se estiver enviando comprovativo (já tem paymentData)
  if (paymentData) {
    const formData = new FormData();
    
    if (proofText) {
      formData.append('proof', proofText);
      formData.append('proofType', 'text');
      console.log('📝 Enviando comprovativo de texto');
    } else if (proofImage) {
      if (proofImage.startsWith('data:image')) {
        formData.append('proof', proofImage);
        formData.append('proofType', 'image');
        console.log('🖼️ Enviando imagem base64');
      } else {
        formData.append('proofImage', proofImage);
        formData.append('proofType', 'image');
        console.log('🖼️ Enviando arquivo de imagem');
      }
    }
    
    console.log('📤 FormData criado com successo');
    onProofSubmit && onProofSubmit(formData);
  } else {
    console.log('📝 Criando novo pedido com pagamento');
    onSubmit && onSubmit({
      mobileWallet: selectedWallet,
      proof: proofText || proofImage,
      proofType: proofText ? 'text' : 'image'
    });
  }
};

  const selectedWalletData = wallets.find(w => w.id === selectedWallet);

  return (
    <div>
      <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
          Selecione a Carteira Móvel
        </h4>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleWalletSelect(wallet.id)}
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                background: selectedWallet === wallet.id 
                  ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                  : 'var(--glass-bg)',
                border: selectedWallet === wallet.id ? 'none' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: selectedWallet === wallet.id ? 'white' : 'var(--text)',
                cursor: 'pointer',
                fontWeight: selectedWallet === wallet.id ? 600 : 400,
                transition: 'all var(--transition-normal)',
              }}
            >
              {wallet.name}
            </button>
          ))}
        </div>
      </GlassCard>

      {selectedWalletData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
            <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
              Dados da Transferência
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <PhoneIcon style={{ color: 'var(--secondary)' }} />
                <span><strong>Carteira:</strong> {selectedWalletData.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <NumbersIcon style={{ color: 'var(--secondary)' }} />
                <span><strong>Número:</strong> {selectedWalletData.number}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <PersonIcon style={{ color: 'var(--secondary)' }} />
                <span><strong>Titular:</strong> {selectedWalletData.accountHolder}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <strong>Valor:</strong>
                <span style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700, 
                  color: 'var(--secondary)' 
                }}>
                  {new Intl.NumberFormat('pt-MZ', {
                    style: 'currency',
                    currency: 'MZN',
                    minimumFractionDigits: 0,
                  }).format(order.totalAmount + (order.deliveryFee || 0))}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
              Comprovativo de Transferência
            </h4>
            <p style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-md)'
            }}>
              Envie o comprovativo da transferência (texto ou imagem)
            </p>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: 'var(--spacing-xs)',
                color: 'var(--text-secondary)',
              }}>
                Mensagem de Confirmação
              </label>
              <textarea
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="Cole aqui a mensagem de confirmação da transferência..."
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  color: 'var(--text)',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px',
                  fontFamily: 'inherit',
                  transition: 'all var(--transition-normal)',
                }}
              />
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: 'var(--spacing-xs)',
                color: 'var(--text-secondary)',
              }}>
                Ou envie uma imagem do comprovativo
              </label>
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-lg)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                background: 'var(--glass-bg)',
              }}
              onClick={() => document.getElementById('proofImageInput').click()}
              >
                <input
                  id="proofImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                {proofImagePreview ? (
                  <div>
                    <img 
                      src={proofImagePreview} 
                      alt="Comprovativo"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                      Clique para alterar a imagem
                    </p>
                  </div>
                ) : (
                  <div>
                    <FileIcon style={{ fontSize: 48, color: 'var(--text-secondary)' }} />
                    <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                      Clique para fazer upload da imagem
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      JPG, PNG ou WEBP (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <AnimatedButton
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
              icon={<CheckIcon />}
            >
              {paymentData ? 'Enviar Comprovativo' : 'Confirmar Pagamento'}
            </AnimatedButton>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default MobileTransfer;