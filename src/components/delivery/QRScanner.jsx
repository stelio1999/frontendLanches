// src/components/delivery/QRScanner.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../common/GlassCard';
import AnimatedButton from '../common/AnimatedButton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  QrCodeScanner as ScanIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  CameraAlt as CameraIcon,
  FlipCameraAndroid as FlipIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon
} from '@mui/icons-material';

// Componente de scanner simplificado
const QRScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [flash, setFlash] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    // Verificar se o navegador suporta getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Seu navegador não suporta acesso à câmera');
      return;
    }

    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', true);
        
        // --- ALTERAÇÃO AQUI ---
        try {
          await videoRef.current.play();
          setHasCamera(true);
          setScanning(true);
          startScanning();
        } catch (playError) {
          // O erro "AbortError" ou "NotAllowedError" geralmente acontece aqui
          console.warn('Erro ao tentar reproduzir vídeo:', playError);
          // Se for apenas uma interrupção, podemos ignorar ou tentar reiniciar
        }
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const scanInterval = setInterval(() => {
      if (!scanning || !video.videoWidth) return;

      // Capturar frame do vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Obter dados da imagem
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Tentar decodificar QR Code usando a API nativa (se disponível)
      if (window.BarcodeDetector) {
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['qr_code']
        });
        
        barcodeDetector.detect(video)
          .then(barcodes => {
            if (barcodes.length > 0) {
              const qrData = barcodes[0].rawValue;
              handleQRCodeData(qrData);
            }
          })
          .catch(err => {
            console.warn('Erro ao detectar QR Code:', err);
          });
      } else {
        // Fallback: usar a biblioteca jsQR (se disponível)
        try {
          // Importar jsQR dinamicamente
          import('jsqr').then(module => {
            const jsQR = module.default || module;
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code && code.data) {
              handleQRCodeData(code.data);
            }
          }).catch(() => {
            // Se jsQR não estiver disponível, mostrar mensagem
            if (!window._jsqrErrorShown) {
              window._jsqrErrorShown = true;
              // Tentar carregar via CDN
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
              script.onload = () => {
                window._jsqrErrorShown = false;
              };
              document.head.appendChild(script);
            }
          });
        } catch (err) {
          console.warn('Erro no fallback de QR Code:', err);
        }
      }
    }, 500);

    // Limpar intervalo quando o componente desmontar
    return () => {
      clearInterval(scanInterval);
    };
  };

  const handleQRCodeData = (data) => {
    if (loading) return;
    
    console.log('QR Code escaneado:', data);
    
    // Parar o scanner
    setScanning(false);
    setScanResult(data);
    
    // Verificar o QR Code
    verifyQRCode(data);
  };

  const verifyQRCode = async (qrData) => {
  setLoading(true);
  try {
    console.log('📦 QR Code escaneado:', qrData);
    
    // Extrair orderId do QR Code
    let orderIdentifier = qrData.trim();
    
    // Tentar extrair se for um formato conhecido
    if (qrData.includes('ORD-')) {
      // Extrair o número do pedido completo
      const match = qrData.match(/ORD-[A-Z0-9-]+/i);
      if (match) {
        orderIdentifier = match[0];
      }
    } else if (qrData.includes('order_')) {
      // Extrair ID do pedido
      const match = qrData.match(/order_([a-f0-9-]+)/i);
      if (match) {
        orderIdentifier = match[1];
      }
    } else if (qrData.match(/^[a-f0-9-]{36}$/i)) {
      // É um UUID
      orderIdentifier = qrData;
    }
    
    console.log('🔍 Verificando pedido:', orderIdentifier);
    
    // Tentar marcar como entregue usando o identificador
    const response = await api.patch(`/orders/${orderIdentifier}/deliver`);
    
    if (response.data.success) {
      toast.success('✅ Pedido entregue com sucesso!');
      // Redirecionar para o dashboard após 2 segundos
      setTimeout(() => {
        navigate('/delivery');
      }, 2000);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar QR:', error);
    console.error('❌ Response:', error.response?.data);
    
    const errorMessage = error.response?.data?.error || 'QR Code inválido ou pedido já entregue';
    toast.error(errorMessage);
    setScanResult(null);
    
    // Reiniciar scanner após 2 segundos
    setTimeout(() => {
      setScanning(true);
      setLoading(false);
      // Reiniciar a detecção
      if (videoRef.current && canvasRef.current) {
        startScanning();
      }
    }, 2000);
  } finally {
    setLoading(false);
  }
};

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    // Reiniciar câmera com novo modo
    stopCamera();
    setTimeout(() => startCamera(), 500);
  };

  const toggleFlash = () => {
    setFlash(!flash);
    // Implementar flash se suportado
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities().torch) {
        track.applyConstraints({
          advanced: [{ torch: flash }]
        });
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    navigate('/delivery');
  };

  const handleManualInput = () => {
    // Permitir entrada manual do código
    const code = prompt('Digite o código do pedido:');
    if (code) {
      verifyQRCode(code);
    }
  };

  return (
    <div style={{ 
      paddingBottom: '80px',
      minHeight: '100vh',
      background: 'var(--bg)',
    }}>
      <div style={{
        padding: 'var(--spacing-lg) var(--spacing-md)',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        marginBottom: 'var(--spacing-lg)',
        borderRadius: '0 0 30px 30px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
            }}>
              Scanner QR Code
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.85rem',
            }}>
              Aponte a câmera para o QR Code do cliente
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
            }}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="container">
        <GlassCard style={{ 
          padding: 'var(--spacing-md)',
          overflow: 'hidden',
        }}>
          {error ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
            }}>
              <ErrorIcon style={{ fontSize: 64, color: 'var(--error)', marginBottom: 'var(--spacing-md)' }} />
              <h3 style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
                Erro na Câmera
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {error}
              </p>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                <AnimatedButton
                  variant="primary"
                  onClick={startCamera}
                  icon={<CameraIcon />}
                  style={{ flex: 1 }}
                >
                  Tentar Novamente
                </AnimatedButton>
                <AnimatedButton
                  variant="secondary"
                  onClick={handleManualInput}
                  style={{ flex: 1 }}
                >
                  Inserir Manual
                </AnimatedButton>
              </div>
            </div>
          ) : (
            <>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                aspectRatio: '4/3',
                background: '#000',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                
                {/* Overlay do scanner */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '2px solid rgba(255,255,255,0.8)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 0 0 4000px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      width: '20px',
                      height: '20px',
                      borderTop: '3px solid var(--secondary)',
                      borderLeft: '3px solid var(--secondary)',
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: '20px',
                      height: '20px',
                      borderTop: '3px solid var(--secondary)',
                      borderRight: '3px solid var(--secondary)',
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: -2,
                      left: -2,
                      width: '20px',
                      height: '20px',
                      borderBottom: '3px solid var(--secondary)',
                      borderLeft: '3px solid var(--secondary)',
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: '20px',
                      height: '20px',
                      borderBottom: '3px solid var(--secondary)',
                      borderRight: '3px solid var(--secondary)',
                    }} />
                    
                    {/* Animação de scan */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(to right, transparent, var(--secondary), transparent)',
                      animation: 'scanLine 2s ease-in-out infinite',
                    }} />
                  </div>
                  <style>{`
                    @keyframes scanLine {
                      0%, 100% { top: 0; }
                      50% { top: calc(100% - 2px); }
                    }
                  `}</style>
                </div>

                {/* Status do scanner */}
                {scanning && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'var(--spacing-md)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 16px',
                    borderRadius: 'var(--radius-full)',
                    color: 'white',
                    fontSize: '0.75rem',
                  }}>
                    🔍 Aguardando QR Code...
                  </div>
                )}

                {loading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)',
                  }}>
                    <div className="spinner" style={{ width: '40px', height: '40px' }} />
                    <p style={{ color: 'white', fontSize: '0.9rem' }}>
                      Verificando QR Code...
                    </p>
                  </div>
                )}
              </div>

              {/* Resultado do scan */}
              {scanResult && !loading && (
                <div style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  background: 'var(--success)20',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--success)30',
                  textAlign: 'center',
                }}>
                  <CheckIcon style={{ color: 'var(--success)', fontSize: 32 }} />
                  <h4 style={{ fontWeight: 600, marginTop: 'var(--spacing-xs)' }}>
                    QR Code Identificado!
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                    {scanResult}
                  </p>
                </div>
              )}

              {/* Controles */}
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-md)',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={toggleCamera}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-xs)',
                    transition: 'all var(--transition-normal)',
                  }}
                >
                  <FlipIcon />
                  Virar Câmera
                </button>
                <button
                  onClick={toggleFlash}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-xs)',
                    transition: 'all var(--transition-normal)',
                  }}
                >
                  {flash ? <FlashOnIcon /> : <FlashOffIcon />}
                  {flash ? 'Desligar Flash' : 'Ligar Flash'}
                </button>
              </div>

              <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-sm)',
              }}>
                <AnimatedButton
                  variant="secondary"
                  onClick={handleManualInput}
                  fullWidth
                >
                  Inserir Código Manualmente
                </AnimatedButton>
              </div>
            </>
          )}
        </GlassCard>

        {/* Instruçõe */}
        <GlassCard style={{
          marginTop: 'var(--spacing-md)',
          padding: 'var(--spacing-md)',
        }}>
          <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
            📋 Como Usar
          </h4>
          <ol style={{
            paddingLeft: 'var(--spacing-md)',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            lineHeight: 2,
          }}>
            <li>Peça ao cliente para abrir o QR Code no celular dele</li>
            <li>Aponte a câmera para o QR Code</li>
            <li>Aguarde a leitura automática</li>
            <li>Confirme a entrega do pedido</li>
          </ol>
        </GlassCard>
      </div>

      {/* Estilos globais para o spinner */}
      <style>{`
        .spinner {
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;