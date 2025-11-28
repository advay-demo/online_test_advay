import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import Logo from '../../components/ui/Logo';

const Submission = () => {
  const questions = [
    { id: 1, title: 'Find value of n', attempted: true },
    { id: 2, title: 'Print Output in Python2.x', attempted: true },
    { id: 3, title: 'Adding decimals', attempted: true },
    { id: 4, title: 'Check Palindrome', attempted: false },
    { id: 5, title: 'For Loop over String', attempted: false },
    { id: 6, title: 'Add 3 numbers', attempted: false },
    { id: 7, title: 'Hello World in File', attempted: false },
    { id: 8, title: 'Reverse a string', attempted: false },
    { id: 9, title: 'Arrange code to convert km to miles', attempted: false },
    { id: 10, title: 'Print Hello, World!', attempted: false },
    { id: 11, title: 'Square of two numbers', attempted: false },
  ];

  const attemptedCount = questions.filter(q => q.attempted).length;
  const notAttemptedCount = questions.filter(q => !q.attempted).length;

  return (
    <div className="min-h-screen flex flex-col relative grid-texture bg-gradient-to-b from-[var(--bg-1)] to-[var(--bg-2)]">
      {/* Header */}
      <header className="px-8 py-4 border-b border-white/6 bg-gradient-to-b from-white/[0.01] to-transparent">
        <div className="flex items-center justify-between">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Submission Status</h1>
            <p className="text-gray-400 text-sm">Review your exam submission details</p>
          </div>

          {/* Status Table */}
          <div className="card-strong overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-indigo-400 font-semibold uppercase tracking-wider text-sm">
                      Question
                    </th>
                    <th className="text-left px-6 py-4 text-indigo-400 font-semibold uppercase tracking-wider text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => (
                    <tr
                      key={question.id}
                      className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${index === questions.length - 1 ? 'border-b-0' : ''
                        }`}
                    >
                      <td className="px-6 py-4 soft">{question.title}</td>
                      <td className="px-6 py-4">
                        {question.attempted ? (
                          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide bg-green-500/15 text-green-300 border border-green-500/30">
                            <FaCheck className="w-4 h-4" />
                            ATTEMPTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide bg-red-500/15 text-red-300 border border-red-500/30">
                            <FaTimes className="w-4 h-4" />
                            NOT ATTEMPTED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{attemptedCount}</div>
              <div className="text-sm muted">Questions Attempted</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-red-400 mb-1">{notAttemptedCount}</div>
              <div className="text-sm muted">Questions Not Attempted</div>
            </div>
          </div>

          {/* Confirmation Box */}
          <div className="card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-yellow-500/20 border border-yellow-500/30">
              <FaExclamationTriangle className="w-8 h-8 text-yellow-400" />
            </div>

            <p className="text-lg soft mb-2">Your current answers are saved.</p>
            <p className="text-xl font-semibold text-white mb-2">Are you sure you wish to quit exam?</p>
            <p className="text-base muted mb-8">Be sure, as you won't be able to restart this exam.</p>

            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                to="/module"
                className="bg-green-600 text-white px-10 py-3 rounded-xl font-semibold hover:bg-green-700 transition text-lg flex items-center gap-2"
              >
                <FaCheck className="w-5 h-5" />
                Yes, Quit
              </Link>
              <Link
                to="/quiz"
                className="bg-red-600 text-white px-10 py-3 rounded-xl font-semibold hover:bg-red-700 transition text-lg flex items-center gap-2"
              >
                <FaTimes className="w-5 h-5" />
                No, Continue
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Submission;