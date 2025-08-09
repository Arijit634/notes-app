import {
    CalendarIcon,
    ClipboardIcon,
    ClockIcon,
    EyeIcon,
    EyeSlashIcon,
    HeartIcon,
    PencilIcon,
    TagIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { formatDate, formatRelativeTime, truncateText } from '../../utils/ui';
import { Badge } from '../common';
import Button from '../common/Button';
import Card from '../common/Card';

const NoteGridItem = ({ note, onView, onEdit, onDelete, onCopy, onToggleFavorite, isFavorite }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="p-4 h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
            onClick={() => onView(note)}
          >
            {note.title || 'Untitled Note'}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            {note.shared ? (
              <EyeIcon className="w-4 h-4 text-success-500" />
            ) : (
              <EyeSlashIcon className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {note.shared ? 'Shared' : 'Private'}
            </span>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div 
        className="flex-1 mb-4 cursor-pointer"
        onClick={() => onView(note)}
      >
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4">
          {truncateText(note.content, 150)}
        </p>
      </div>

      {/* Category */}
      {note.category && (
        <div className="mb-4">
          <Badge variant="outline" size="sm">
            {note.category}
          </Badge>
        </div>
      )}

      {/* Footer */}
      <div className="space-y-3">
        {/* Date info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="w-3 h-3" />
            <span>{formatDate(note.updatedAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-3 h-3" />
            <span>{formatRelativeTime(note.updatedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(note)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
              title="View note"
            >
              <EyeIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(note)}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
              title="Edit note"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCopy(note)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
              title="Copy to clipboard"
            >
              <ClipboardIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleFavorite(note.id)}
              className={`${isFavorite 
                ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' 
                : 'text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
              } hover:bg-red-50 dark:hover:bg-red-900/20 opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <HeartSolidIcon className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(note)}
            className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20 opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
            title="Delete note"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
);

const NoteListItem = ({ note, onView, onEdit, onDelete, onCopy, onToggleFavorite, isFavorite }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-center space-x-4">
        {/* Main Content */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onView(note)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {note.title || 'Untitled Note'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                {truncateText(note.content, 200)}
              </p>
            </div>
          </div>

          {/* Category and Meta */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              {/* Category */}
              {note.category && (
                <div className="flex items-center space-x-1">
                  <TagIcon className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline" size="sm">
                    {note.category}
                  </Badge>
                </div>
              )}

              {/* Visibility */}
              <div className="flex items-center space-x-1">
                {note.shared ? (
                  <EyeIcon className="w-4 h-4 text-success-500" />
                ) : (
                  <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {note.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(note.updatedAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{formatRelativeTime(note.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(note)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title="View note"
            >
              <EyeIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(note)}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              title="Edit note"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCopy(note)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              title="Copy to clipboard"
            >
              <ClipboardIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleFavorite(note.id)}
              className={`${isFavorite 
                ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' 
                : 'text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
              } hover:bg-red-50 dark:hover:bg-red-900/20 transition-all`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <HeartSolidIcon className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(note)}
              className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20 transition-all"
              title="Delete note"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export { NoteGridItem, NoteListItem };
