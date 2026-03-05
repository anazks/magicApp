import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import Axios from '../api/Axios';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        if (storedToken) {
          setTokenState(storedToken);
          Axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const setToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await SecureStore.setItemAsync('userToken', newToken);
        setTokenState(newToken);
        Axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      } else {
        await SecureStore.deleteItemAsync('userToken');
        setTokenState(null);
        delete Axios.defaults.headers.common.Authorization;
      }
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
    router.replace('/');
  };

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, logout, isLoading }}>
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
