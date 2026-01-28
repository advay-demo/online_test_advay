import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaBolt, FaChartLine, FaClock, FaArrowRight } from 'react-icons/fa';
import { AiOutlineCheck, AiOutlineTrophy, AiOutlineMessage, AiOutlineFire } from 'react-icons/ai';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useAuthStore } from '../../store/authStore';
import { fetchStudentDashboardCourses } from '../../api/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchStudentDashboardCourses();
        console.log('Dashboard data:', data.dashboard);
        setStats(data.stats || {});
        setCourses(data.courses || []);
        setDashboard(data.dashboard || {});
        setActivities(data.dashboard?.recent_activities || []);
        setUpcomingQuizzes(data.dashboard?.upcoming_quizzes || []);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Helper function to format percentage change
  const formatChange = (changeValue) => {
    if (changeValue === null || changeValue === undefined) {
      return '0%';
    }
    const rounded = Math.round(changeValue * 10) / 10; // Round to 1 decimal place
    return rounded >= 0 ? `+${rounded}%` : `${rounded}%`;
  };


  const stat_s = [
    {
      label: 'Total Courses',
      value: dashboard?.total_enrolled ?? 0,
      change: formatChange(dashboard?.total_enrolled_change),
      isNegative: (dashboard?.total_enrolled_change ?? 0) < 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13M3 6.253C4.168 5.477 5.754 5 7.5 5S10.832 5.477 12 6.253M12 6.253C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253M3 19.253C4.168 18.477 5.754 18 7.5 18S10.832 18.477 12 19.253M12 19.253C13.168 18.477 14.754 18 16.5 18S19.832 18.477 21 19.253" />
        </svg>
      ),
      color: 'rgb(234, 179, 8)',
    },
    {
      label: 'Active Courses',
      value: dashboard?.active_enrolled ?? 0,
      change: formatChange(dashboard?.active_enrolled_change),
      isNegative: (dashboard?.active_enrolled_change ?? 0) < 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'rgb(34, 197, 94)',
    },
    {
      label: 'Avg. Completion',
      value: `${dashboard?.avg_completion ?? 0}%`,
      change: formatChange(dashboard?.avg_completion_change),
      isNegative: (dashboard?.avg_completion_change ?? 0) < 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'rgb(249, 115, 22)',
    },
    {
      label: 'Learning Hours',
      value: stats?.learning_hours || '0h 0m',
      change: '', // You can add a change if you have it
      isNegative: false,
      icon: (
        <FaClock className="w-6 h-6" />
      ),
      color: 'rgb(168, 85, 247)',
    },
  ];

  

  if (loading) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        <Sidebar />
        <main className="flex-1">
          <Header isAuth />
          <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        <Sidebar />
        <main className="flex-1">
          <Header isAuth />
          <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-300 text-center max-w-md">
              {error}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Helper for course progress bar color
  const getProgressColor = (percent) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex min-h-screen relative grid-texture">
      <Sidebar />
      <main className="flex-1 w-full lg:w-auto">
        <Header isAuth />
        <div className="p-4 sm:p-6 lg:p-8">

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
              <p className="muted text-sm">
                Welcome back, {user?.name || user?.username}! Here&apos;s your learning progress and activities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {stat_s.map((stat, index) => (
              <div key={index} className="card-strong p-5 sm:p-6 rounded-2xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="muted text-xs sm:text-sm mb-2">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold mb-2">{stat.value}</p>
                    {stat.change !== undefined && (
                      <p className={`text-xs sm:text-sm font-medium ${stat.isNegative ? 'text-red-400' : 'text-green-400'}`}>
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${stat.color}26`,
                      border: `1px solid ${stat.color}40`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {/* Upcoming Quizzes */}
            <div className="lg:col-span-2 card-strong p-5 sm:p-6 rounded-2xl">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-1">Upcoming Quizzes</h2>
                <p className="text-xs sm:text-sm muted">Quizzes scheduled for your courses</p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {upcomingQuizzes.length > 0 ? upcomingQuizzes.map((quiz, index) => (
                  <div key={index} className="card p-4 sm:p-5 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex gap-3 sm:gap-4 flex-1">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'rgba(34,197,94,0.15)',
                            border: '1px solid rgba(34,197,94,0.2)',
                          }}
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{quiz.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm muted">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {quiz.course_name}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" />
                              </svg>
                              {quiz.module_name}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                        <span className="w-full sm:w-auto border border-[var(--border-color)] px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-muted opacity-50 cursor-not-allowed whitespace-nowrap">
                          Manage
                        </span>
                     
                    </div>
                  </div>
                )) : (
                  <div className="card p-5 text-center text-muted">
                    <p>No upcoming quizzes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Students */}
            <div className="card-strong p-5 sm:p-6 rounded-2xl">
            </div>

          </div>
  
          <section
            className="
              rounded-3xl
              border border-[var(--border-color)] dark:border-white/10
              bg-white dark:bg-white/[0.04]
              backdrop-blur-xl
              p-6 sm:p-8
            "
          >
            {/* Header */}
            <header className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">
                  Enrolled Courses
                </h2>
                <p className="text-sm text-[var(--text-muted)] dark:text-white/50 mt-1">
                  Continue where you left off
                </p>
              </div>
              <span className="text-xs font-medium text-[var(--text-muted)] dark:text-white/60">
                {(searchResult || courses).length} total
              </span>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(searchResult || courses).length > 0 ? (
                (searchResult || courses).map((course) => (
                  <article
                    key={course.id}
                    className="
                      group relative flex flex-col rounded-2xl
                      border border-[var(--border-color)] dark:border-white/10
                      bg-white dark:bg-white/[0.03]
                      p-5
                      transition-all duration-300
                      hover:-translate-y-[2px]
                      hover:bg-[var(--input-bg)] dark:hover:bg-white/[0.06]
                    "
                  >
                    {/* Course Title */}
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-1 text-[var(--text-primary)] dark:text-white">
                      {course.name}
                    </h3>
                    {/* Instructor */}
                    <p className="text-xs text-[var(--text-muted)] dark:text-white/50 mb-4">
                      {course.instructor}
                    </p>
                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-[var(--text-muted)] dark:text-white/50">
                        {course.course_content?.length ?? 0} modules
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          course.active
                            ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                            : 'border-[var(--border-color)] text-[var(--text-muted)] dark:border-white/20 dark:text-white/40'
                        }`}
                      >
                        {course.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {/* Progress */}
                    <div className="mb-5">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[var(--text-muted)] dark:text-white/50">
                          Progress
                        </span>
                        <span className="text-[var(--text-primary)] dark:text-white/70">
                          {course.completion_percentage || 0}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--border-color)] dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getProgressColor(
                            course.completion_percentage
                          )}`}
                          style={{ width: `${course.completion_percentage || 0}%` }}
                        />
                      </div>
                    </div>
                    {/* Dates */}
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)] dark:text-white/40 mb-5">
                      <span>{new Date(course.start_date).toLocaleDateString()}</span>
                      <span>{new Date(course.end_date).toLocaleDateString()}</span>
                    </div>
                    {/* CTA */}
                    <Link
                      to={`/courses/${course.id}/modules`}
                      className="
                        mt-auto inline-flex items-center justify-center gap-2
                        rounded-xl
                        border border-[var(--border-color)] dark:border-white/15
                        py-2 text-sm font-medium
                        text-[var(--text-primary)] dark:text-white/80
                        transition
                        hover:border-[var(--border-subtle)] dark:hover:border-white/30
                        hover:text-[var(--text-secondary)] dark:hover:text-white
                      "
                    >
                      Resume
                      <FaArrowRight className="w-3.5 h-3.5 opacity-70" />
                    </Link>
                  </article>
                ))
              ) : (
                <div className="
                  col-span-full rounded-2xl
                  border border-[var(--border-color)] dark:border-white/10
                  bg-white dark:bg-white/[0.03]
                  py-12 text-center
                ">
                  <p className="text-sm text-[var(--text-muted)] dark:text-white/50 mb-2">
                    You haven’t enrolled in any courses yet
                  </p>
                  <Link
                    to="/courses"
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Explore courses →
                  </Link>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;