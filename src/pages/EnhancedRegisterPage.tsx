import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

interface EnhancedRegisterPageProps {
  setActivePage: (page: string) => void;
  userRole: 'freelancer' | 'client';
}

const EnhancedRegisterPage: React.FC<EnhancedRegisterPageProps> = ({ setActivePage, userRole }) => {
  const { t, isRTL } = useLanguage();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    
    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasDigit,
      isValid: minLength && hasUppercase && hasLowercase && hasDigit
    };
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Full name is required';
    }
    
    if (formData.name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    
    if (!validateEmail(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      return 'Password is required';
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      return 'Password must be at least 8 characters with uppercase, lowercase, and digit';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) {
      return 'Phone number is required';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.phone.trim()
      );
      
      if (result.success) {
        setEmailSent(true);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center"
        >
          <Mail className="w-16 h-16 text-[#2E86AB] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{formData.email}</strong>. 
            Please check your email and click the link to verify your account.
          </p>
          <Button
            variant="primary"
            onClick={() => setActivePage('login')}
            className="w-full"
          >
            Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  const passwordValidation = validatePassword(formData.password);

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
            <UserPlus className="text-[#2E86AB] mr-2" size={32} />
            <h2 className="text-2xl font-bold text-[#2E86AB]">
              Register as {userRole === 'freelancer' ? 'Freelancer' : 'Client'}
            </h2>
          </div>
          <p className="text-gray-600">
            {userRole === 'freelancer' 
              ? 'Join as a freelancer to offer your services and earn time credits'
              : 'Join as a client to post projects and find talented freelancers'
            }
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
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
              placeholder="Enter your full name"
              disabled={isSubmitting || isLoading}
              required
            />
          </div>
          
          <div>
            <label className={`block text-gray-700 mb-2 font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
              placeholder="Enter your email address"
              disabled={isSubmitting || isLoading}
              required
            />
          </div>
          
          <div>
            <label className={`block text-gray-700 mb-2 font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
                placeholder="Create a strong password"
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
            
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className={`text-xs flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  At least 8 characters
                </div>
                <div className={`text-xs flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  One uppercase letter
                </div>
                <div className={`text-xs flex items-center gap-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowercase ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  One lowercase letter
                </div>
                <div className={`text-xs flex items-center gap-2 ${passwordValidation.hasDigit ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordValidation.hasDigit ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  One number
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className={`block text-gray-700 mb-2 font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
                placeholder="Confirm your password"
                disabled={isSubmitting || isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting || isLoading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className={`block text-gray-700 mb-2 font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
              placeholder="+971 50 123 4567"
              disabled={isSubmitting || isLoading}
              required
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            Create Account
          </Button>
        </form>
        
        <p className="text-center mt-6 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => setActivePage('enhanced-login')}
            className="text-[#2E86AB] font-medium hover:underline"
            disabled={isSubmitting || isLoading}
          >
            Sign In
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

export default EnhancedRegisterPage;