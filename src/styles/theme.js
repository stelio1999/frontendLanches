// src/styles/theme.js//
export const theme = {
  colors: {
    primary: '#1a237e',
    primaryLight: '#283593',
    primaryDark: '#0d1445',
    secondary: '#1565c0',
    secondaryLight: '#42a5f5',
    accent: '#ff6f00',
    success: '#2e7d32',
    warning: '#f57f17',
    error: '#c62828',
    info: '#0d47a1',
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },
  
  light: {
    background: '#f5f7fa',
    surface: '#ffffff',
    text: '#1a1a2e',
    textSecondary: '#4a4a6a',
    border: 'rgba(0, 0, 0, 0.08)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    glassBackground: 'rgba(255, 255, 255, 0.15)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
  },
  
  dark: {
    background: '#0a0a1a',
    surface: '#141428',
    text: '#f0f2f5',
    textSecondary: '#a0a0b0',
    border: 'rgba(255, 255, 255, 0.08)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    glassBackground: 'rgba(0, 0, 0, 0.4)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    h1: {
      fontSize: 32,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 20,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.4,
    },
    small: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.3,
    },
  },
  
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
    md: '0 4px 16px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.12)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.16)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  },
  
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },
  
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
};

export default theme;