// src/services/storage.js//
class StorageService {
  constructor() {
    this.prefix = 'delivery_';
  }

  // Get item from storage
  get(key) {
    try {
      const value = localStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  }

  // Set item in storage
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting storage:', error);
      return false;
    }
  }

  // Remove item from storage
  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  }

  // Clear all items with prefix
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Get all keys with prefix
  keys() {
    try {
      const keys = Object.keys(localStorage);
      return keys.filter(key => key.startsWith(this.prefix)).map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }

  // Check if key exists
  has(key) {
    return this.get(key) !== null;
  }

  // Get item with expiration
  getWithExpiry(key) {
    const item = this.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.remove(key);
      return null;
    }
    
    return item.value;
  }

  // Set item with expiration (in minutes)
  setWithExpiry(key, value, minutes = 60) {
    const item = {
      value,
      expiry: Date.now() + (minutes * 60 * 1000)
    };
    return this.set(key, item);
  }

  // Session storage methods
  sessionGet(key) {
    try {
      const value = sessionStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting from sessionStorage:', error);
      return null;
    }
  }

  sessionSet(key, value) {
    try {
      sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting sessionStorage:', error);
      return false;
    }
  }

  sessionRemove(key) {
    try {
      sessionStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
      return false;
    }
  }

  sessionClear() {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  }
}

export default new StorageService();