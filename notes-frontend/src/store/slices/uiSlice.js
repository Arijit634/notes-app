import { createSlice } from '@reduxjs/toolkit';
import { themeUtils } from '../../utils/helpers';

// Initial state
const initialState = {
  theme: themeUtils.initTheme(),
  sidebarOpen: true,
  mobileMenuOpen: false,
  loading: false,
  notifications: [],
  modals: {
    confirmDelete: false,
    noteForm: false,
    userProfile: false,
    settings: false,
  },
  alerts: [],
  searchOpen: false,
  filters: {
    category: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 0,
    size: 10,
  },
  view: 'grid', // 'grid' or 'list'
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      themeUtils.setTheme(state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      themeUtils.setTheme(state.theme);
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    // Mobile menu actions
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },

    // Loading actions
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Modal actions
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    toggleModal: (state, action) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },

    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'info',
        autoHide: true,
        duration: 5000,
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Alert actions
    addAlert: (state, action) => {
      const alert = {
        id: Date.now(),
        type: 'info',
        ...action.payload,
      };
      state.alerts.push(alert);
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },

    // Search actions
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },

    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      };
    },

    // Pagination actions
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetPagination: (state) => {
      state.pagination = {
        page: 0,
        size: 10,
      };
    },

    // View actions
    setView: (state, action) => {
      state.view = action.payload;
    },
    toggleView: (state) => {
      state.view = state.view === 'grid' ? 'list' : 'grid';
    },

    // Bulk actions
    showSuccess: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        type: 'success',
        message: action.payload,
        autoHide: true,
        duration: 3000,
      });
    },
    showError: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        type: 'error',
        message: action.payload,
        autoHide: true,
        duration: 5000,
      });
    },
    showWarning: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        type: 'warning',
        message: action.payload,
        autoHide: true,
        duration: 4000,
      });
    },
    showInfo: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        type: 'info',
        message: action.payload,
        autoHide: true,
        duration: 3000,
      });
    },

    // Reset UI state
    resetUIState: () => {
      return {
        ...initialState,
        theme: themeUtils.getTheme(),
      };
    },
  },
});

export const {
  // Theme
  toggleTheme,
  setTheme,
  
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  
  // Mobile menu
  toggleMobileMenu,
  setMobileMenuOpen,
  
  // Loading
  setLoading,
  
  // Modals
  openModal,
  closeModal,
  toggleModal,
  closeAllModals,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Alerts
  addAlert,
  removeAlert,
  clearAlerts,
  
  // Search
  toggleSearch,
  setSearchOpen,
  
  // Filters
  setFilters,
  clearFilters,
  
  // Pagination
  setPagination,
  resetPagination,
  
  // View
  setView,
  toggleView,
  
  // Quick notifications
  showSuccess,
  showError,
  showWarning,
  showInfo,
  
  // Reset
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
