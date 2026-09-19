import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
import { User } from '../api/types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const storage = {
  async getItem(key: string) {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await getItemAsync(key);
    } catch (error) {
      console.warn(`Storage error for key ${key}:`, error);
      return null;
    }
  },
  async setItem(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      await setItemAsync(key, value);
    } catch (error) {
      console.warn(`Storage error for key ${key}:`, error);
    }
  },
  async deleteItem(key: string) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await deleteItemAsync(key);
    } catch (error) {
      console.warn(`Storage error for key ${key}:`, error);
    }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (!token) return;
    let alive = true;

    const ping = async () => {
      if (!alive) return;
      try {
        await apiClient.post('/users/me/ping', {});
      } catch {}
    };
    void ping();
    const intervalId = setInterval(() => void ping(), 30000);
    return () => {
      alive = false;
      clearInterval(intervalId);
    };
  }, [token]);

  async function loadStoredAuth() {
    try {
      const storedToken = await storage.getItem('userToken');
      const storedUser = await storage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Refresh user data from API
        try {
          const freshUser = await apiClient.get<User>('/users/me');
          setUser(freshUser);
          await storage.setItem('userData', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Failed to refresh user data', error);
          // If token is invalid, logout
          if ((error as Error).message.includes('401')) {
            await logout();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load auth state', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(newToken: string, newUser: User) {
    setToken(newToken);
    setUser(newUser);
    await storage.setItem('userToken', newToken);
    await storage.setItem('userData', JSON.stringify(newUser));
  }

  async function logout() {
    setToken(null);
    setUser(null);
    await storage.deleteItem('userToken');
    await storage.deleteItem('userData');
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
