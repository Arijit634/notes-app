import {
    Bars3Icon,
    BellIcon,
    Cog6ToothIcon,
    MoonIcon,
    SunIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile, useKeyboardShortcut } from '../../hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleMobileMenu, toggleSidebar, toggleTheme } from '../../store/slices/uiSlice';
import { cn } from '../../utils/ui';
import { Avatar, Badge } from '../common';
import Button from '../common/Button';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { 
    sidebarOpen, 
    mobileMenuOpen, 
    theme,
    notifications 
  } = useSelector(state => state.ui);
  
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // Handlers
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout anyway
      navigate('/auth');
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcut('cmd+k', () => {
    // Open search modal
    console.log('Open search');
  });

  useKeyboardShortcut('cmd+/', () => {
    dispatch(toggleSidebar());
  });

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || mobileMenuOpen) && (
          <>
            {/* Mobile overlay */}
            {isMobile && (
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => dispatch(toggleMobileMenu())}
              />
            )}
            
            {/* Sidebar */}
            <motion.aside
              className={cn(
                'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col',
                {
                  'lg:translate-x-0': sidebarOpen,
                  'lg:-translate-x-full': !sidebarOpen,
                }
              )}
              initial={isMobile ? { x: -256 } : false}
              animate={isMobile ? { x: 0 } : false}
              exit={isMobile ? { x: -256 } : false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Notes
                  </h1>
                </div>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(toggleMobileMenu())}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                <SidebarLink 
                  href="/dashboard" 
                  icon="🏠" 
                  label="Dashboard" 
                  isActive={location.pathname === '/dashboard'}
                />
                <SidebarLink 
                  href="/notes" 
                  icon="📝" 
                  label="Notes" 
                  isActive={location.pathname === '/notes'}
                />
                <SidebarLink 
                  href="/favorites" 
                  icon="❤️" 
                  label="Favorites" 
                  isActive={location.pathname === '/favorites'}
                />
                <SidebarLink 
                  href="/categories" 
                  icon="🏷️" 
                  label="Categories" 
                  isActive={location.pathname === '/categories'}
                />
                <SidebarLink 
                  href="/shared" 
                  icon="🔗" 
                  label="Shared" 
                  isActive={location.pathname === '/shared'}
                />
              </nav>

              {/* User Section */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar
                    name={user?.username}
                    src={user?.profilePicture}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(toggleTheme())}
                    className="flex-1"
                  >
                    {theme === 'dark' ? (
                      <SunIcon className="w-4 h-4" />
                    ) : (
                      <MoonIcon className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex-1"
                  >
                    <span className="text-xs">Logout</span>
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isMobile ? dispatch(toggleMobileMenu()) : dispatch(toggleSidebar())}
              >
                <Bars3Icon className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <BellIcon className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <Badge
                      variant="error"
                      size="sm"
                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Settings */}
              <Button variant="ghost" size="sm">
                <Cog6ToothIcon className="w-5 h-5" />
              </Button>

              {/* Profile */}
              <Avatar
                name={user?.username}
                src={user?.profilePicture}
                size="sm"
                className="cursor-pointer"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Sidebar Link Component
const SidebarLink = ({ href, icon, label, badge, isActive = false }) => {
  return (
    <Link
      to={href}
      className={cn(
        'flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
        {
          'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300': isActive,
          'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800': !isActive,
        }
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <Badge variant="gray" size="sm">
          {badge}
        </Badge>
      )}
    </Link>
  );
};

export default Layout;
