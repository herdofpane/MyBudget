import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Low-level storage client abstraction for persistent key-value data.
 */
export const storageClient = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const raw = JSON.stringify(value);
      await AsyncStorage.setItem(key, raw);
    } catch {
      // Graceful fallback for non-blocking storage
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
  },
};
