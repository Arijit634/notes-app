import { LockClosedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { completeTwoFactorLogin } from '../../store/slices/authSlice';
import Button from '../common/Button';
import Input from '../common/Input';

const TwoFactorModal = ({ onCancel }) => {
  const dispatch = useDispatch();
  const { loading, error, pendingUsername } = useSelector(state => state.auth);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      return;
    }

    try {
      await dispatch(completeTwoFactorLogin({
        username: pendingUsername,
        verificationCode
      })).unwrap();
    } catch (error) {
      console.error('2FA verification failed:', error);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4">
            <LockClosedIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg"
          >
            <p className="text-sm text-error-600 dark:text-error-400">
              {error}
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Verification Code"
            type="text"
            value={verificationCode}
            onChange={handleCodeChange}
            placeholder="000000"
            maxLength={6}
            className="text-center text-lg tracking-widest"
            leftIcon={<LockClosedIcon className="w-4 h-4" />}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!verificationCode || verificationCode.length !== 6}
              className="flex-1"
            >
              Verify
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TwoFactorModal;
