// src/components/shared/QRCode.jsx
import React from 'react';
import  QRCodeSVG  from 'react-qr-code';
import GlassCard from '../common/GlassCard';

const QRCode = ({ value, size = 200, label, showLabel = true, className = '' }) => {
  if (!value) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        color: 'var(--text-secondary)',
      }}>
        <p>Nenhum dado para gerar QR Code</p>
      </div>
    );
  }

  return (
    <GlassCard style={{ 
      textAlign: 'center',
      padding: 'var(--spacing-lg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'transparent',
      boxShadow: 'none',
    }}>
      <div style={{
        padding: 'var(--spacing-md)',
        background: 'white',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}>
        <QRCodeSVG
          className={`qr-code-svg ${className}`}
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="#1a237e"
          level="H"
          includeMargin={true}
        />
      </div>
      {showLabel && label && (
        <p style={{
          marginTop: 'var(--spacing-md)',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          fontWeight: 500,
        }}>
          {label}
        </p>
      )}
      {showLabel && !label && (
        <p style={{
          marginTop: 'var(--spacing-md)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
        }}>
          Escaneie o QR Code para confirmar a entrega
        </p>
      )}
    </GlassCard>
  );
};

export default QRCode;