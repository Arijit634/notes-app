import { API_ENDPOINTS } from '../constants/api';
import { apiService } from './api';

/**
 * User Service
 * Handles user profile and account management
 */
export const userService = {
  /**
   * Get user profile
   */
  async getProfile() {
    const response = await apiService.get(API_ENDPOINTS.USERS.PROFILE);
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    const response = await apiService.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(passwordData) {
    const response = await apiService.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
    return response.data;
  },

  /**
   * Delete user account
   */
  async deleteAccount() {
    const response = await apiService.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT);
    return response.data;
  },

  /**
   * Get user dashboard stats
   */
  async getDashboardStats() {
    const response = await apiService.get(`${API_ENDPOINTS.USERS.PROFILE}/stats`);
    return response.data;
  },

  /**
   * Get user activity
   */
  async getUserActivity(params = {}) {
    const response = await apiService.get(`${API_ENDPOINTS.USERS.PROFILE}/activity`, { params });
    return response.data;
  },
};

/**
 * Admin Service
 * Handles admin-specific operations
 */
export const adminService = {
  /**
   * Get all users
   */
  async getAllUsers(params = {}) {
    const response = await apiService.get(API_ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },

  /**
   * Get user details by ID
   */
  async getUserById(id) {
    const response = await apiService.get(API_ENDPOINTS.ADMIN.USER_DETAILS(id));
    return response.data;
  },

  /**
   * Update user role
   */
  async updateUserRole(id, role) {
    const response = await apiService.put(API_ENDPOINTS.ADMIN.MANAGE_USER(id), { role });
    return response.data;
  },

  /**
   * Enable/disable user account
   */
  async toggleUserStatus(id, enabled) {
    const response = await apiService.put(API_ENDPOINTS.ADMIN.MANAGE_USER(id), { enabled });
    return response.data;
  },

  /**
   * Lock/unlock user account
   */
  async toggleUserLock(id, locked) {
    const response = await apiService.put(API_ENDPOINTS.ADMIN.MANAGE_USER(id), { 
      accountNonLocked: !locked 
    });
    return response.data;
  },

  /**
   * Delete user account
   */
  async deleteUser(id) {
    const response = await apiService.delete(API_ENDPOINTS.ADMIN.MANAGE_USER(id));
    return response.data;
  },

  /**
   * Get audit logs
   */
  async getAuditLogs(params = {}) {
    const response = await apiService.get(API_ENDPOINTS.ADMIN.AUDIT_LOGS, { params });
    return response.data;
  },

  /**
   * Get system statistics
   */
  async getSystemStats() {
    const response = await apiService.get(`${API_ENDPOINTS.ADMIN.USERS}/stats`);
    return response.data;
  },

  /**
   * Search users
   */
  async searchUsers(searchTerm, params = {}) {
    const response = await apiService.get(API_ENDPOINTS.ADMIN.USERS, {
      params: {
        search: searchTerm,
        ...params
      }
    });
    return response.data;
  },
};

export default { userService, adminService };
