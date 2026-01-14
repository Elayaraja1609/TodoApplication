import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';
import { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure SecureStore is ready
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await StorageService.getAuthToken();
      if (token && token.trim() !== '') {
        // Token exists, try to get user data from storage
        const userData = await StorageService.getUserData();
        if (userData) {
          setUser(userData as User);
        } else {
          // If no user data in storage, create placeholder (shouldn't happen after login)
          setUser({ 
            id: 0, 
            email: '', 
            firstName: '', 
            lastName: '',
            role: 'User'
          } as User);
        }
      } else {
        // No token found, user is not authenticated
        setUser(null);
      }
    } catch (error) {
      // If there's any error checking auth status, assume user is not authenticated
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiService.login(credentials);
      await StorageService.saveAuthToken(response.token);
      await StorageService.saveRefreshToken(response.refreshToken);
      await StorageService.saveUserData(response.user); // Store user data
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await apiService.register(data);
      await StorageService.saveAuthToken(response.token);
      await StorageService.saveRefreshToken(response.refreshToken);
      await StorageService.saveUserData(response.user); // Store user data
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await StorageService.clearAuthTokens();
    await StorageService.clearUserData();
    await StorageService.clearPin(); // Clear PIN on logout
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

