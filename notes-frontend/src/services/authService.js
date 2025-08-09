import { API_ENDPOINTS } from '../constants/api';
import { apiService } from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * User login
   */
  async login(credentials) {
    const response = await apiService.post(API_ENDPOINTS.AUTH.SIGNIN, credentials);
    return response.data;
  },

  /**
   * User registration
   */
  async register(userData) {
    const response = await apiService.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
    return response.data;
  },

  /**
   * Get current user info
   */
  async getUserInfo() {
    const response = await apiService.get(API_ENDPOINTS.AUTH.USER_INFO);
    return response.data;
  },

  /**
   * Verify email
   */
  async verifyEmail(token) {
    const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    const response = await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const response = await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword
    });
    return response.data;
  },

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken) {
    const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken
    });
    return response.data;
  },

  /**
   * Enable 2FA
   */
  async enable2FA() {
    const response = await apiService.post(API_ENDPOINTS.AUTH.ENABLE_2FA);
    return response.data;
  },

  /**
   * Disable 2FA
   */
  async disable2FA() {
    const response = await apiService.post(API_ENDPOINTS.AUTH.DISABLE_2FA);
    return response.data;
  },

  /**
   * Verify 2FA code
   */
  async verify2FA(code) {
    const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_2FA, { code });
    return response.data;
  },

  /**
   * OAuth2 Google login
   */
  getGoogleOAuthUrl() {
    return `${API_ENDPOINTS.AUTH.GOOGLE_OAUTH}`;
  },

  /**
   * OAuth2 GitHub login
   */
  getGithubOAuthUrl() {
    return `${API_ENDPOINTS.AUTH.GITHUB_OAUTH}`;
  },
};

export default authService;
