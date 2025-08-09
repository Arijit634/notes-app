import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCopyToClipboard } from '../../hooks';
import { toggleFavorite } from '../../store/slices/favoritesSlice';
import {
  createNote,
  deleteNote,
  fetchNotes,
  updateNote
} from '../../store/slices/notesSlice';
import { Spinner } from '../common';
import Button from '../common/Button';
import Card from '../common/Card';
import NoteForm from './NoteForm';
import { NoteGridItem, NoteListItem } from './NoteItem';
import NotesHeader from './NotesHeader';

const NotesList = ({ initialEditNote }) => {
  const dispatch = useDispatch();
  const { notes, loading, error } = useSelector(state => state.notes);
  const favoriteIds = useSelector(state => state.favorites.favoriteIds);
  const { copyToClipboard } = useCopyToClipboard();
  
  // Local state for UI
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    favorites: false,
    public: false,
    private: false,
    dateRange: '',
  });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  // Handle initial edit note from navigation
  useEffect(() => {
    if (initialEditNote) {
      setEditingNote(initialEditNote);
      setShowNoteForm(true);
    }
  }, [initialEditNote]);

  // Filter and sort notes
  const filteredNotes = React.useMemo(() => {
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.favorites) {
      filtered = filtered.filter(note => favoriteIds.includes(note.id));
    }
    if (filters.public) {
      filtered = filtered.filter(note => note.isPublic);
    }
    if (filters.private) {
      filtered = filtered.filter(note => !note.isPublic);
    }
    if (filters.dateRange) {
      const now = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      if (filters.dateRange !== '') {
        filtered = filtered.filter(note => 
          new Date(note.updatedAt) >= startDate
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'favorite') {
        aValue = a.favorite ? 1 : 0;
        bValue = b.favorite ? 1 : 0;
      } else if (sortBy === 'title') {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      } else if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [notes, searchQuery, filters, sortBy, sortOrder]);

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        favorites: false,
        public: false,
        private: false,
        dateRange: '',
      });
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowNoteForm(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleViewNote = (note) => {
    // In a real app, you might navigate to a detailed view
    // For now, just edit the note
    handleEditNote(note);
  };

  const handleDeleteNote = async (note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      try {
        await dispatch(deleteNote(note.id)).unwrap();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleCopyNote = async (note) => {
    try {
      // Copy only the content
      await copyToClipboard(note.content);
    } catch (error) {
      console.error('Failed to copy note:', error);
    }
  };

  const handleToggleFavorite = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    dispatch(toggleFavorite(noteId, note));
  };

  const handleSaveNote = async (noteData) => {
    setFormLoading(true);
    try {
      if (editingNote) {
        await dispatch(updateNote({ id: editingNote.id, noteData })).unwrap();
      } else {
        await dispatch(createNote(noteData)).unwrap();
      }
      setShowNoteForm(false);
      setEditingNote(null);
      // Refresh notes after successful operation
      dispatch(fetchNotes());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading && notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-error-600 dark:text-error-400 mb-4">
          Error loading notes: {error}
        </div>
        <Button onClick={() => dispatch(fetchNotes())}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <NotesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        view={view}
        onViewChange={setView}
        filters={filters}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onCreateNote={handleCreateNote}
        totalNotes={notes.length}
        filteredCount={filteredNotes.length}
      />

      {/* Notes Grid/List */}
      {filteredNotes.length > 0 ? (
        <motion.div
          layout
          className={
            view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          <AnimatePresence>
            {filteredNotes.map((note) => {
              const isFavorite = favoriteIds.includes(note.id);
              
              return view === 'grid' ? (
                <NoteGridItem
                  key={note.id}
                  note={note}
                  onView={handleViewNote}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onCopy={handleCopyNote}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={isFavorite}
                />
              ) : (
                <NoteListItem
                  key={note.id}
                  note={note}
                  onView={handleViewNote}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onCopy={handleCopyNote}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={isFavorite}
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Card className="p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || Object.values(filters).some(Boolean) 
              ? 'No notes found' 
              : 'No notes yet'
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || Object.values(filters).some(Boolean)
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first note'
            }
          </p>
          <Button onClick={handleCreateNote}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Your First Note
          </Button>
        </Card>
      )}

      {/* Loading overlay */}
      {loading && notes.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <Spinner className="mr-3" />
            Loading...
          </div>
        </div>
      )}

      {/* Note Form Modal */}
      <NoteForm
        note={editingNote}
        isOpen={showNoteForm}
        onClose={() => {
          setShowNoteForm(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        loading={formLoading}
      />
    </div>
  );
};

export default NotesList;
