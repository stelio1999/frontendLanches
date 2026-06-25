// src/components/common/LoadingSkeleton.jsx//
import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className = '', style = {} }) => (
  <div 
    className={`skeleton ${className}`} 
    style={{
      background: 'linear-gradient(90deg, var(--border) 25%, var(--glass-bg) 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 'var(--radius-sm)',
      ...style
    }} 
  />
);

const LoadingSkeleton = ({ type = 'product', count = 4 }) => {
  const renderProductSkeleton = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 'var(--spacing-md)',
    }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-md)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Skeleton style={{ width: '100%', height: '160px', borderRadius: 'var(--radius-sm)' }} />
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <Skeleton style={{ width: '80%', height: '16px' }} />
            <Skeleton style={{ width: '60%', height: '12px', marginTop: 'var(--spacing-xs)' }} />
            <Skeleton style={{ width: '40%', height: '20px', marginTop: 'var(--spacing-sm)' }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderOrderSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--spacing-md)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          gap: 'var(--spacing-md)',
        }}>
          <Skeleton style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)' }} />
          <div style={{ flex: 1 }}>
            <Skeleton style={{ width: '70%', height: '16px' }} />
            <Skeleton style={{ width: '50%', height: '12px', marginTop: 'var(--spacing-xs)' }} />
            <Skeleton style={{ width: '30%', height: '14px', marginTop: 'var(--spacing-xs)' }} />
          </div>
          <Skeleton style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
        </div>
      ))}
    </div>
  );

  const renderListSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          gap: 'var(--spacing-md)',
        }}>
          <Skeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <Skeleton style={{ width: '60%', height: '14px' }} />
            <Skeleton style={{ width: '40%', height: '10px', marginTop: 'var(--spacing-xs)' }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderMapSkeleton = () => (
    <div style={{
      width: '100%',
      height: '300px',
      background: 'var(--border)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Skeleton style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto' }} />
        <Skeleton style={{ width: '120px', height: '16px', margin: 'var(--spacing-sm) auto 0' }} />
      </div>
    </div>
  );

  switch(type) {
    case 'product':
      return renderProductSkeleton();
    case 'order':
      return renderOrderSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'map':
      return renderMapSkeleton();
    default:
      return renderProductSkeleton();
  }
};

export default LoadingSkeleton;