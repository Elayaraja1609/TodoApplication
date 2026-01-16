import axios, { AxiosInstance, AxiosError } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use SecureStore for native platforms, AsyncStorage for web
let SecureStore: any;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
} else {
  SecureStore = null;
}
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
          Reminder,
          CreateReminderRequest,
          UpdateReminderRequest,
          SetupPinRequest,
          VerifyPinRequest,
          ChangePinRequest,
          UserPreferences,
          UpdateUserPreferencesRequest,
        } from '../types';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical device, use your computer's IP address (e.g., http://192.168.1.xxx:5000/api/v1)
// You can also set this via environment variable: EXPO_PUBLIC_API_URL
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('Using environment variable API URL:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // if (__DEV__) {
  //   // Auto-detect platform and use appropriate URL
  //   if (Platform.OS === 'android') {
  //     // Android emulator uses 10.0.2.2 to access host machine's localhost
  //     const url = 'http://10.0.2.2:5000/api/v1';
  //     console.log('Using Android dev URL:', url);
  //     return url;
  //   } else if (Platform.OS === 'web') {
  //     // Web uses localhost
  //     const url = 'http://localhost:5000/api/v1';
  //     console.log('Using Web dev URL:', url);
  //     return url;
  //   } else {
  //     // iOS simulator uses localhost
  //     const url = 'http://localhost:5000/api/v1';
  //     console.log('Using iOS dev URL:', url);
  //     return url;
  //   }
  // }
  const prodUrl = 'http://localhost:5000/api/v1';
  console.log('Using Production URL:', prodUrl);
  return prodUrl;
};

