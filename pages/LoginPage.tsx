import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // To toggle between Login and Sign Up
  const { login, signUp, signInWithGoogle, isAuthenticated } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();

  const from = location.state?.from?.pathname || "/profile"; // Redirect to profile or intended page

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await login(email, password);
    }
    setIsLoading(false);
    // Navigation is handled by the AuthContext useEffect on auth state change
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
    // Navigation is handled by the AuthContext useEffect on auth state change
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-textPrimary">
            {isSignUp ? 'Criar Conta' : 'Login'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-textSecondary text-textPrimary rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                placeholder="O seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password"className="sr-only">
                Palavra-passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-textSecondary text-textPrimary rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                placeholder="A sua palavra-passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? (isSignUp ? 'A criar conta...' : 'A entrar...') : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-textSecondary">
                Ou continue com
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              isLoading={isLoading && !isSignUp} // Show loading only if Google sign-in was clicked
            >
              <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Google
            </Button>
          </div>
        </div>
        <div className="text-sm text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-primary hover:text-primary-dark"
          >
            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Criar Conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;