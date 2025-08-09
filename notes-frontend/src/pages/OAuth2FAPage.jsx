import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import { authAPI, tokenUtils } from '../services/api';
import { logout as logoutAction } from '../store/slices/authSlice';

const OAuth2FAPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const username = searchParams.get('user');
  const email = searchParams.get('email');
  const provider = searchParams.get('provider');

  useEffect(() => {
    // Clear any existing auth state
    dispatch(logoutAction());
    tokenUtils.removeToken();
    tokenUtils.removeUserInfo();

    if (!username || !provider) {
      toast.error('Invalid OAuth 2FA request');
      navigate('/login');
    }
  }, [username, provider, navigate, dispatch]);

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOAuth2FA(parseInt(verificationCode), username);
      
      // Store token and user info
      tokenUtils.setToken(response.token);
      tokenUtils.setUserInfo({
        username: response.username,
        email: response.email
      });

      toast.success('2FA verification successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('OAuth 2FA verification error:', error);
      toast.error(error.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Complete your {provider && provider.charAt(0).toUpperCase() + provider.slice(1)} login
          </p>
          <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-500">
            {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify2FA}>
          <div>
            <label htmlFor="verification-code" className="sr-only">
              Verification Code
            </label>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter the 6-digit code from your authenticator app
              </p>
              <input
                id="verification-code"
                name="verification-code"
                type="text"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm text-center tracking-widest font-mono text-lg"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 mobile-button"
            >
              Cancel & Back to Login
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OAuth2FAPage;
