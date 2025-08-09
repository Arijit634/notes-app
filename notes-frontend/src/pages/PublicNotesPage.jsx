import { GlobeAltIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Button, Card, EmptyState, Input, Spinner } from '../components/common';
import { fetchPublicNotes } from '../store/slices/notesSlice';
import { dateUtils } from '../utils/helpers';

const PublicNotesPage = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { publicNotes, loading, error } = useSelector(state => state.notes);

  useEffect(() => {
    console.log('📡 PublicNotesPage: Dispatching fetchPublicNotes...');
    dispatch(fetchPublicNotes());
  }, [dispatch]);

  // Ensure publicNotes is always an array
  const notesArray = Array.isArray(publicNotes) ? publicNotes : [];
  console.log('📝 PublicNotesPage: publicNotes from state:', publicNotes);
  console.log('📊 PublicNotesPage: notesArray length:', notesArray.length);

  const filteredNotes = notesArray.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  console.log('🔍 PublicNotesPage: Filtered notes result:', filteredNotes.length);
  console.log('🔍 PublicNotesPage: Sample filtered notes:', filteredNotes.slice(0, 2));

  const categories = [...new Set(notesArray.map(note => note.category).filter(Boolean))];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-96">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          title="Error Loading Public Notes"
          description={error || "Unable to load public notes. Please try again later."}
          icon={<GlobeAltIcon className="h-12 w-12" />}
          action={
            <Button 
              onClick={() => dispatch(fetchPublicNotes())}
              variant="primary"
            >
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <GlobeAltIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Public Notes
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and explore notes shared by the community
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search public notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {searchQuery && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Found {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </motion.div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          title="No Public Notes Found"
          description={
            searchQuery || selectedCategory 
              ? "No notes match your current filters. Try adjusting your search or category filter."
              : "No public notes have been shared yet. Be the first to share a note with the community!"
          }
          icon={<GlobeAltIcon className="h-12 w-12" />}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredNotes.map((note) => (
            <motion.div key={note.id} variants={itemVariants}>
              <PublicNoteCard note={note} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const PublicNoteCard = ({ note }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const truncatedContent = note.content?.length > 150 
    ? note.content.substring(0, 150) + '...'
    : note.content;

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200">
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {note.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>By {note.user?.userName || 'Anonymous'}</span>
            <span>{dateUtils.formatDate(note.createdAt)}</span>
          </div>
        </div>

        {/* Description */}
        {note.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
            {note.description}
          </p>
        )}

        {/* Content */}
        <div className="flex-1 mb-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {isExpanded ? note.content : truncatedContent}
          </div>
          
          {note.content?.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 dark:text-blue-400 text-sm mt-2 hover:underline"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          {note.category && (
            <Badge variant="secondary" size="sm">
              {note.category}
            </Badge>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <GlobeAltIcon className="h-4 w-4" />
            <span>Public</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PublicNotesPage;