import {
    ArrowLeftIcon,
    CheckCircleIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { authAPI } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';

// Validation schema
const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
});

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      await authAPI.forgotPassword(data.email);
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon className="w-8 h-8 text-success-600 dark:text-success-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Check your email
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a password reset link to{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {getValues('email')}
            </span>
          </p>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <Button
              onClick={() => {
                setSuccess(false);
                setError('');
              }}
              variant="outline"
              className="w-full"
            >
              Try different email
            </Button>
            
            <Button
              onClick={onBackToLogin}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to login
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Forgot password?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg"
          >
            <p className="text-sm text-error-600 dark:text-error-400">
              {error}
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            leftIcon={<EnvelopeIcon className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!isValid}
          >
            Send reset instructions
          </Button>
        </form>

        <div className="mt-6">
          <Button
            onClick={onBackToLogin}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordForm;
