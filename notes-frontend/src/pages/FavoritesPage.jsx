import { HeartIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common';
import Button from '../components/common/Button';
import { NoteGridItem } from '../components/notes/NoteItem';
import { fetchFavorites, toggleFavorite } from '../store/slices/favoritesSlice';

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { favoriteNotes, loading } = useSelector(state => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleToggleFavorite = (noteId) => {
    dispatch(toggleFavorite(noteId));
  };

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
        const { deleteNote } = await import('../store/slices/notesSlice');
        const { removeDeletedNoteFromFavorites } = await import('../store/slices/favoritesSlice');
        await dispatch(deleteNote(note.id)).unwrap();
        // Remove from favorites state without refetching
        dispatch(removeDeletedNoteFromFavorites(note.id));
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <HeartIcon className="w-8 h-8 text-red-500" />
            Favorite Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quick access to your most important notes
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {favoriteNotes.length} {favoriteNotes.length === 1 ? 'favorite' : 'favorites'}
        </div>
      </div>

      {/* Favorites Grid */}
      {favoriteNotes.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {favoriteNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NoteGridItem
                note={{ ...note, favorite: true }}
                onView={handleViewNote}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onCopy={(note) => navigator.clipboard.writeText(note.content)}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={true}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="p-12 text-center">
          <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            No favorite notes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start adding notes to your favorites by clicking the heart icon on any note
          </p>
          <Button 
            onClick={() => navigate('/notes')}
            className="mx-auto"
          >
            Browse Notes
          </Button>
        </Card>
      )}
    </motion.div>
  );
};

export default FavoritesPage;
