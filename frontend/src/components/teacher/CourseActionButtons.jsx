import React from 'react';
import { Link } from 'react-router-dom';

const CourseActionButtons = ({ activeButton = null }) => {
  const buttons = [
    {
      label: 'Course Library',
      shortLabel: 'Library',
      path: '/teacher/courses',
      type: 'library',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13M3 6.253C4.168 5.477 5.754 5 7.5 5S10.832 5.477 12 6.253M12 6.253C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253M3 19.253C4.168 18.477 5.754 18 7.5 18S10.832 18.477 12 19.253M12 19.253C13.168 18.477 14.754 18 16.5 18S19.832 18.477 21 19.253" />
        </svg>
      ),
    },
    {
      label: 'Grading System',
      shortLabel: 'Grading',
      path: '/teacher/grading-systems',
      type: 'grading',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Create New Course',
      shortLabel: 'New Course',
      path: '/teacher/add-course',
      type: 'create',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1">
        {buttons.map((button) => {
          const isActive = activeButton === button.type;
          return (
            <Link
              key={button.type}
              to={button.path}
              className={`group relative px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm flex items-center gap-2.5 whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30'
                  : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-blue-500/30 hover:bg-[var(--card-strong-bg)]'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                {button.icon}
              </span>
              <span className="hidden md:inline font-semibold">{button.label}</span>
              <span className="md:hidden font-semibold">{button.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CourseActionButtons;