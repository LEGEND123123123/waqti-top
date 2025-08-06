import React, { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

interface LoginPageProps {
  setActivePage: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setActivePage }) => {
  const { t, isRTL } = useLanguage();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!password) {
      setError('Password is required');
      setIsSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Use real Supabase authentication
      const result = await login(email, password);
      
      if (result.success) {
        setActivePage('dashboard');
      } else {
        setError(result.error || 'Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center">
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 w-full max-w-md border-t-4 border-[#2E86AB]">
        <h2 className={`text-2xl font-bold mb-6 text-[#2E86AB] flex items-center justify-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <LogIn className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('login.title')}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block text-gray-700 mb-2 font-medium text-sm md:text-base ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
              placeholder="Enter your email"
              disabled={isSubmitting || isLoading}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className={`block text-gray-700 mb-2 font-medium text-sm md:text-base ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('login.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 md:py-3 pr-10 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
                placeholder="Enter your password"
                disabled={isSubmitting || isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 md:top-3.5 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting || isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {t('login.button')}
          </Button>
        </form>
        
        <p className="text-center mt-6 text-sm md:text-base">
          {t('login.register')} {' '}
          <button
            onClick={() => setActivePage('register')}
            className="text-[#2E86AB] font-medium hover:underline"
            disabled={isSubmitting || isLoading}
          >
            {t('login.registerLink')}
          </button>
        </p>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          <button
            onClick={() => setActivePage('terms')}
            className="text-[#2E86AB] hover:underline mr-2"
            disabled={isSubmitting || isLoading}
          >
            Terms
          </button>
          |
          <button
            onClick={() => setActivePage('privacy')}
            className="text-[#2E86AB] hover:underline ml-2"
            disabled={isSubmitting || isLoading}
          >
            Privacy
          </button>
        </p>

        {/* Setup instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 mb-2 font-medium">First Time Setup?</p>
          <p className="text-xs text-blue-600">Make sure to configure your Supabase credentials in the .env file</p>
          <p className="text-xs text-blue-600">See setup-supabase.md for detailed instructions</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;