import { ChevronDownIcon, ChevronRightIcon, TagIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Badge, Card, Spinner } from '../components/common';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { NoteGridItem } from '../components/notes/NoteItem';
import { toggleFavorite } from '../store/slices/favoritesSlice';
import { fetchNotes } from '../store/slices/notesSlice';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notes, loading } = useSelector(state => state.notes);
  const { favoriteIds } = useSelector(state => state.favorites);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  // Group notes by category and calculate stats
  const categoryStats = useMemo(() => {
    const stats = notes.reduce((acc, note) => {
      const category = note.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          name: category,
          count: 0,
          notes: [],
          lastUpdated: note.updatedAt,
        };
      }
      acc[category].count += 1;
      acc[category].notes.push(note);
      
      // Update last updated time
      if (new Date(note.updatedAt) > new Date(acc[category].lastUpdated)) {
        acc[category].lastUpdated = note.updatedAt;
      }
      
      return acc;
    }, {});

    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [notes]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categoryStats;
    
    return categoryStats.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryStats, searchQuery]);

  const toggleCategoryExpansion = (categoryName) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const handleToggleFavorite = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    dispatch(toggleFavorite(noteId, note));
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
        await dispatch(deleteNote(note.id)).unwrap();
        // Refresh notes after deletion
        dispatch(fetchNotes());
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
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
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize and manage your notes by categories
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <TagIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {categoryStats.length}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Total Categories</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TagIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {notes.length}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Total Notes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {categoryStats.length > 0 ? Math.round(notes.length / categoryStats.length) : 0}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Avg per Category</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<TagIcon className="w-4 h-4" />}
            className="max-w-md"
          />
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <Card className="p-12 text-center">
            <TagIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search query'
                : 'Start by creating notes with categories to organize them better'
              }
            </p>
            {!searchQuery && (
              <Button>
                Create Your First Note
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.name);
              const notesWithFavorites = category.notes.map(note => ({
                ...note,
                favorite: favoriteIds.includes(note.id)
              }));

              return (
                <Card key={category.name} className="overflow-hidden">
                  {/* Category Header - Clickable */}
                  <button
                    onClick={() => toggleCategoryExpansion(category.name)}
                    className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {isExpanded ? (
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                          )}
                          <TagIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last updated: {new Date(category.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="primary" size="sm">
                        {category.count} {category.count === 1 ? 'note' : 'notes'}
                      </Badge>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {notesWithFavorites.map((note) => (
                              <NoteGridItem
                                key={note.id}
                                note={note}
                                onView={handleViewNote}
                                onEdit={handleEditNote}
                                onDelete={handleDeleteNote}
                                onCopy={(note) => navigator.clipboard.writeText(note.content)}
                                onToggleFavorite={handleToggleFavorite}
                                isFavorite={favoriteIds.includes(note.id)}
                                compact={true}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
