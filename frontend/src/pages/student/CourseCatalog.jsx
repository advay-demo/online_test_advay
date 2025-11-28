import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaUsers, FaClock, FaCode } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

const CourseCatalog = () => {
  const courses = [
    {
      id: 1,
      title: 'Python Fundamentals',
      subtitle: 'Data Structures & Algorithms',
      instructor: 'Prof. Sarah Chen',
      level: 'Advanced',
      rating: 4.8,
      students: 5200,
      duration: '40 hours',
      progress: 72,
      color: 'cyan',
      icon: 'code'
    },
    {
      id: 2,
      title: 'Web Development Basics',
      subtitle: 'HTML/CSS/JavaScript',
      instructor: 'Prof. Emma Johnson',
      level: 'Intermediate',
      rating: 4.6,
      students: 3800,
      duration: '35 hours',
      progress: 45,
      color: 'blue',
      icon: 'html'
    },
    {
      id: 3,
      title: 'Java Full-Stack Development',
      subtitle: 'Enterprise Development',
      instructor: 'Dr. Michael Wong',
      level: 'Advanced',
      rating: 4.9,
      students: 6400,
      duration: '52 hours',
      progress: 28,
      color: 'orange',
      icon: 'java'
    },
    {
      id: 4,
      title: 'C Programming Basics',
      subtitle: 'Foundation Course',
      instructor: 'Prof. David Lee',
      level: 'Beginner',
      rating: 4.7,
      students: 4200,
      duration: '30 hours',
      progress: 60,
      color: 'green',
      icon: 'c'
    }
  ];

  return (
    <div className="flex min-h-screen relative grid-texture">
      <Sidebar />

      <main className="flex-1">
        <Header isAuth />

        <div className="p-8">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Course Catalog</h1>
            <p className="text-gray-400 text-sm mt-1">Browse, enroll, and manage your learning courses</p>
          </div>

          <div className="flex gap-6">
            {/* Filter Sidebar */}
            <div className="w-80 bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-xl p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Filter</h2>

              {/* Level Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Level</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-indigo-500" />
                    <span className="text-sm">Beginner</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-indigo-500" />
                    <span className="text-sm">Intermediate</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-indigo-500" />
                    <span className="text-sm">Advanced</span>
                  </label>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  {['Programming', 'Data Science', 'Web Development', 'Mobile Dev', 'Cloud Computing'].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-indigo-500" />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="flex-1">
              {/* Tabs */}
              <div className="inline-flex gap-2 mb-6 p-1 bg-transparent">
                <button className="bg-gradient-to-r from-[var(--grad-1)] to-[var(--grad-2)] text-white px-6 py-2 rounded-full font-semibold">
                  All Courses
                </button>
                <button className="bg-white/[0.02] text-soft px-5 py-2 rounded-full hover:bg-white/[0.05] transition">
                  Enrolled
                </button>
                <button className="bg-white/[0.02] text-soft px-5 py-2 rounded-full hover:bg-white/[0.05] transition">
                  Completed
                </button>
              </div>

              {/* Course Cards Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    to="/module"
                    className="card overflow-hidden transition hover:scale-[1.01] block"
                  >
                    {/* Minimal Dark Header */}
                    <div className="bg-gradient-to-b from-white/[0.02] to-black/[0.06] border-b border-white/[0.03] h-44 flex items-center justify-center relative">
                      <div className="absolute top-4 right-4 bg-white/[0.06] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {course.level}
                      </div>
                      <div className="text-center">
                        {course.icon === 'code' && (
                          <>
                            <FaCode className={`w-20 h-20 text-${course.color}-400 mx-auto mb-2`} />
                            <p className="text-xs text-white/80 font-medium">{course.title}</p>
                            <p className={`text-xs text-${course.color}-200`}>{course.subtitle}</p>
                          </>
                        )}
                        {course.icon === 'html' && (
                          <>
                            <div className="text-white text-5xl font-bold mb-2">HTML/5</div>
                            <p className="text-xs text-white/80 font-medium">Web Development</p>
                          </>
                        )}
                        {course.icon === 'java' && (
                          <>
                            <svg className={`w-20 h-20 text-${course.color}-400 mx-auto mb-2`} viewBox="0 0 50 50" fill="currentColor">
                              <path d="M25 10 L15 40 L35 40 Z M20 30 L25 20 L30 30 Z" />
                            </svg>
                            <p className="text-xs text-white/80 font-medium">Java Full-Stack</p>
                            <p className={`text-xs text-${course.color}-200`}>Enterprise Development</p>
                          </>
                        )}
                        {course.icon === 'c' && (
                          <>
                            <div className={`w-20 h-20 rounded-xl border-2 border-${course.color}-400 flex items-center justify-center mx-auto mb-2`}>
                              <span className={`text-4xl font-bold text-${course.color}-400`}>C</span>
                            </div>
                            <p className="text-xs text-white/80 font-medium">C Programming</p>
                            <p className={`text-xs text-${course.color}-200`}>Foundation Course</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 text-white">{course.title}</h3>
                      <p className="muted text-sm mb-4">{course.instructor}</p>

                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FaStar className="w-4 h-4 text-yellow-400" />
                          <span className="font-semibold">{course.rating}</span>
                        </div>

                        <div className="flex items-center gap-1 muted">
                          <FaUsers className="w-4 h-4" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-1 muted">
                          <FaClock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="muted">Progress</span>
                          <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-white/6 rounded-full h-2">
                          <div className={`h-2 rounded-full bg-${course.color}-500`} style={{ width: `${course.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseCatalog;