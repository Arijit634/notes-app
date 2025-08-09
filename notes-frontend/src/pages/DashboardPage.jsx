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
  const { stats } = useSelector(state => state.user);
  const { recentActivities } = useSelector(state => state.activities);
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
        // Refresh notes after deletion
        dispatch(fetchNotes());
        dispatch(fetchUserStats());
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleToggleFavorite = async (noteId) => {
    try {
      const note = notes.find(n => n.id === noteId);
      dispatch(toggleFavorite(noteId, note));
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

  // Enhanced stats with favorites count
  const enhancedStats = React.useMemo(() => {
    return {
      ...stats,
      favoriteNotes: favoriteIds.length
    };
  }, [stats, favoriteIds]);

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
        activities={recentActivities}
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
