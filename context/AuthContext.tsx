import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client
import { Session, User } from '@supabase/supabase-js';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (emailInput: string, passwordInput: string) => Promise<{ error: any }>;
  signUp: (emailInput: string, passwordInput: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        if (_event === 'SIGNED_IN') {
          showNotification('Login bem-sucedido!', 'success');
        }
        if (_event === 'SIGNED_OUT') {
          showNotification('Logout efetuado.', 'info');
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [showNotification]);

  const login = async (emailInput: string, passwordInput: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });
    if (error) {
      showNotification(error.message || 'Falha no login.', 'error');
    }
    return { error };
  };

  const signUp = async (emailInput: string, passwordInput: string) => {
    const { error } = await supabase.auth.signUp({
      email: emailInput,
      password: passwordInput,
    });
    if (error) {
      showNotification(error.message || 'Falha ao criar conta.', 'error');
    } else {
      showNotification('Conta criada com sucesso! Verifique seu e-mail para confirmação.', 'success');
    }
    return { error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showNotification(error.message || 'Falha ao fazer logout.', 'error');
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      showNotification(error.message || 'Falha no login com Google.', 'error');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isAuthenticated, login, signUp, logout, signInWithGoogle }}>
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