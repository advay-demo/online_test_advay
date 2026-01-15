import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaUpload, FaPlus } from 'react-icons/fa';

const QuestionActionButtons = ({ activeButton = null }) => {
  const buttons = [
    {
      label: 'Question Library',
      shortLabel: 'Library',
      path: '/teacher/questions',
      type: 'library',
      icon: <FaBook className="w-4 h-4" />,
    },
    {
      label: 'Upload Questions',
      shortLabel: 'Upload',
      path: '/teacher/upload-question',
      type: 'upload',
      icon: <FaUpload className="w-4 h-4" />,
    },
    {
      label: 'Add Question',
      shortLabel: 'Add',
      path: '/teacher/add-question',
      type: 'create',
      icon: <FaPlus className="w-4 h-4" />,
    },
  ];

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex gap-7 sm:gap-3 overflow-x-auto scrollbar-hide pb-1">
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

export default QuestionActionButtons;