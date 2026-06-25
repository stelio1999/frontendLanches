// src/components/client/SearchBar.jsx//
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';

const SearchBar = ({ 
  value = '', 
  onChange, 
  placeholder = 'Buscar...',
  onFocus,
  onBlur,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChange && onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <motion.div
      animate={{
        scale: isFocused ? 1.02 : 1,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        border: isFocused ? '2px solid var(--secondary)' : '1px solid var(--border)',
        borderRadius: 'var(--radius-full)',
        padding: '0 var(--spacing-md)',
        transition: 'all var(--transition-normal)',
        marginBottom: 'var(--spacing-md)',
        position: 'relative',
      }}
    >
      <SearchIcon style={{ 
        color: isFocused ? 'var(--secondary)' : 'var(--text-secondary)',
        transition: 'all var(--transition-normal)',
      }} />
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          onFocus && onFocus();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur && onBlur();
        }}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: '12px var(--spacing-md)',
          border: 'none',
          background: 'transparent',
          fontSize: '1rem',
          color: 'var(--text)',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />

      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleClear}
            style={{
              background: 'var(--glass-bg)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all var(--transition-normal)',
            }}
          >
            <CloseIcon style={{ fontSize: 18 }} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchBar;