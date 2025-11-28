import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaCheck, FaArrowRight } from 'react-icons/fa';
import { AiOutlineWarning } from 'react-icons/ai';
import QuizSidebar from '../../components/layout/QuizSidebar';

const Quiz = () => {
  const [answer, setAnswer] = useState('');

  return (
    <div className="flex min-h-screen relative grid-texture">
      <QuizSidebar currentQuestion={1} totalQuestions={11} attemptedQuestions={[5]} />

      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="px-8 py-4 flex justify-end items-center border-b border-white/6 bg-gradient-to-b from-white/[0.01] to-transparent">
          <div className="flex items-center gap-4">
            <div className="card px-6 py-2 flex items-center gap-3">
              <FaClock className="w-5 h-5 text-indigo-400" />
              <span className="text-md font-mono font-bold">00:29:51</span>
            </div>
            <Link
              to="/submission"
              className="bg-red-600 text-white text-md px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition inline-flex items-center"
            >
              Quit Exam
            </Link>
          </div>
        </header>

        {/* Question Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl">
            {/* Breadcrumb Navigation */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Demo Module</h1>
              <p className="text-gray-400 text-sm mt-1">
                <Link to="/courses" className="hover:text-white transition">Yaksh Demo Course</Link> /
                <Link to="/module" className="hover:text-white transition"> Demo Module</Link> /
                <span className="text-white"> Quiz</span>
              </p>
            </div>

            {/* Question Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-4">Find the value of n</h2>

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="text-sm px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <span className="muted">Language:</span>
                  <span className="font-semibold text-blue-400 ml-1">PYTHON</span>
                </div>
                <div className="text-sm px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <span className="muted">Type:</span>
                  <span className="font-semibold text-purple-400 ml-1">ANSWER IN INTEGER</span>
                </div>
              </div>

              <div className="rounded-lg px-4 py-3 text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-300 flex items-center">
                <AiOutlineWarning className="w-5 h-5 inline-block mr-2" />
                LAST SUBMITTED ANSWER IS CONSIDERED FOR EVALUATION
              </div>
            </div>

            {/* Question Body */}
            <div className="card p-8 mb-6">
              <p className="soft mb-6 text-lg">Write the value of <em>n</em> for the following equation:</p>

              <div className="rounded-lg p-8 text-center mb-8 bg-white/[0.02] border border-white/[0.05]">
                <div className="text-3xl font-serif text-white">
                  3 = <span className="text-4xl font-bold text-indigo-400">n²</span> / <span className="text-2xl">3</span>
                </div>
              </div>

              <label className="block text-sm font-semibold mb-2 soft">Enter Integer:</label>
              <input
                type="text"
                className="w-full px-4 py-3 text-lg"
                placeholder="Enter your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2">
                <FaCheck className="w-5 h-5" />
                Submit Answer
              </button>
              <button className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2">
                Attempt Later
                <FaArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quiz;