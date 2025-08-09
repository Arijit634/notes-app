import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthContainer = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot-password'

  const switchToLogin = () => setCurrentView('login');
  const switchToRegister = () => setCurrentView('register');
  const switchToForgotPassword = () => setCurrentView('forgot-password');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={switchToRegister}
            onForgotPassword={switchToForgotPassword}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={switchToLogin}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBackToLogin={switchToLogin}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-primary-900/20 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 dark:bg-secondary-900/20 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-200 dark:bg-accent-900/20 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Auth form container */}
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: currentView === 'login' ? 0 : currentView === 'register' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: currentView === 'login' ? 0 : currentView === 'register' ? -20 : 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2024 Notes App. Made with ❤️ for productivity.
        </p>
      </div>
    </div>
  );
};

export default AuthContainer;
