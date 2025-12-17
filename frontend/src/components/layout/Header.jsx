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
  FaChevronDown
} from 'react-icons/fa';
import Logo from '../ui/Logo';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/authStore';

const Header = ({ isAuth = false, isLanding = false }) => {
  const { theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleSignOut = async () => {
    await logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/signin', { replace: true });
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

  // Mock notifications (replace with real data)
  const notifications = [
    { id: 1, text: 'New assignment posted', time: '5m ago', unread: true },
    { id: 2, text: 'Quiz results available', time: '2h ago', unread: true },
    { id: 3, text: 'Course update', time: '1d ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 sm:p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 active:scale-95 transition-all duration-200"
                  aria-label="Notifications"
                >
                  <FaBell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                      <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-l-2 ${
                            notif.unread 
                              ? 'border-purple-500 bg-purple-500/5' 
                              : 'border-transparent'
                          }`}
                        >
                          <p className="text-sm text-[var(--text-primary)] mb-1">{notif.text}</p>
                          <span className="text-xs text-[var(--text-secondary)]">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-[var(--border-subtle)] text-center">
                      <button className="text-sm text-purple-500 hover:text-purple-400 font-medium transition-colors">
                        View All Notifications
                      </button>
                    </div>
                  </div>
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