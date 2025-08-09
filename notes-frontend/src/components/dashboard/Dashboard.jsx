import {
  CalendarIcon,
  ClipboardIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { formatDate, formatRelativeTime } from '../../utils/ui';
import { Badge } from '../common';
import Button from '../common/Button';
import Card from '../common/Card';

const StatsCard = ({ title, value, icon: Icon, change, changeType }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
          {value}
        </p>
        {change && (
          <p className={`text-sm mt-1 ${
            changeType === 'positive' 
              ? 'text-success-600 dark:text-success-400' 
              : 'text-error-600 dark:text-error-400'
          }`}>
            {changeType === 'positive' ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      </div>
    </div>
  </Card>
);

const RecentNoteCard = ({ note, onView, onEdit, onDelete, onToggleFavorite }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {note.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {note.content}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onToggleFavorite(note.id)}
            className="text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg p-1"
            title={note.favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {note.favorite ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
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

        <div className="flex items-center space-x-2">
          {note.tags?.map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-1 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
          onClick={() => navigator.clipboard.writeText(note.content)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          title="Copy content to clipboard"
        >
          <ClipboardIcon className="w-4 h-4" />
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
    </Card>
  </motion.div>
);

const ActivityTimelineItem = ({ activity }) => {
  // Map backend ActivityType to display format
  const getActivityDisplay = (action) => {
    switch (action) {
      case 'CREATED':
        return { type: 'created', actionText: 'Created', icon: DocumentTextIcon, color: 'success' };
      case 'UPDATED':
        return { type: 'updated', actionText: 'Updated', icon: PencilIcon, color: 'primary' };
      case 'DELETED':
        return { type: 'deleted', actionText: 'Deleted', icon: TrashIcon, color: 'error' };
      case 'FAVORITED':
        return { type: 'favorited', actionText: 'Added to favorites', icon: HeartIconSolid, color: 'error' };
      case 'UNFAVORITED':
        return { type: 'unfavorited', actionText: 'Removed from favorites', icon: HeartIcon, color: 'gray' };
      case 'VIEWED':
        return { type: 'viewed', actionText: 'Viewed', icon: EyeIcon, color: 'primary' };
      default:
        return { type: 'other', actionText: action, icon: DocumentTextIcon, color: 'gray' };
    }
  };

  const display = getActivityDisplay(activity.action);
  const IconComponent = display.icon;

  return (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        display.color === 'success' 
          ? 'bg-success-100 dark:bg-success-900/20' 
          : display.color === 'primary'
          ? 'bg-primary-100 dark:bg-primary-900/20'
          : display.color === 'error'
          ? 'bg-error-100 dark:bg-error-900/20'
          : 'bg-gray-100 dark:bg-gray-900/20'
      }`}>
        <IconComponent className={`w-4 h-4 ${
          display.color === 'success'
            ? 'text-success-600 dark:text-success-400'
            : display.color === 'primary'
            ? 'text-primary-600 dark:text-primary-400'
            : display.color === 'error'
            ? 'text-error-600 dark:text-error-400'
            : 'text-gray-600 dark:text-gray-400'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-gray-100">
          <span className="font-medium">{display.actionText}</span>{' '}
          <span className="text-gray-600 dark:text-gray-400">
            "{activity.resourceTitle || 'Untitled Note'}"
          </span>
        </p>
        {activity.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {activity.description}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

const Dashboard = ({ 
  stats, 
  recentNotes, 
  activities, 
  onViewNote, 
  onEditNote, 
  onDeleteNote, 
  onToggleFavorite,
  onCreateNote,
  onViewAllNotes 
}) => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-gray-100"
        >
          Welcome back! 👋
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-400 mt-2"
        >
          Here's what's happening with your notes today
        </motion.p>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Notes"
          value={stats?.totalNotes || 0}
          icon={DocumentTextIcon}
          change={stats?.notesChange}
          changeType={stats?.notesChange > 0 ? 'positive' : 'negative'}
        />
        <StatsCard
          title="Notes This Week"
          value={stats?.notesThisWeek || 0}
          icon={PencilIcon}
          change={stats?.weeklyChange}
          changeType={stats?.weeklyChange > 0 ? 'positive' : 'negative'}
        />
        <StatsCard
          title="Favorite Notes"
          value={stats?.favoriteNotes || 0}
          icon={HeartIcon}
        />
        <StatsCard
          title="Total Views"
          value={stats?.totalViews || 0}
          icon={EyeIcon}
          change={stats?.viewsChange}
          changeType={stats?.viewsChange > 0 ? 'positive' : 'negative'}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Notes */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Recent Notes
            </h2>
            <Button variant="outline" size="sm" onClick={onViewAllNotes}>
              View all
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentNotes?.length > 0 ? (
              recentNotes.map((note) => (
                <RecentNoteCard
                  key={note.id}
                  note={note}
                  onView={onViewNote}
                  onEdit={onEditNote}
                  onDelete={onDeleteNote}
                  onToggleFavorite={onToggleFavorite}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No notes yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by creating your first note
                </p>
                <Button onClick={onCreateNote}>Create Note</Button>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Recent Activity
          </h2>
          
          <Card className="p-6">
            <div className="space-y-6">
              {activities?.length > 0 ? (
                activities.slice(0, 5).map((activity, index) => (
                  <div key={activity.id || index}>
                    <ActivityTimelineItem activity={activity} />
                    {index < Math.min(activities.length, 5) - 1 && (
                      <div className="ml-4 mt-4 h-4 border-l border-gray-200 dark:border-gray-700" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No recent activity
                  </p>
                </div>
              )}
              {activities?.length > 5 && (
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing 5 of {activities.length} recent activities
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
