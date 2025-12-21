import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import { fetchTeacherDashboard } from '../../api/api';

const DashboardTeachers = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await fetchTeacherDashboard();
            setDashboardData(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="flex min-h-screen relative grid-texture">
            <TeacherSidebar />

            <main className="flex-1">
                <Header isAuth />

                <div className="p-8">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                            <p className="muted text-sm">
                                Welcome back, Sarah! Here's what's happening with your courses and
                                quizzes
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="px-5 py-2.5 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 transition flex items-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Create Demo Course
                            </button>
                            <Link
                                to="/teacher/add-course"
                                className="bg-blue-600 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Create New Course
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Courses */}
                        <div className="card p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="muted text-sm mb-1">Total Courses</p>
                                    <p className="text-3xl font-bold">{dashboardData.total_courses || 0}</p>
                                    <p className="text-sm text-green-400 mt-1">{dashboardData.active_courses || 0} active</p>
                                </div>
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: 'rgba(234,179,8,0.15)',
                                        border: '1px solid rgba(234,179,8,0.2)',
                                    }}
                                >
                                    <svg
                                        className="w-6 h-6 text-yellow-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6.253v13M3 6.253C4.168 5.477 5.754 5 7.5 5S10.832 5.477 12 6.253M12 6.253C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253M3 19.253C4.168 18.477 5.754 18 7.5 18S10.832 18.477 12 19.253M12 19.253C13.168 18.477 14.754 18 16.5 18S19.832 18.477 21 19.253"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Active Events */}
                        <div className="card p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="muted text-sm mb-1">Active Courses</p>
                                    <p className="text-3xl font-bold">{dashboardData.active_courses || 0}</p>
                                    <p className="text-sm text-green-400 mt-1">Currently active</p>
                                </div>
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: 'rgba(34,197,94,0.15)',
                                        border: '1px solid rgba(34,197,94,0.2)',
                                    }}
                                >
                                    <svg
                                        className="w-6 h-6 text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Students */}
                        <div className="card p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="muted text-sm mb-1">Students</p>
                                    <p className="text-3xl font-bold">{dashboardData.total_students || 0}</p>
                                    <p className="text-sm text-green-400 mt-1">Total enrolled</p>
                                </div>
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: 'rgba(59,130,246,0.15)',
                                        border: '1px solid rgba(59,130,246,0.2)',
                                    }}
                                >
                                    <svg
                                        className="w-6 h-6 text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Avg. Completion */}
                        <div className="card p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="muted text-sm mb-1">Avg. Completion</p>
                                    <p className="text-3xl font-bold">{dashboardData.avg_completion || 0}%</p>
                                    <p className="text-sm text-green-400 mt-1">Completion rate</p>
                                </div>
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: 'rgba(249,115,22,0.15)',
                                        border: '1px solid rgba(249,115,22,0.2)',
                                    }}
                                >
                                    <svg
                                        className="w-6 h-6 text-orange-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Recent Events - Takes 2 columns */}
                        <div className="lg:col-span-2 card-strong p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-1">Recent Events</h2>
                                <p className="text-sm muted">
                                    Manage your upcoming and active quiz events
                                </p>
                            </div>

                            <div className="space-y-4">
                                {dashboardData.upcoming_quizzes && dashboardData.upcoming_quizzes.length > 0 ? (
                                    dashboardData.upcoming_quizzes.map((quiz, index) => (
                                        <div key={index} className="card p-5">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-4 flex-1">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                        style={{
                                                            background: 'rgba(34,197,94,0.15)',
                                                            border: '1px solid rgba(34,197,94,0.2)',
                                                        }}
                                                    >
                                                        <svg
                                                            className="w-6 h-6 text-green-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg mb-1">
                                                            {quiz.name}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-sm muted">
                                                            <div className="flex items-center gap-1">
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth="1.5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                                    />
                                                                </svg>
                                                                {quiz.course_name}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth="1.5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                    />
                                                                </svg>
                                                                {quiz.module_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/teacher/courses/${quiz.id}/manage`}
                                                    className="border border-white/10 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/5 transition"
                                                >
                                                    Manage
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="card p-5 text-center text-muted">
                                        <p>No upcoming quizzes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Students */}
                        <div className="card-strong p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-1">Top Students</h2>
                                <p className="text-sm muted">Students with highest quiz scores</p>
                            </div>

                            <div className="space-y-4">
                                {dashboardData.top_students && dashboardData.top_students.length > 0 ? (
                                    dashboardData.top_students.map((student, index) => (
                                        <div key={student.id} className="flex items-center gap-3">
                                            <div className="text-lg font-bold muted w-6">{index + 1}</div>
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${student.name}&background=random&color=fff&size=128`}
                                                className="w-10 h-10 rounded-full"
                                                alt={student.name}
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold">{student.name}</div>
                                                <div className="text-xs muted">{student.subject}</div>
                                            </div>
                                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                {student.score}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        No student data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Courses Section */}
                    <div className="mt-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-1">Courses</h2>
                            <p className="text-sm muted">Your recently created courses</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {dashboardData.recent_courses && dashboardData.recent_courses.length > 0 ? (
                                dashboardData.recent_courses.map((course) => (
                                    <Link
                                        key={course.id}
                                        to={`/teacher/courses/${course.id}/manage`}
                                        className="card p-6 hover:scale-[1.02] transition-all duration-200"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg">{course.name}</h3>
                                            <div className={`px-2 py-1 rounded text-xs font-semibold ${course.active
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}>
                                                {course.active ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm muted mb-4">
                                            <div className="flex items-center gap-1">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                {course.modules_count} modules
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857"
                                                    />
                                                </svg>
                                                {course.students_count} students
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-4 card p-6 text-center text-muted">
                                    <p>No courses yet. Create your first course!</p>
                                </div>
                            )}

                            {/* Create New Course Card */}
                            <Link
                                to="/teacher/add-course"
                                className="card p-6 hover:scale-[1.02] transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Create New Course</h3>
                                <p className="text-sm muted">Add details, set time limits and more</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardTeachers;
