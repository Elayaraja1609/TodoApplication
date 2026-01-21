import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Todo, Category, Reminder, User } from '../types';

// Use SecureStore for native platforms, AsyncStorage for web
let SecureStore: any;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
} else {
  // Fallback to AsyncStorage for web
  SecureStore = null;
}

const STORAGE_KEYS = {
  TODOS: '@todos',
  CATEGORIES: '@categories',
  REMINDERS: '@reminders',
  LAST_SYNC: '@lastSync',
  PIN: 'userPin', 
  PIN_UNLOCKED: '@pinUnlocked'
};

export class StorageService {
  // Auth tokens (secure storage)
  static async saveAuthToken(token: string): Promise<void> {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        await SecureStore.setItemAsync('authToken', token);
      } else {
        // Fallback to AsyncStorage for web
        await AsyncStorage.setItem('authToken', token);
      }
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        return await SecureStore.getItemAsync('authToken');
      } else {
        // Fallback to AsyncStorage for web
        return await AsyncStorage.getItem('authToken');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  static async saveRefreshToken(token: string): Promise<void> {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        await SecureStore.setItemAsync('refreshToken', token);
      } else {
        // Fallback to AsyncStorage for web
        await AsyncStorage.setItem('refreshToken', token);
      }
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        return await SecureStore.getItemAsync('refreshToken');
      } else {
        // Fallback to AsyncStorage for web
        return await AsyncStorage.getItem('refreshToken');
      }
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  static async clearAuthTokens(): Promise<void> {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('refreshToken');
      } else {
        // Fallback to AsyncStorage for web
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
      }
      // Also clear user data
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
      // Don't throw, just log the error
    }
  }

  // User data (stored in AsyncStorage for easy access)
  static async saveUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  static async getUserData(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem('userData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error clearing user data:', error);
      // Don't throw, just log the error
    }
  }

  // Todos (local storage for offline support)
  static async saveTodos(todos: Todo[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  }

  static async getTodos(): Promise<Todo[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
    return data ? JSON.parse(data) : [];
  }

  // Categories
  static async saveCategories(categories: Category[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  static async getCategories(): Promise<Category[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  // Reminders
  static async saveReminders(reminders: Reminder[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }

  static async getReminders(): Promise<Reminder[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
    return data ? JSON.parse(data) : [];
  }

  // Last sync timestamp
  static async saveLastSync(timestamp: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  static async getLastSync(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  // PIN storage (secure storage)
  static async savePin(pin: string): Promise<void> {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        await SecureStore.setItemAsync(STORAGE_KEYS.PIN, pin);
      } else {
        // For web, use AsyncStorage (less secure but functional)
        await AsyncStorage.setItem(STORAGE_KEYS.PIN, pin);
      }
    } catch (error) {
      console.error('Error saving PIN:', error);
      throw error;
    }
  }

  static async getPin(): Promise<string | null> {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        return await SecureStore.getItemAsync(STORAGE_KEYS.PIN);
      } else {
        return await AsyncStorage.getItem(STORAGE_KEYS.PIN);
      }
    } catch (error) {
      console.error('Error getting PIN:', error);
      return null;
    }
  }

  static async clearPin(): Promise<void> {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.PIN);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.PIN);
      }
    } catch (error) {
      console.error('Error clearing PIN:', error);
    }
  }

  // PIN unlock state (NOT sensitive)
static async setPinUnlocked(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PIN_UNLOCKED,
      value ? 'true' : 'false'
    );
  } catch (error) {
    console.error('Error setting pin unlocked state:', error);
  }
}

static async getPinUnlocked(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.PIN_UNLOCKED);
    return value === 'true';
  } catch (error) {
    console.error('Error getting pin unlocked state:', error);
    return false;
  }
}

static async clearPinUnlocked(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PIN_UNLOCKED);
  } catch (error) {
    console.error('Error clearing pin unlocked state:', error);
  }
}


  // Generic item storage
  static async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  static async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  static async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  // Clear all local data
  static async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TODOS,
      STORAGE_KEYS.CATEGORIES,
      STORAGE_KEYS.REMINDERS,
      STORAGE_KEYS.LAST_SYNC,
      'userData', // User data stored separately
      'theme', // Theme preference
    ]);
    await this.clearAuthTokens();
    await this.clearPin();
  }
}

