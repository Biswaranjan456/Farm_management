// Local Storage wrapper (mimics Claude's storage API)
export const storage = {
  get: async (key) => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        return { key, value, shared: false };
      }
      return null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  set: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return { key, value, shared: false };
    } catch (error) {
      console.error('Storage set error:', error);
      return null;
    }
  },

  delete: async (key) => {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    } catch (error) {
      console.error('Storage delete error:', error);
      return null;
    }
  },

  list: async (prefix = '') => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
      return { keys, prefix, shared: false };
    } catch (error) {
      console.error('Storage list error:', error);
      return null;
    }
  }
};

// Make it available globally like in Claude
if (typeof window !== 'undefined') {
  window.storage = storage;
}