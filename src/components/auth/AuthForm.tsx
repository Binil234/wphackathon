import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, User, KeyRound } from 'lucide-react';

interface AuthFormProps {
  onClose: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={onClose ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" : ""}>
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden ${onClose ? "animate-fade-in" : ""}`}>
        {onClose && (
          <div className="flex justify-between items-center bg-primary-500 text-white px-6 py-4">
            <h2 className="text-lg font-semibold">
              {isLogin ? 'Login' : 'Sign Up'}
            </h2>
            <button 
              onClick={onClose}
              className="text-white hover:bg-primary-600 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="form-control">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          
          <div className="form-control">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-error-50 text-error-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
            
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;