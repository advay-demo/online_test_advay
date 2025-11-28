import React from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaBook, FaComments, FaArrowRight } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

const CourseModule = () => {
  return (
    <div className="flex min-h-screen relative grid-texture">
      <Sidebar />

      <main className="flex-1">
        <Header isAuth />

        <div className="p-8">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Demo Module</h1>
            <p className="text-gray-400 text-sm mt-1">
              <Link to="/courses" className="hover:text-white transition">Yaksh Demo Course</Link> /
              <span className="text-white"> Demo Module</span>
            </p>
          </div>

          {/* Course Progress */}
          <div className="card-strong p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Course Progress</h2>
              <span className="text-3xl font-bold text-white">72%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div className="h-3 rounded-full bg-indigo-500 transition-all" style={{ width: '72%' }}></div>
            </div>
            <p className="text-sm muted mt-3">18 of 25 lessons completed</p>
          </div>

          {/* Module Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Quiz Card */}
            <div className="card p-6 hover:scale-[1.02] transition-all duration-200 border-l-4 border-indigo-400">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-500/15 border border-indigo-500/20">
                  <FaClipboardList className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Demo Quiz</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-400 font-medium">Quiz</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 font-medium">Completed</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/quiz"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                Start Quiz
                <FaArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Lesson Card */}
            <div className="card p-6 hover:scale-[1.02] transition-all duration-200 border-l-4 border-blue-400">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/15 border border-blue-500/20">
                  <FaBook className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Demo Lesson</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-400 font-medium">Lesson</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-400 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/lesson"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                Continue Learning
                <FaArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Discussion Forum */}
          <div className="card-strong p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-indigo-600">
              <FaComments className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Discussion Forum</h2>
            <p className="text-gray-400 mb-6">Have questions? Discuss with peers and instructors</p>
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
              Visit Forum
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseModule;