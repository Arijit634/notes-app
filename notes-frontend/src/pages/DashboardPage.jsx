import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../components/dashboard';
import { fetchRecentActivities } from '../store/slices/activitiesSlice';
import { fetchFavorites, toggleFavorite } from '../store/slices/favoritesSlice';
import { deleteNote, fetchNotes } from '../store/slices/notesSlice';
import { fetchUserStats } from '../store/slices/userSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notes } = useSelector(state => state.notes);
  const { dashboardStats: stats } = useSelector(state => state.user);
  const { recentActivities } = useSelector(state => state.activities);
  const { activities: frontendActivities } = useSelector(state => state.activity);
  const { favoriteIds } = useSelector(state => state.favorites);

  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchUserStats());
    dispatch(fetchFavorites());
    dispatch(fetchRecentActivities(3)); // Fetch last 3 days of activities for dashboard
  }, [dispatch]);

  // Get recent notes (last 4) with favorite status
  const recentNotes = React.useMemo(() => {
    return [...notes]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4)
      .map(note => ({
        ...note,
        favorite: favoriteIds.includes(note.id)
      }));
  }, [notes, favoriteIds]);

  const handleViewNote = (note) => {
    // Navigate to notes page to view/edit the note
    navigate('/notes', { state: { editNote: note } });
  };

  const handleEditNote = (note) => {
    // Navigate to notes page to edit the note
    navigate('/notes', { state: { editNote: note } });
  };

  const handleDeleteNote = async (note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      try {
        await dispatch(deleteNote(note.id)).unwrap();
        // Don't refetch notes immediately since Redux already removed it
        // Only refresh stats and activities after a short delay
        setTimeout(() => {
          dispatch(fetchUserStats());
          dispatch(fetchRecentActivities(3));
        }, 300);
      } catch (error) {
        console.error('Failed to delete note:', error);
        // Only refetch notes if there was an error
        dispatch(fetchNotes());
      }
    }
  };

  const handleToggleFavorite = async (noteId) => {
    try {
      const note = notes.find(n => n.id === noteId);
      await dispatch(toggleFavorite(noteId, note));
      // Refresh activities to show favorite/unfavorite action
      dispatch(fetchRecentActivities(3));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCreateNote = () => {
    navigate('/notes');
  };

  const handleViewAllNotes = () => {
    navigate('/notes');
  };

  // Enhanced stats with favorites count and backend compatibility
  const enhancedStats = React.useMemo(() => {
    // Calculate stats directly from the actual data like categories do
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalNotes = notes.length;
    const notesThisWeek = notes.filter(note => 
      new Date(note.createdAt) >= oneWeekAgo
    ).length;
    const favoriteNotes = favoriteIds.length;
    
    return {
      ...stats,
      // Use calculated values instead of backend values
      totalNotes,
      notesThisWeek,
      favoriteNotes,
      // Keep other backend stats if available
      totalViews: stats?.totalViews || 0,
      notesChange: stats?.notesChange,
      weeklyChange: stats?.weeklyChange,
      viewsChange: stats?.viewsChange,
    };
  }, [stats, notes, favoriteIds]);

  // Combine backend activities with frontend activities (especially delete activities)
  const combinedActivities = React.useMemo(() => {
    const backend = recentActivities || [];
    const frontend = frontendActivities || [];
    
    // Convert frontend activities to match backend format
    const formattedFrontend = frontend
      .filter(activity => activity.type === 'deleted') // Only include delete activities from frontend
      .map(activity => ({
        id: `frontend-${activity.id}`,
        username: 'current-user',
        action: 'DELETED',
        resourceType: 'note',
        resourceId: activity.noteId,
        resourceTitle: activity.noteTitle,
        description: null,
        timestamp: activity.timestamp
      }));
    
    // Combine and sort by timestamp (newest first)
    const combined = [...backend, ...formattedFrontend]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // Show only latest 10 activities
    
    return combined;
  }, [recentActivities, frontendActivities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Dashboard
        stats={enhancedStats}
        recentNotes={recentNotes}
        activities={combinedActivities}
        onViewNote={handleViewNote}
        onEditNote={handleEditNote}
        onDeleteNote={handleDeleteNote}
        onToggleFavorite={handleToggleFavorite}
        onCreateNote={handleCreateNote}
        onViewAllNotes={handleViewAllNotes}
      />
    </motion.div>
  );
};

export default DashboardPage;
