import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaUser, 
  FaSun, 
  FaMoon, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaCheck,
  FaCheckDouble,
  FaArrowRight,
  FaClock
} from 'react-icons/fa';
import Logo from '../ui/Logo';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationsStore } from '../../store/notificationsStore';

const Header = ({ isAuth = false, isLanding = false }) => {
  const { theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  // Notifications store
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  } = useNotificationsStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (isAuth && user) {
      fetchNotifications();
      fetchUnreadCount();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuth, user]);

  const handleSignOut = async () => {
    await logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/signin', { replace: true });
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.message_uid);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="p-2 sm:p-2.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <FaSun className="w-5 h-5 sm:w-5 sm:h-5 text-amber-400" />
      ) : (
        <FaMoon className="w-5 h-5 sm:w-5 sm:h-5 text-indigo-500" />
      )}
    </button>
  );

  if (isLanding) {
    return (
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-[var(--border-color)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo size="md" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <ThemeToggle />
              <Link 
                to="/signin" 
                className="px-4 lg:px-5 py-2 text-sm lg:text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors rounded-lg hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="btn-grad px-5 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base text-white rounded-xl font-semibold hover:brightness-110 active:scale-95 transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div 
              ref={mobileMenuRef}
              className="md:hidden py-4 border-t border-[var(--border-color)] animate-in slide-in-from-top duration-200"
            >
              <div className="flex flex-col gap-2">
                <Link 
                  to="/signin" 
                  className="px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-grad px-4 py-3 text-white rounded-xl font-semibold text-center shadow-lg shadow-purple-500/25"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  if (isAuth) {
    return (
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 backdrop-blur-xl shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-2 sm:gap-3 h-16 md:h-20">
            
            {/* Left: Mobile Logo */}
            <div className="flex items-center gap-2 md:hidden">
              <Logo size="sm" showText={false} />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              
              {/* Theme Toggle - Always visible */}
              <ThemeToggle />

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    if (!isNotificationOpen) {
                      fetchNotifications();
                    }
                  }}
                  className="relative p-2 sm:p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 active:scale-95 transition-all duration-200"
                  aria-label="Notifications"
                >
                  <FaBell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationOpen && (
                  <>
                    {/* Mobile Overlay */}
                    <div 
                      className="fixed inset-0 bg-black/50 z-40 md:hidden"
                      onClick={() => setIsNotificationOpen(false)}
                    />
                    
                    {/* Dropdown Panel */}
                    <div className="fixed md:absolute inset-x-4 top-20 md:inset-x-auto md:right-0 md:top-auto md:mt-2 w-auto md:w-80 lg:w-96 max-w-md mx-auto md:mx-0 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 md:slide-in-from-top-1 duration-200">
                      
                      {/* Header */}
                      <div className="px-3 sm:px-4 py-3 sm:py-3.5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                              <FaBell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-[var(--text-primary)] text-xs sm:text-sm truncate">
                                Notifications
                              </h3>
                              {unreadCount > 0 && (
                                <p className="text-xs text-[var(--text-secondary)]">
                                  {unreadCount} unread
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {notifications.length > 0 && unreadCount > 0 && (
                              <button
                                onClick={handleMarkAllAsRead}
                                className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-all hover:bg-purple-500/10 rounded-lg"
                              >
                                <FaCheckDouble className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">Mark all</span>
                              </button>
                            )}
                            {/* Close button for mobile */}
                            <button
                              onClick={() => setIsNotificationOpen(false)}
                              className="md:hidden p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <FaTimes className="w-4 h-4 text-[var(--text-secondary)]" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-[60vh] md:max-h-[28rem] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                          <div className="px-4 py-8 sm:py-12 text-center">
                            <div className="inline-block w-8 h-8 sm:w-10 sm:h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-2 sm:mb-3"></div>
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Loading notifications...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="px-4 py-8 sm:py-12 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl flex items-center justify-center">
                              <FaBell className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-secondary)] opacity-40" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1">All caught up!</p>
                            <p className="text-xs text-[var(--text-secondary)]">No new notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[var(--border-subtle)]">
                            {notifications.map((notif, index) => (
                              <div
                                key={notif.message_uid}
                                onClick={() => handleNotificationClick(notif)}
                                className={`group relative px-3 sm:px-4 py-3 sm:py-3.5 hover:bg-white/5 active:bg-white/10 transition-all cursor-pointer ${
                                  !notif.read 
                                    ? 'bg-purple-500/5 border-l-3 border-l-purple-500' 
                                    : 'border-l-3 border-l-transparent'
                                }`}
                                style={{
                                  animationDelay: `${index * 50}ms`
                                }}
                              >
                                {/* Unread indicator dot */}
                                {!notif.read && (
                                  <div className="absolute left-1.5 sm:left-2 top-4 sm:top-5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                )}

                                <div className="flex items-start gap-2 sm:gap-3">
                                  {/* Avatar/Icon */}
                                  <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                                    notif.message_type === 'success' ? 'bg-green-500/20 text-green-400' :
                                    notif.message_type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                    notif.message_type === 'danger' ? 'bg-red-500/20 text-red-400' :
                                    'bg-purple-500/20 text-purple-400'
                                  }`}>
                                    {notif.sender_name ? (
                                      <span className="text-xs sm:text-sm font-semibold">
                                        {notif.sender_name.charAt(0).toUpperCase()}
                                      </span>
                                    ) : (
                                      <FaBell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-purple-400 transition-colors">
                                        {notif.summary}
                                      </p>
                                      {!notif.read && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notif.message_uid);
                                          }}
                                          className="md:opacity-0 md:group-hover:opacity-100 p-1 sm:p-1.5 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 text-purple-400 hover:text-purple-300 transition-all flex-shrink-0"
                                          title="Mark as read"
                                        >
                                          <FaCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    {notif.description && (
                                      <div 
                                        className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: notif.description }}
                                      />
                                    )}

                                    {/* Meta info */}
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                      {notif.sender_name && (
                                        <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] bg-white/5 px-1.5 sm:px-2 py-0.5 rounded-md">
                                          <FaUser className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                          <span className="truncate max-w-[100px] sm:max-w-none">{notif.sender_name}</span>
                                        </span>
                                      )}
                                      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                                        <FaClock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                        {notif.time_since} ago
                                      </span>
                                      {notif.message_type && (
                                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded-md ${
                                          notif.message_type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                          notif.message_type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                          notif.message_type === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        }`}>
                                          {notif.message_type}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-[var(--border-subtle)] bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                          <button 
                            onClick={() => {
                              setIsNotificationOpen(false);
                              navigate('/notifications');
                            }}
                            className="w-full py-2 text-xs sm:text-sm text-purple-400 hover:text-purple-300 font-medium transition-all hover:bg-purple-500/10 active:bg-purple-500/20 rounded-lg group flex items-center justify-center gap-2"
                          >
                            <span>View All Notifications</span>
                            <FaArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl hover:bg-white/5 active:scale-95 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                    {user?.first_name?.charAt(0) || 'U'}
                  </div>
                  <FaChevronDown className={`w-3 h-3 text-[var(--text-secondary)] transition-transform duration-200 hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    
                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-[var(--border-subtle)] bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                      <p className="font-semibold text-[var(--text-primary)] truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] truncate">
                        {user?.email}
                      </p>
                      <span className="inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {user?.is_moderator ? 'Teacher' : 'Student'}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUser className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>My Profile</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaCog className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-[var(--border-subtle)] py-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
                      >
                        <FaSignOutAlt className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return null;
};

export default Header;