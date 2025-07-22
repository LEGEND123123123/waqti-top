import React, { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

interface EnhancedLoginPageProps {
  setActivePage: (page: string) => void;
  userRole: 'freelancer' | 'client';
}

const EnhancedLoginPage: React.FC<EnhancedLoginPageProps> = ({ setActivePage, userRole }) => {
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
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect based on role and verification status
        if (userRole === 'freelancer') {
          // Check if freelancer needs verification
          setActivePage('freelancer-verification');
        } else {
          setActivePage('dashboard');
        }
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border-t-4 border-[#2E86AB]"
      >
        <div className={`text-center mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center justify-center mb-4">
            <LogIn className="text-[#2E86AB] mr-2" size={32} />
            <h2 className="text-2xl font-bold text-[#2E86AB]">
              Sign In as {userRole === 'freelancer' ? 'Freelancer' : 'Client'}
            </h2>
          </div>
          <p className="text-gray-600">
            Welcome back! Please sign in to your account.
          </p>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-gray-700 mb-2 font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
              placeholder="Enter your email"
              disabled={isSubmitting || isLoading}
              required
            />
          </div>
          
          <div>
            <label className={`block text-gray-700 mb-2 font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
                placeholder="Enter your password"
                disabled={isSubmitting || isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting || isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-[#2E86AB] focus:ring-[#2E86AB]" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-[#2E86AB] hover:underline"
            >
              Forgot password?
            </button>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            Sign In
          </Button>
        </form>
        
        <p className="text-center mt-6 text-sm">
          Don't have an account?{' '}
          <button
            onClick={() => setActivePage('enhanced-register')}
            className="text-[#2E86AB] font-medium hover:underline"
            disabled={isSubmitting || isLoading}
          >
            Create Account
          </button>
        </p>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setActivePage('role-selection')}
            className="text-gray-600 hover:text-gray-800 text-sm"
            disabled={isSubmitting || isLoading}
          >
            ← Back to Role Selection
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedLoginPage;