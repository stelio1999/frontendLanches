// src/components/client/CategoryFilter.jsx//
import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories = [], selected = 'all', onSelect }) => {
  const scrollRef = useRef(null);

  const getCategoryIcon = (category) => {
    const icons = {
      'all': '📋',
      'Hambúrgueres': '🍔',
      'Pizzas': '🍕',
      'Bebidas': '🥤',
      'Sobremesas': '🍰',
      'Saladas': '🥗',
      'Massas': '🍝',
      'Lanches': '🌮',
      'Café': '☕',
    };
    return icons[category] || '🍽️';
  };

  return (
    <div style={{
      position: 'relative',
      marginBottom: 'var(--spacing-md)',
    }}>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          overflowX: 'auto',
          padding: 'var(--spacing-xs) 0 var(--spacing-sm)',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        className="hide-scrollbar"
      >
        {categories.map((category) => {
          const isSelected = selected === category;
          return (
            <motion.button
              key={category}
              onClick={() => onSelect && onSelect(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? 'none' : '1px solid var(--border)',
                background: isSelected 
                  ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                  : 'var(--glass-bg)',
                color: isSelected ? 'white' : 'var(--text)',
                fontWeight: isSelected ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                backdropFilter: isSelected ? 'none' : 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                boxShadow: isSelected ? '0 4px 16px rgba(21, 101, 192, 0.3)' : 'none',
              }}
            >
              <span>{getCategoryIcon(category)}</span>
              <span>{category === 'all' ? 'Todos' : category}</span>
            </motion.button>
          );
        })}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryFilter;