import React from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaUser } from 'react-icons/fa';
import Logo from '../ui/Logo';

const Header = ({ isAuth = false, isLanding = false }) => {
  if (isLanding) {
    return (
      <header className="sticky top-0 z-50 bg-[#0b0b11]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/signin" className="text-gray-300 hover:text-white font-medium transition">
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
      <header className="px-8 py-4 border-b border-white/6 bg-gradient-to-b from-white/[0.01] to-transparent">
        <div className="flex justify-end items-center gap-4">
          <button className="p-2 text-soft hover:text-white transition">
            <FaBell className="w-6 h-6" />
          </button>
          <Link to="/profile" className="p-2 text-soft hover:text-white transition">
            <FaUser className="w-6 h-6" />
          </Link>
        </div>
      </header>
    );
  }

  return null;
};

export default Header;