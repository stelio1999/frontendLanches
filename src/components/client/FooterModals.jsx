// src/components/client/FooterModals.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Close as CloseIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// ============================================
// MODAL DE TERMOS DE USO
// ============================================
export const TermsModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
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
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              mass: 0.8,
            }}
            style={{
              background: 'rgba(0, 14, 32, 0.2)',
              width: '100%',
              maxWidth: '480px',
              height: '80vh',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              overflow: 'hidden',
              borderTop: '1px solid var(--border)',
              boxShadow: '0 -8px 32px rgba(1, 73, 156, 0.2)',
              display: 'flex',
              flexDirection: 'column',
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
              flexShrink: 0,
              cursor: 'grab',
            }} />

            {/* Header */}
            <div style={{
              padding: '0 var(--spacing-lg) var(--spacing-md)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  <GavelIcon style={{ fontSize: 20 }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                    Termos de Uso
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Última atualização: {new Date().toLocaleDateString('pt-MZ')}
                  </p>
                </div>
              </div>
             
            </div>

            {/* Content */}
            <div style={{
              padding: 'var(--spacing-lg)',
              overflowY: 'auto',
              flex: 1,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="hide-scrollbar"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    1. Aceitação dos Termos
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Ao utilizar o Delivery Food, você concorda com estes Termos de Uso. Se não concordar, não utilize nossos serviços. Estes termos podem ser atualizados periodicamente.
                  </p>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    2. Cadastro e Conta
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Para fazer pedidos, você deve fornecer informações precisas e completas. Você é responsável por manter a confidencialidade de sua conta e senha.
                  </p>
                  <ul style={{
                    marginTop: 'var(--spacing-sm)',
                    paddingLeft: 'var(--spacing-lg)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 2,
                  }}>
                    <li>✓ Você deve ter pelo menos 18 anos para usar nossos serviços</li>
                    <li>✓ As informações fornecidas devem ser verdadeiras e atualizadas</li>
                    <li>✓ Você é responsável por todas as atividades em sua conta</li>
                  </ul>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    3. Pedidos e Pagamentos
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Ao fazer um pedido, você concorda em pagar o valor total indicado. Reservamo-nos o direito de recusar ou cancelar pedidos a qualquer momento.
                  </p>
                  <ul style={{
                    marginTop: 'var(--spacing-sm)',
                    paddingLeft: 'var(--spacing-lg)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 2,
                  }}>
                    <li>✓ Os preços estão em Meticais (MZN)</li>
                    <li>✓ Os pedidos estão sujeitos a disponibilidade</li>
                    <li>✓ O pagamento deve ser confirmado antes do preparo</li>
                  </ul>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    4. Entrega
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Os prazos de entrega são estimativas e podem variar. Não nos responsabilizamos por atrasos causados por fatores externos.
                  </p>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    5. Cancelamentos e Reembolsos
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Pedidos podem ser cancelados antes do início do preparo. Reembolsos serão processados de acordo com nossa política.
                  </p>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    6. Contato
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Para dúvidas sobre estes termos, entre em contato através do e-mail: <strong style={{ color: 'var(--text)' }}>termos@deliveryfood.co.mz</strong>
                  </p>
                </section>

                <div style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--success)10',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--success)30',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                }}>
                  <CheckIcon style={{ fontSize: 18, color: 'var(--success)' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Ao continuar usando o Delivery Food, você aceita estes termos.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  boxShadow: '0 4px 16px rgba(21, 101, 192, 0.3)',
                }}
              >
                Li e Concordo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// MODAL DE PRIVACIDADE
// ============================================
export const PrivacyModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
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
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              mass: 0.8,
            }}
            style={{
              background: 'rgba(6, 0, 20, 0.1)',
              width: '100%',
              maxWidth: '480px',
              height: '80vh',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              overflow: 'hidden',
              borderTop: '1px solid var(--border)',
              boxShadow: '0 -8px 32px rgba(3, 143, 33, 0.2)',
              display: 'flex',
              flexDirection: 'column',
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
              flexShrink: 0,
              cursor: 'grab',
            }} />

            {/* Header */}
            <div style={{
              padding: '0 var(--spacing-lg) var(--spacing-md)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  <SecurityIcon style={{ fontSize: 20 }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                    Política de Privacidade
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Última atualização: {new Date().toLocaleDateString('pt-MZ')}
                  </p>
                </div>
              </div>
               
            </div>

            {/* Content */}
            <div style={{
              padding: 'var(--spacing-lg)',
              overflowY: 'auto',
              flex: 1,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="hide-scrollbar"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    Nossa Política de Privacidade
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    O Delivery Food valoriza sua privacidade. Esta política explica como coletamos, usamos e protegemos suas informações pessoais.
                  </p>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    1. Informações que Coletamos
                  </h4>
                  <ul style={{
                    paddingLeft: 'var(--spacing-lg)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 2,
                  }}>
                    <li>✓ Nome completo</li>
                    <li>✓ Número de telefone</li>
                    <li>✓ Endereço de entrega</li>
                    <li>✓ Histórico de pedidos</li>
                    <li>✓ Preferências de pagamento</li>
                    <li>✓ Localização (com seu consentimento)</li>
                  </ul>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    2. Como Usamos suas Informações
                  </h4>
                  <ul style={{
                    paddingLeft: 'var(--spacing-lg)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 2,
                  }}>
                    <li>✓ Processar pedidos e entregas</li>
                    <li>✓ Melhorar nossos serviços</li>
                    <li>✓ Enviar notificações sobre pedidos</li>
                    <li>✓ Personalizar sua experiência</li>
                    <li>✓ Cumprir obrigações legais</li>
                  </ul>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    3. Compartilhamento de Dados
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Não vendemos ou alugamos suas informações pessoais. Compartilhamos apenas com parceiros necessários para processar seu pedido (entregadores, cozinha, processadores de pagamento).
                  </p>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    4. Segurança de Dados
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Utilizamos tecnologias de criptografia e medidas de segurança para proteger suas informações contra acesso não autorizado.
                  </p>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    5. Seus Direitos
                  </h4>
                  <ul style={{
                    paddingLeft: 'var(--spacing-lg)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 2,
                  }}>
                    <li>✓ Acessar seus dados pessoais</li>
                    <li>✓ Corrigir dados incorretos</li>
                    <li>✓ Solicitar exclusão de dados</li>
                    <li>✓ Retirar consentimento a qualquer momento</li>
                  </ul>
                </section>

                <section>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    6. Contato
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Para questões sobre privacidade, contate: <strong style={{ color: 'var(--text)' }}>privacidade@deliveryfood.co.mz</strong>
                  </p>
                </section>

                <div style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--success)10',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--success)30',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                }}>
                  <SecurityIcon style={{ fontSize: 18, color: 'var(--success)' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Sua privacidade é importante para nós.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)',
                }}
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// MODAL DE AJUDA
// ============================================
export const HelpModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
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
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              mass: 0.8,
            }}
            style={{
              background: 'rgba(1, 0, 26, 0.1)',
              width: '100%',
              maxWidth: '480px',
              height: '80vh',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              overflow: 'hidden',
              borderTop: '1px solid var(--border)',
              boxShadow: '0 -8px 32px rgba(250, 164, 5, 0.2)',
              display: 'flex',
              flexDirection: 'column',
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
              flexShrink: 0,
              cursor: 'grab',
            }} />

            {/* Header */}
            <div style={{
              padding: '0 var(--spacing-lg) var(--spacing-md)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f57c00, #ffa726)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  <HelpIcon style={{ fontSize: 20 }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                    Central de Ajuda
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Como podemos ajudar?
                  </p>
                </div>
              </div>
              
            </div>

            {/* Content */}
            <div style={{
              padding: 'var(--spacing-lg)',
              overflowY: 'auto',
              flex: 1,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="hide-scrollbar"
            >
              {/* FAQ Section */}
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-md)', color: 'var(--text)' }}>
                  Perguntas Frequentes
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}>
                    <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)', color: 'var(--text)' }}>
                      Como faço um pedido?
                    </h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      1. Navegue pelo cardápio<br />
                      2. Selecione os itens desejados<br />
                      3. Adicione ao carrinho<br />
                      4. Escolha a forma de pagamento<br />
                      5. Confirme seu pedido
                    </p>
                  </div>

                  <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}>
                    <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)', color: 'var(--text)' }}>
                      Como funciona a entrega?
                    </h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Oferecemos entrega em até 45 minutos. Acompanhe seu pedido em tempo real pelo aplicativo.
                    </p>
                  </div>

                  <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}>
                    <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)', color: 'var(--text)' }}>
                      Qual o horário de funcionamento?
                    </h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Atendemos de segunda a domingo, das 10h às 23h.
                    </p>
                  </div>

                  <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}>
                    <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)', color: 'var(--text)' }}>
                      Como cancelar um pedido?
                    </h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Você pode cancelar seu pedido antes do início do preparo. Acesse "Meus Pedidos" e selecione o pedido desejado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--spacing-md)', color: 'var(--text)' }}>
                  Entre em Contato
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-md)',
                  background: 'var(--glass-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <PhoneIcon style={{ fontSize: 18, color: 'var(--secondary)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--text)' }}>Telefone:</strong> +258 84 123 4567
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <EmailIcon style={{ fontSize: 18, color: 'var(--secondary)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--text)' }}>E-mail:</strong> ajuda@deliveryfood.co.mz
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <LocationIcon style={{ fontSize: 18, color: 'var(--secondary)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--text)' }}>Endereço:</strong> Maputo, Moçambique
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <ScheduleIcon style={{ fontSize: 18, color: 'var(--secondary)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--text)' }}>Horário:</strong> Seg-Dom • 10h - 23h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #f57c00, #ffa726)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  boxShadow: '0 4px 16px rgba(245, 124, 0, 0.3)',
                }}
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};