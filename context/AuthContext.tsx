import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';

interface AuthUser {
  username: string;
  // Add other user properties if needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '123456a'; // Store securely in a real app
const AUTH_STORAGE_KEY = 'angoTechAdminAuth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (localStorage.getItem(AUTH_STORAGE_KEY) === 'true') {
      return { username: ADMIN_USERNAME }; // Assuming only admin user for now
    }
    return null;
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [isAuthenticated]);

  const login = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setUser({ username: ADMIN_USERNAME });
      showNotification('Login bem-sucedido!', 'success');
      return true;
    } else {
      showNotification('Credenciais inválidas.', 'error');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    showNotification('Logout efetuado.', 'info');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};