import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaChartBar, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
import Logo from '../ui/Logo';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/courses', label: 'Course Catalog', icon: FaBook },
    { path: '/insights', label: 'Insights', icon: FaChartBar },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    await logout();
    navigate('/signin', { replace: true });
  };

  return (
    <aside className="w-64 app-sidebar flex flex-col border-r border-white/5 min-h-screen">
      {/* Logo Section */}
      <div className="p-4 border-b border-white/6">
        <div className="flex items-center justify-between">
          <Logo />
          <button className="text-muted hover:text-white transition">
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                isActive(item.path)
                  ? 'subtle-accent bg-white/3 text-white'
                  : 'text-soft hover:bg-white/3'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-white/6 mt-auto">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-medium text-soft hover:bg-white/3 transition"
        >
          <FaSignOutAlt className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
