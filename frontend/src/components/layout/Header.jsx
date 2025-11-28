import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaSun, FaMoon, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Logo from '../ui/Logo';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/authStore';

const Header = ({ isAuth = false, isLanding = false }) => {
  const { theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = async () => {
    await logout();
    navigate('/signin', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <FaSun className="w-5 h-5 text-white" />
      ) : (
        <FaMoon className="w-5 h-5 text-blue-400" />
      )}
    </button>
  );

  if (isLanding) {
    return (
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/signin" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition">
              Sign In
            </Link>
            <Link to="/signup" className="btn-grad text-white px-5 py-2 rounded-lg font-medium hover:brightness-105 transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>
    );
  }

  if (isAuth) {
    return (
      <header className="px-8 py-4 border-b border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-primary)]/[0.01] to-transparent">
        <div className="flex justify-end items-center gap-4">
          <ThemeToggle />
          <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
            <FaBell className="w-6 h-6" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition focus:outline-none"
            >
              <FaUser className="w-6 h-6" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-lg py-1 z-50 backdrop-blur-sm">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaCog className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition text-left"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return null;
};

export default Header;