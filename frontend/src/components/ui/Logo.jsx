import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <Link to="/" className="flex items-center gap-3">
      <div className={`${sizes[size]} rounded-full logo-badge flex items-center justify-center text-white font-semibold`}>
        <span className={textSizes[size]}>Y</span>
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold`}>Yaksh</span>
      )}
    </Link>
  );
};

export default Logo;