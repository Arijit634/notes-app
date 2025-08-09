import { Menu, Transition } from '@headlessui/react';
import {
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  StarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { Badge } from '../common';
import Button from '../common/Button';
import Input from '../common/Input';

const ViewToggle = ({ view, onViewChange }) => (
  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
    <button
      onClick={() => onViewChange('grid')}
      className={`p-2 rounded-md transition-colors ${
        view === 'grid'
          ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      <Squares2X2Icon className="w-4 h-4" />
    </button>
    <button
      onClick={() => onViewChange('list')}
      className={`p-2 rounded-md transition-colors ${
        view === 'list'
          ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      <ListBulletIcon className="w-4 h-4" />
    </button>
  </div>
);

const FilterMenu = ({ filters, onFilterChange }) => (
  <Menu as="div" className="relative">
    <Menu.Button as={Button} variant="outline" size="sm">
      <FunnelIcon className="w-4 h-4 mr-2" />
      Filters
      {Object.values(filters).some(Boolean) && (
        <Badge variant="primary" size="sm" className="ml-2">
          {Object.values(filters).filter(Boolean).length}
        </Badge>
      )}
    </Menu.Button>

    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none z-10">
        <div className="p-3">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => onFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">All categories</option>
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Project">Project</option>
                <option value="Meeting">Meeting</option>
                <option value="Idea">Idea</option>
                <option value="Todo">Todo</option>
                <option value="Reference">Reference</option>
                <option value="Journal">Journal</option>
                <option value="Recipe">Recipe</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.favorites}
                    onChange={(e) => onFilterChange('favorites', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Favorites only
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.public}
                    onChange={(e) => onFilterChange('public', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Public notes
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.private}
                    onChange={(e) => onFilterChange('private', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Private notes
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => onFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onFilterChange('reset')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear filters
            </button>
          </div>
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);

const SortMenu = ({ sortBy, sortOrder, onSortChange }) => (
  <Menu as="div" className="relative">
    <Menu.Button as={Button} variant="outline" size="sm">
      Sort: {sortBy} {sortOrder === 'asc' ? '↑' : '↓'}
    </Menu.Button>

    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none z-10">
        <div className="p-2">
          {[
            { key: 'updatedAt', label: 'Last updated' },
            { key: 'createdAt', label: 'Date created' },
            { key: 'title', label: 'Title' },
            { key: 'favorite', label: 'Favorites first' },
          ].map((option) => (
            <Menu.Item key={option.key}>
              {({ active }) => (
                <button
                  onClick={() => {
                    if (sortBy === option.key) {
                      onSortChange(option.key, sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      onSortChange(option.key, 'desc');
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    active
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-300'
                  } ${sortBy === option.key ? 'font-medium' : ''}`}
                >
                  {option.label}
                  {sortBy === option.key && (
                    <span className="ml-2">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);

const NotesHeader = ({
  searchQuery,
  onSearchChange,
  view,
  onViewChange,
  filters,
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  onCreateNote,
  totalNotes,
  filteredCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredCount !== totalNotes ? (
              <>Showing {filteredCount} of {totalNotes} notes</>
            ) : (
              <>{totalNotes} notes total</>
            )}
          </p>
        </div>
        
        <Button onClick={onCreateNote}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search and Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center space-x-3">
          <FilterMenu
            filters={filters}
            onFilterChange={onFilterChange}
          />
          
          <SortMenu
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />
          
          <ViewToggle
            view={view}
            onViewChange={onViewChange}
          />
        </div>
      </div>

      {/* Active Filters */}
      {Object.entries(filters).some(([key, value]) => value && key !== 'reset') && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Active filters:
          </span>
          <div className="flex items-center space-x-2">
            {filters.category && (
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onFilterChange('category', '')}
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {filters.category}
                <button className="ml-1 hover:text-gray-600 dark:hover:text-gray-300">
                  ×
                </button>
              </Badge>
            )}
            {filters.favorites && (
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onFilterChange('favorites', false)}
              >
                <StarIcon className="w-3 h-3 mr-1" />
                Favorites
                <button className="ml-1 hover:text-gray-600 dark:hover:text-gray-300">
                  ×
                </button>
              </Badge>
            )}
            {filters.public && (
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onFilterChange('public', false)}
              >
                <EyeIcon className="w-3 h-3 mr-1" />
                Public
                <button className="ml-1 hover:text-gray-600 dark:hover:text-gray-300">
                  ×
                </button>
              </Badge>
            )}
            {filters.private && (
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onFilterChange('private', false)}
              >
                <EyeSlashIcon className="w-3 h-3 mr-1" />
                Private
                <button className="ml-1 hover:text-gray-600 dark:hover:text-gray-300">
                  ×
                </button>
              </Badge>
            )}
            {filters.dateRange && (
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onFilterChange('dateRange', '')}
              >
                <CalendarIcon className="w-3 h-3 mr-1" />
                {filters.dateRange}
                <button className="ml-1 hover:text-gray-600 dark:hover:text-gray-300">
                  ×
                </button>
              </Badge>
            )}
            <button
              onClick={() => onFilterChange('reset')}
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesHeader;
