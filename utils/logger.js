const DEBUG = true;

export const Logger = {
  info: (msg, data = null) => {
    if (DEBUG) {
      console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data || '');
    }
  },
  error: (msg, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error || '');
  },
  warn: (msg, data = null) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data || '');
  }
};
