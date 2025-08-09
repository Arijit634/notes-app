import { configureStore } from '@reduxjs/toolkit';
import activitiesSlice from './slices/activitiesSlice';
import activitySlice from './slices/activitySlice';
import authSlice from './slices/authSlice';
import favoritesSlice from './slices/favoritesSlice';
import notesSlice from './slices/notesSlice';
import uiSlice from './slices/uiSlice';
import userSlice from './slices/userSlice';

const store = configureStore({
  reducer: {
    activities: activitiesSlice,
    activity: activitySlice,
    auth: authSlice,
    favorites: favoritesSlice,
    notes: notesSlice,
    ui: uiSlice,
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.NODE_ENV !== 'production',
});

export default store;
