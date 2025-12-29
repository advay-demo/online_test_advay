import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import { useTeacherDashboardStore } from '../../store/teacherDashboardStore';

const DashboardTeachers = () => {
  const {
    dashboardData,
    loading,
    error,
    loadDashboard,
  } = useTeacherDashboardStore();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Stats config for UI
  const stats = [
    {
      label: 'Total Courses',
      value: dashboardData?.total_courses ?? 0,
      change: '+12.5%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13M3 6.253C4.168 5.477 5.754 5 7.5 5S10.832 5.477 12 6.253M12 6.253C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253M3 19.253C4.168 18.477 5.754 18 7.5 18S10.832 18.477 12 19.253M12 19.253C13.168 18.477 14.754 18 16.5 18S19.832 18.477 21 19.253" />
        </svg>
      ),
      color: 'rgb(234, 179, 8)',
    },
    {
      label: 'Active Courses',
      value: dashboardData?.active_courses ?? 0,
      change: '+8.2%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'rgb(34, 197, 94)',
    },
    {
      label: 'Students',
      value: dashboardData?.total_students ?? 0,
      change: '+5.1%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'rgb(59, 130, 246)',
    },
    {
      label: 'Avg. Completion',
      value: `${dashboardData?.avg_completion ?? 0}%`,
      change: '-2.3%',
      isNegative: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'rgb(249, 115, 22)',
    },
  ];

  // Loading and error states
  if (loading) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        <TeacherSidebar />
        <main className="flex-1">
          <Header isAuth />
          <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        <TeacherSidebar />
        <main className="flex-1">
          <Header isAuth />
          <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 mb-4">
                {error || 'Failed to load dashboard'}
              </div>
              <button
                onClick={loadDashboard}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Use dashboardData for events, students, courses, etc.
  const recentEvents = dashboardData.upcoming_quizzes || [];
  const topStudents = dashboardData.top_students || [];
  const courses = dashboardData.recent_courses || [];

  return (
    <div className="flex min-h-screen relative grid-texture">
      <TeacherSidebar />
      <main className="flex-1 w-full lg:w-auto">
        <Header isAuth />
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
              <p className="muted text-sm">
                Welcome back, {dashboardData.teacher_name || 'Teacher'}! Here&apos;s what&apos;s happening with your courses and quizzes
              </p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-3">
              <button className="px-3 sm:px-5 py-2.5 rounded-lg border border-[var(--border-color)] text-sm font-medium hover:bg-[var(--input-bg)] transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden lg:inline">Create Demo Course</span>
                <span className="lg:hidden">Demo Course</span>
              </button>
              <Link
                to="/teacher/add-course"
                className="bg-blue-600 px-3 sm:px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden lg:inline">Create New Course</span>
                <span className="lg:hidden">New Course</span>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="card-strong p-5 sm:p-6 rounded-2xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="muted text-xs sm:text-sm mb-2">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold mb-2">{stat.value}</p>
                    <p className={`text-xs sm:text-sm font-medium ${stat.isNegative ? 'text-red-400' : 'text-green-400'}`}>
                      {stat.change}
                    </p>
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

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {/* Recent Events */}
            <div className="lg:col-span-2 card-strong p-5 sm:p-6 rounded-2xl">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-1">Recent Events</h2>
                <p className="text-xs sm:text-sm muted">Manage your upcoming and active quiz events</p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {recentEvents.length > 0 ? recentEvents.map((event, index) => (
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
                          <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{event.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm muted">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {event.course_name}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" />
                              </svg>
                              {event.module_name}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/teacher/courses/${event.id}/manage`}
                        className="w-full sm:w-auto border border-[var(--border-color)] px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-[var(--input-bg)] transition whitespace-nowrap"
                      >
                        Manage
                      </Link>
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
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-1">Top Students</h2>
                <p className="text-xs sm:text-sm muted">Students with highest quiz scores</p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {topStudents.length > 0 ? topStudents.map((student, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div className="text-base sm:text-lg font-bold muted w-5 sm:w-6">{index + 1}</div>
                    <img
                      src={`https://ui-avatars.com/api/?name=${student.name}&background=random&color=fff&size=128`}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                      alt={student.name}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate">{student.name}</div>
                      <div className="text-xs muted truncate">{student.subject}</div>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400 font-bold text-xs sm:text-sm">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {student.score}
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted py-4">
                    No student data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div className="card-strong p-5 sm:p-6 rounded-2xl">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Courses</h2>
              <p className="text-xs sm:text-sm muted">Your recently created courses</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {courses.length > 0 ? courses.map((course, index) => (
                <Link
                  key={course.id}
                  to={`/teacher/courses/${course.id}/manage`}
                  className="card p-4 sm:p-5 rounded-xl hover:scale-[1.02] transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <h3 className="font-bold text-sm sm:text-base flex-1 pr-2 line-clamp-2">{course.name}</h3>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${course.active
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {course.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs muted mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {course.modules_count} modules
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" />
                      </svg>
                      {course.students_count} students
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="muted">Completion Rate</span>
                      <span className="font-semibold">{course.completion_rate ?? 0}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${course.completion_rate ?? 0}%` }}></div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-4 card p-6 text-center text-muted">
                  <p>No courses yet. Create your first course!</p>
                </div>
              )}
              {/* Create New Course Card */}
              <Link
                to="/teacher/add-course"
                className="card p-4 sm:p-5 rounded-xl hover:scale-[1.02] transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[200px] cursor-pointer group"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[var(--input-bg)] border-2 border-dashed border-[var(--border-color)] flex items-center justify-center mb-3 sm:mb-4 group-hover:border-[var(--border-subtle)] transition">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Create New Course</h3>
                <p className="text-xs muted">Add details, set time limits and more</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardTeachers;