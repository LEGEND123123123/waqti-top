import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import OtpInput from 'react-otp-input';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

interface EmailVerificationPageProps {
  email: string;
  onVerificationComplete: () => void;
  setActivePage: (page: string) => void;
}

const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({
  email,
  onVerificationComplete,
  setActivePage
}) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otp === '123456') { // Demo code
        setIsVerified(true);
        setTimeout(() => {
          onVerificationComplete();
        }, 1500);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');
    setCanResend(false);
    setCountdown(60);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setCanResend(true);
      setCountdown(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-md p-8"
      >
        <div className="text-center mb-8">
          {isVerified ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
          ) : (
            <Mail className="w-16 h-16 text-[#2E86AB] mx-auto mb-4" />
          )}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          
          <p className="text-gray-600">
            {isVerified
              ? 'Your email has been successfully verified.'
              : `We've sent a 6-digit verification code to ${email}`}
          </p>
        </div>

        {!isVerified && (
          <>
            <div className="mb-6">
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="w-12 h-12 text-center border border-gray-300 rounded-lg mx-1 focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent text-lg font-semibold"
                  />
                )}
                containerStyle="flex justify-center"
              />
              
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm text-center mt-3"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleVerify}
                isLoading={isLoading}
                disabled={otp.length !== 6}
              >
                Verify Email
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={!canResend || isLoading}
                  className={`text-sm font-medium ${
                    canResend && !isLoading
                      ? 'text-[#2E86AB] hover:underline'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canResend ? (
                    <span className="flex items-center justify-center gap-1">
                      <RefreshCw size={14} />
                      Resend Code
                    </span>
                  ) : (
                    `Resend in ${countdown}s`
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setActivePage('login')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;