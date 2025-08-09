import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Spinner } from './components/common';
import Layout from './components/layout/Layout';
import { AuthPage, CategoriesPage, DashboardPage, FavoritesPage, NotesPage, OAuth2FAPage, OAuthSuccessPage, ProfilePage, PublicNotesPage } from './pages';
import { checkAuthStatus } from './store/slices/authSlice';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Public Route component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Check if user is already authenticated on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Clear OAuth success flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.removeItem('oauth_success_shown');
    }
  }, [isAuthenticated]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your notes...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              } 
            />
            
            {/* OAuth Success Route */}
            <Route 
              path="/oauth2/redirect" 
              element={<OAuthSuccessPage />} 
            />

            {/* OAuth 2FA Route */}
            <Route 
              path="/oauth2/2fa" 
              element={<OAuth2FAPage />} 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/notes" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotesPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <FavoritesPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/categories" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CategoriesPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/public" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <PublicNotesPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Default redirect */}
            <Route 
              path="/" 
              element={
                <Navigate 
                  to={isAuthenticated ? "/dashboard" : "/auth"} 
                  replace 
                />
              } 
            />

            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <Navigate 
                  to={isAuthenticated ? "/dashboard" : "/auth"} 
                  replace 
                />
              } 
            />
          </Routes>
        </AnimatePresence>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              border: '1px solid var(--toast-border)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;