const API_BASE_URL = getApiBaseUrl();
console.log('API Base URL configured:', API_BASE_URL);

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout (increased for Lambda cold starts)
    });

    // Add request interceptor to include token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          let token: string | null = null;
          if (SecureStore && Platform.OS !== 'web') {
            token = await SecureStore.getItemAsync('authToken');
          } else {
            token = await AsyncStorage.getItem('authToken');
          }
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`[API] Adding Authorization header for ${config.method?.toUpperCase()} ${config.url}`);
          } else {
            console.warn(`[API] No token found for ${config.method?.toUpperCase()} ${config.url}`);
          }
        } catch (error) {
          console.error('Error getting token in interceptor:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh and error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Handle network errors and other axios errors
        if (!error.response) {
          // Network error or timeout
          console.error('Network error:', error.message);
          const networkError = new Error('Network error. Please check your internet connection.');
          (networkError as any).isNetworkError = true;
          return Promise.reject(networkError);
        }
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          try {
            let refreshToken: string | null = null;
            let token: string | null = null;
            
            if (SecureStore && Platform.OS !== 'web') {
              refreshToken = await SecureStore.getItemAsync('refreshToken');
              token = await SecureStore.getItemAsync('authToken');
            } else {
              refreshToken = await AsyncStorage.getItem('refreshToken');
              token = await AsyncStorage.getItem('authToken');
            }
            
            if (refreshToken) {
              try {
                const response = await axios.post(`${API_BASE_URL}/Auth/refresh`, {
                  token,
                  refreshToken,
                });
                const { token: newToken, refreshToken: newRefreshToken } = response.data;
                
                if (SecureStore && Platform.OS !== 'web') {
                  await SecureStore.setItemAsync('authToken', newToken);
                  await SecureStore.setItemAsync('refreshToken', newRefreshToken);
                } else {
                  await AsyncStorage.setItem('authToken', newToken);
                  await AsyncStorage.setItem('refreshToken', newRefreshToken);
                }
                
                // Retry original request
                if (error.config) {
                  error.config.headers.Authorization = `Bearer ${newToken}`;
                  return this.api.request(error.config);
                }
              } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                if (SecureStore && Platform.OS !== 'web') {
                  await SecureStore.deleteItemAsync('authToken');
                  await SecureStore.deleteItemAsync('refreshToken');
                } else {
                  await AsyncStorage.removeItem('authToken');
                  await AsyncStorage.removeItem('refreshToken');
                }
                throw refreshError;
              }
            }
          } catch (error) {
            console.error('Error in refresh token interceptor:', error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('Register request data:', JSON.stringify(data, null, 2));
      console.log('Register URL:', `${API_BASE_URL}/Auth/register`);
      const response = await this.api.post<AuthResponse>('/Auth/register', data);
      return response.data;
    } catch (error: any) {
      console.error('Register API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/Auth/login`);
      console.log('Platform:', Platform.OS);
      const response = await this.api.post<AuthResponse>('/Auth/login', data, {
        timeout: 10000, // 10 second timeout
      });
      console.log('Login successful');
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request,
      });
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timeout. Please check if the backend server is running and accessible.');
      }
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error(`Network error. Cannot reach backend at ${API_BASE_URL}. Please check:\n1. Backend is running on port 5000\n2. If using physical device, use your computer's IP address\n3. Device and computer are on the same network`);
      }
      
      throw error;
    }
  }

  // Todo endpoints
  async getTodos(): Promise<Todo[]> {
    try {
      const response = await this.api.get<Todo[]>('/todos');
      return response.data;
    } catch (error: any) {
      console.error('[API] GetTodos error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  async getTodo(id: number): Promise<Todo> {
    const response = await this.api.get<Todo>(`/todos/${id}`);
    return response.data;
  }

  async createTodo(data: CreateTodoRequest): Promise<Todo> {
    const response = await this.api.post<Todo>('/todos', data);
    return response.data;
  }

  async updateTodo(id: number, data: UpdateTodoRequest): Promise<Todo> {
    const response = await this.api.put<Todo>(`/todos/${id}`, data);
    return response.data;
  }

  async deleteTodo(id: number): Promise<void> {
    await this.api.delete(`/todos/${id}`);
  }

  async toggleTodoComplete(id: number): Promise<Todo> {
    const response = await this.api.post<Todo>(`/todos/${id}/toggle-complete`);
    return response.data;
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    try {
      console.log('Fetching categories from:', `${API_BASE_URL}/categories`);
      const response = await this.api.get<Category[]>('/categories');
      console.log('Categories response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get categories API error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      throw error;
    }
  }

  async getCategory(id: number): Promise<Category> {
    const response = await this.api.get<Category>(`/categories/${id}`);
    return response.data;
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await this.api.post<Category>('/categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
    const response = await this.api.put<Category>(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // Reminder endpoints
  async getReminders(): Promise<Reminder[]> {
    const response = await this.api.get<Reminder[]>('/reminders');
    return response.data;
  }

  async getReminder(id: number): Promise<Reminder> {
    const response = await this.api.get<Reminder>(`/reminders/${id}`);
    return response.data;
  }

  async createReminder(data: CreateReminderRequest): Promise<Reminder> {
    const response = await this.api.post<Reminder>('/reminders', data);
    return response.data;
  }

  async updateReminder(id: number, data: UpdateReminderRequest): Promise<Reminder> {
    const response = await this.api.put<Reminder>(`/reminders/${id}`, data);
    return response.data;
  }

          async deleteReminder(id: number): Promise<void> {
            await this.api.delete(`/reminders/${id}`);
          }

          // PIN endpoints
          async setupPin(data: SetupPinRequest): Promise<void> {
            await this.api.post('/Auth/pin/setup', data);
          }

          async verifyPin(data: VerifyPinRequest): Promise<{ isValid: boolean }> {
            const response = await this.api.post<{ isValid: boolean }>('/Auth/pin/verify', data);
            return response.data;
          }

          async changePin(data: ChangePinRequest): Promise<void> {
            await this.api.post('/Auth/pin/change', data);
          }

          async hasPin(): Promise<{ hasPin: boolean }> {
            try {
              const response = await this.api.get<{ hasPin: boolean }>('/Auth/pin/has');
              return response.data;
            } catch (error: any) {
              console.error('[API] HasPin error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
              });
              throw error;
            }
          }

          // User Preferences endpoints
          async getUserPreferences(): Promise<UserPreferences> {
            try {
              const response = await this.api.get<UserPreferences>('/UserPreferences');
              return response.data;
            } catch (error: any) {
              console.error('[API] GetUserPreferences error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
              });
              throw error;
            }
          }

          async updateUserPreferences(data: UpdateUserPreferencesRequest): Promise<UserPreferences> {
            const response = await this.api.put<UserPreferences>('/UserPreferences', data);
            return response.data;
          }
        }

        export const apiService = new ApiService();

