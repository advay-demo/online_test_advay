import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import Logo from '../ui/Logo';

const QuizSidebar = ({ currentQuestion = 1, totalQuestions = 11, attemptedQuestions = [5] }) => {
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  
  const getQuestionClass = (q) => {
    if (q === currentQuestion) return 'question-btn current';
    if (attemptedQuestions.includes(q)) return 'question-btn attempted';
    return 'question-btn';
  };

  return (
    <aside className="w-80 app-sidebar overflow-y-auto border-r border-white/5 flex flex-col min-h-screen">
      {/* Logo Section */}
      <div className="p-4 border-b border-white/6">
        <div className="flex items-center justify-between">
          <Logo />
          <button className="text-muted hover:text-white transition">
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Question Navigator */}
      <div className="p-6 flex-1">
        <h2 className="text-xl font-bold mb-6">Question Navigator</h2>

        {/* Question Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {questions.map((q) => (
            <button
              key={q}
              className={`${getQuestionClass(q)} w-full aspect-square rounded-lg font-semibold text-lg`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-green-500/20 border-2 border-green-500/50"></div>
            <span className="text-sm soft">Attempted</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0"></div>
            <span className="text-sm soft">Current</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-[var(--surface)] border-2 border-white/10"></div>
            <span className="text-sm soft">Unattempted</span>
          </div>
        </div>

        {/* Stats */}
        <div className="card p-4">
          <p className="text-sm font-semibold mb-4">
            Question(s) left: <span className="text-white">{totalQuestions}</span>
          </p>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 soft font-medium">Category</th>
                <th className="text-left py-2 soft font-medium">Question no.</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-2 muted">Objective</td>
                <td className="py-2 text-white">1,2,3,8,9</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2 muted">Programming</td>
                <td className="py-2 text-white">4,5,6,10,11</td>
              </tr>
              <tr>
                <td className="py-2 muted">Upload</td>
                <td className="py-2 text-white">7</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Back to Module Link */}
      <div className="p-4 border-t border-white/6">
        <Link
          to="/module"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-soft hover:bg-white/3 transition"
        >
          <FaHome className="w-5 h-5" />
          Back to Module
        </Link>
      </div>
    </aside>
  );
};

export default QuizSidebar;