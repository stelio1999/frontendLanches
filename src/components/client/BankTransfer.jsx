// src/components/client/BankTransfer.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from '../common/AnimatedButton';
import GlassCard from '../common/GlassCard';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  AccountBalance as AccountIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon,
  CheckCircle as CheckIcon,
  FileUpload as FileIcon
} from '@mui/icons-material';

const BankTransfer = ({ onSubmit, onProofSubmit, order, paymentData, loading }) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const [banks, setBanks] = useState([]);
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await api.get('/payments/banks');
      if (response.data.success) {
        setBanks(Object.entries(response.data.data).map(([id, data]) => ({
          id,
          ...data
        })));
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      setBanks([
        { id: 'bim', bank: 'BIM', accountNumber: '1234567890', accountHolder: 'Delivery Food, Lda' },
        { id: 'bci', bank: 'BCI', accountNumber: '0987654321', accountHolder: 'Delivery Food, Lda' }
      ]);
    }
  };

  const handleBankSelect = (bankId) => {
    setSelectedBank(bankId);
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

  // ✅ ÚNICA FUNÇÃO: cria pedido + envia comprovativo + WhatsApp (se necessário)
  const handleSubmit = async () => {
    if (!selectedBank) {
      toast.error('Selecione um banco');
      return;
    }

    if (!proofText && !proofImage) {
      toast.error('Envie o comprovativo (texto ou imagem)');
      return;
    }

    setSubmitting(true);

    try {
      // Se ainda não tem pedido criado, cria primeiro
      if (!paymentData) {
        console.log('📝 Criando pedido...');
        
        // Passar dados do comprovativo junto com o pedido
        const orderData = {
          bankAccount: selectedBank,
          proof: proofText || null,
          proofImage: proofImage || null,
          proofType: proofText ? 'text' : 'image'
        };

        // onSubmit vai criar o pedido E o comprovativo numa única chamada
        await onSubmit(orderData);
        
        // Se retornar com sucesso, o PaymentModal vai mostrar a confirmação
        // e disparar o WhatsApp
      } else {
        // Já tem pedido, só envia o comprovativo
        console.log('📤 Enviando comprovativo para pedido existente...');
        
        const formData = new FormData();
        if (proofText) {
          formData.append('proof', proofText);
          formData.append('proofType', 'text');
        } else if (proofImage) {
          if (proofImage.startsWith('data:image')) {
            formData.append('proof', proofImage);
            formData.append('proofType', 'image');
          } else {
            formData.append('proofImage', proofImage);
            formData.append('proofType', 'image');
          }
        }
        
        await onProofSubmit(formData);
      }
    } catch (error) {
      console.error('Erro ao submeter:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBankData = banks.find(b => b.id === selectedBank);

  return (
    <div>
      <GlassCard style={{ marginBottom: 'var(--spacing-md)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
          Selecione o Banco
        </h4>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {banks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => handleBankSelect(bank.id)}
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                background: selectedBank === bank.id 
                  ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                  : 'var(--glass-bg)',
                border: selectedBank === bank.id ? 'none' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: selectedBank === bank.id ? 'white' : 'var(--text)',
                cursor: 'pointer',
                fontWeight: selectedBank === bank.id ? 600 : 400,
                transition: 'all var(--transition-normal)',
              }}
            >
              {bank.bank}
            </button>
          ))}
        </div>
      </GlassCard>

      {selectedBankData && (
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
                <AccountIcon style={{ color: 'var(--secondary)' }} />
                <span><strong>Banco:</strong> {selectedBankData.bank}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <NumbersIcon style={{ color: 'var(--secondary)' }} />
                <span><strong>Conta:</strong> {selectedBankData.accountNumber}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <PersonIcon style={{ color: 'var(--secondary)' }} />
                <span><strong>Titular:</strong> {selectedBankData.accountHolder}</span>
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
                  }).format(order.totalAmount || 0)}
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
              onClick={() => document.getElementById('proofImageInputBank').click()}
              >
                <input
                  id="proofImageInputBank"
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

            {/* ✅ ÚNICO BOTÃO - faz tudo de uma vez */}
            <AnimatedButton
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              loading={loading || submitting}
              disabled={loading || submitting || !selectedBank || (!proofText && !proofImage)}
              icon={<CheckIcon />}
            >
              {submitting ? 'Processando...' : 'Confirmar Pagamento'}
            </AnimatedButton>
            
            <p style={{
              marginTop: 'var(--spacing-sm)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}>
              Ao confirmar, o pedido será enviado automaticamente para a cozinha
            </p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default BankTransfer;