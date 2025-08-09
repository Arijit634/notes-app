import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '../components/common';
import { authAPI, tokenUtils } from '../services/api';
import { loginUser } from '../store/slices/authSlice';

const OAuthSuccessPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions during React strict mode
    if (processedRef.current) return;
    processedRef.current = true;

    const handleOAuthSuccess = async () => {
      try {
        // Extract parameters from URL
        const token = searchParams.get('token');
        const user = searchParams.get('user');
        const email = searchParams.get('email');
        const provider = searchParams.get('provider');
        const success = searchParams.get('success') === 'true';

        console.log('OAuth callback received:', { token: !!token, user, email, provider, success });

        if (!success) {
          const error = searchParams.get('error') || 'oauth_failed';
          const message = searchParams.get('message') || 'OAuth authentication failed';
          console.error('OAuth authentication failed:', error, message);
          toast.error(`Authentication failed: ${message}`);
          navigate('/auth?error=' + error, { replace: true });
          return;
        }

        if (!token || !user) {
          console.error('Missing required OAuth parameters:', { token: !!token, user });
          toast.error('Invalid OAuth response - missing authentication data');
          navigate('/auth?error=oauth_incomplete', { replace: true });
          return;
        }

        // Store the token
        tokenUtils.setToken(token);

        // Fetch complete user profile from backend (like regular login does)
        try {
          const completeUserInfo = await authAPI.getUserInfo();
          tokenUtils.setUserInfo(completeUserInfo);
          
          // Dispatch the login success action to update Redux state
          dispatch(loginUser.fulfilled({
            user: completeUserInfo,
            token: token,
          }));
        } catch (error) {
          console.error('Failed to fetch complete user info after OAuth:', error);
          // Fallback to basic user info if API call fails
          const userInfo = {
            userName: user,  // Changed to userName to match backend
            email: email || '',
            provider: provider || 'oauth2'
          };
          tokenUtils.setUserInfo(userInfo);
          
          // Dispatch the login success action to update Redux state
          dispatch(loginUser.fulfilled({
            user: userInfo,
            token: token,
          }));
        }

        // Show success message only once per OAuth session
        const oauthKey = `oauth_success_${token.substring(0, 10)}`;
        const hasShownOAuthSuccess = sessionStorage.getItem(oauthKey);
        if (!hasShownOAuthSuccess) {
          toast.success(`Welcome back, ${user}! You're now logged in.`);
          sessionStorage.setItem(oauthKey, 'true');
          // Also set general flag to prevent duplicates across sessions
          sessionStorage.setItem('oauth_success_shown', 'true');
        }
        
        // Navigate immediately to avoid multiple OAuth processing
        navigate('/dashboard', { replace: true });

      } catch (error) {
        console.error('OAuth success handling failed:', error);
        toast.error('Failed to complete OAuth authentication');
        navigate('/auth?error=oauth_processing_failed', { replace: true });
      }
    };

    handleOAuthSuccess();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
          <span className="text-white font-bold text-2xl">N</span>
        </div>
        <Spinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing Authentication
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we set up your account...
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccessPage;
