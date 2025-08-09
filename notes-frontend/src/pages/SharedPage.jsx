import { ShareIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Spinner } from '../components/common';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { NoteGridItem, NoteListItem } from '../components/notes/NoteItem';
import { useCopyToClipboard } from '../hooks';
import { toggleFavorite } from '../store/slices/favoritesSlice';
import { fetchPublicNotes } from '../store/slices/notesSlice';

const SharedPage = () => {
  const dispatch = useDispatch();
  const { publicNotes, loading } = useSelector(state => state.notes);
  const { user } = useSelector(state => state.auth);
  const favoriteIds = useSelector(state => state.favorites.favoriteIds);
  const { copyToClipboard } = useCopyToClipboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid');

  useEffect(() => {
    console.log('📡 SharedPage: Dispatching fetchPublicNotes...');
    dispatch(fetchPublicNotes());
  }, [dispatch]);

  // Get all public notes from all users
  const sharedNotes = useMemo(() => {
    console.log('📝 SharedPage: publicNotes from state:', publicNotes);
    console.log('📊 SharedPage: publicNotes length:', publicNotes?.length || 0);
    return publicNotes || [];
  }, [publicNotes]);

  // Filter notes based on search
  const filteredNotes = useMemo(() => {
    console.log('🔍 SharedPage: Filtering notes, sharedNotes:', sharedNotes);
    if (!searchQuery) {
      console.log('📋 SharedPage: No search query, returning all shared notes:', sharedNotes.length);
      return sharedNotes;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = sharedNotes.filter(note =>
      note.title?.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query) ||
      note.description?.toLowerCase().includes(query) ||
      note.category?.toLowerCase().includes(query)
    );
    console.log('🔍 SharedPage: Filtered notes result:', filtered.length);
    return filtered;
  }, [sharedNotes, searchQuery]);

  const handleViewNote = (note) => {
    // Public notes are read-only - just show a toast or modal with content
    console.log('View note:', note);
    // TODO: Implement read-only view modal for public notes
  };

  const handleEditNote = (note) => {
    // Only allow editing if the current user owns the note
    if (note.ownerUsername === user?.username) {
      console.log('Edit note:', note);
      // TODO: Implement edit functionality for own notes
    } else {
      toast.error('You can only edit your own notes');
    }
  };

  const handleDeleteNote = (note) => {
    // Only allow deleting if the current user owns the note
    if (note.ownerUsername === user?.username) {
      console.log('Delete note:', note);
      // TODO: Implement delete functionality for own notes
    } else {
      toast.error('You can only delete your own notes');
    }
  };

  const handleCopyNote = async (note) => {
    try {
      // Copy only the content, consistent with NotesList behavior
      await copyToClipboard(note.content);
    } catch (error) {
      console.error('Failed to copy note:', error);
    }
  };

  const handleToggleFavorite = (noteId) => {
    dispatch(toggleFavorite(noteId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading shared notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Shared Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Notes you've shared and can be accessed by others
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShareIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {sharedNotes.length}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Shared Notes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <ShareIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {sharedNotes.reduce((total, note) => total + (note.shareCount || 0), 0)}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Total Shares</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ShareIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round((sharedNotes.length / Math.max(notes.length, 1)) * 100)}%
                </p>
                <p className="text-gray-600 dark:text-gray-400">Share Rate</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search shared notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<ShareIcon className="w-4 h-4" />}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={view === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setView('grid')}
            >
              Grid
            </Button>
            <Button
              variant={view === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Notes */}
        {filteredNotes.length === 0 ? (
          <Card className="p-12 text-center">
            <ShareIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? 'No shared notes found' : 'No shared notes yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search query'
                : 'Share your notes to make them accessible to others'
              }
            </p>
            {!searchQuery && (
              <Button>
                Go to Notes
              </Button>
            )}
          </Card>
        ) : (
          <>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredNotes.map((note) => {
                  const isFavorite = note.favorite; // Use backend data directly
                  const canEdit = note.ownerUsername === user?.username;
                  return (
                    <NoteGridItem
                      key={note.id}
                      note={note}
                      onView={handleViewNote}
                      onEdit={canEdit ? handleEditNote : null}
                      onDelete={canEdit ? handleDeleteNote : null}
                      onCopy={handleCopyNote}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite}
                      isReadOnly={!canEdit}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => {
                  const isFavorite = note.favorite;
                  const canEdit = note.ownerUsername === user?.username;
                  return (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      onView={handleViewNote}
                      onEdit={canEdit ? handleEditNote : null}
                      onDelete={canEdit ? handleDeleteNote : null}
                      onCopy={handleCopyNote}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite}
                      isReadOnly={!canEdit}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SharedPage;
