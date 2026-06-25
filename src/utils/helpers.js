// src/utils/helpers.js//
export class Helpers {
  // Formatar preço
  static formatPrice(amount) {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Formatar data
  static formatDate(date, format = 'dd/MM/yyyy HH:mm') {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  // Tempo relativo
  static timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return this.formatDate(date, 'dd/MM/yyyy');
  }

  // Validar telefone (Moçambique)
  static validatePhone(phone) {
    const cleaned = phone.replace(/\s/g, '');
    const pattern = /^(8|84|85|82|83|86|87)\d{8}$/;
    return pattern.test(cleaned);
  }

  // Validar email
  static validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  // Validar senha
  static validatePassword(password) {
    return password.length >= 6;
  }

  // Calcular distância (Haversine)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRad(deg) {
    return deg * (Math.PI/180);
  }

  // Calcular taxa de entrega
  static calculateDeliveryFee(distanceKm) {
    const FREE_DISTANCE = 3;
    const RATE_PER_KM = 50;
    
    if (distanceKm <= FREE_DISTANCE) return 0;
    return Math.ceil((distanceKm - FREE_DISTANCE) * RATE_PER_KM);
  }

  // Truncar texto
  static truncate(text, maxLength = 100, suffix = '...') {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + suffix;
  }

  // Gerar ID único
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Validar objeto
  static validateObject(obj, schema) {
    const errors = {};
    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      
      if (rules.required && !value) {
        errors[key] = `${key} é obrigatório`;
        continue;
      }
      
      if (value) {
        if (rules.minLength && value.length < rules.minLength) {
          errors[key] = `${key} deve ter pelo menos ${rules.minLength} caracteres`;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors[key] = `${key} deve ter no máximo ${rules.maxLength} caracteres`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors[key] = `${key} inválido`;
        }
        if (rules.type === 'email' && !this.validateEmail(value)) {
          errors[key] = 'Email inválido';
        }
        if (rules.type === 'phone' && !this.validatePhone(value)) {
          errors[key] = 'Telefone inválido';
        }
      }
    }
    return errors;
  }

  // Agrupar array por chave
  static groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  }

  // Calcular total de array
  static sum(array, key) {
    return array.reduce((sum, item) => sum + (item[key] || 0), 0);
  }

  // Debounce
  static debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle
  static throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Copiar para clipboard
  static copyToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return Promise.resolve();
  }

  // Obter parâmetros da URL
  static getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }

  // Construir query string
  static buildQueryString(params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        query.append(key, value);
      }
    }
    return query.toString();
  }

  // Verificar se é dispositivo móvel
  static isMobile() {
    return window.innerWidth <= 768;
  }

  // Verificar se é iOS
  static isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  // Verificar se é Android
  static isAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  // Scroll suave para elemento
  static scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  // Sleep
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry com backoff exponencial
  static async retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts) {
          await this.sleep(delay * Math.pow(2, attempt - 1));
        }
      }
    }
    throw lastError;
  }
}

export default Helpers;