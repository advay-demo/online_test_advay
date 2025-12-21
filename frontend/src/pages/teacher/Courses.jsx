import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaBook, FaClock, FaUserFriends, FaEllipsisV } from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import CourseActionButtons from '../../components/teacher/CourseActionButtons';
import { fetchTeacherCourses } from '../../api/api';

const Courses = () => {
    const [activeTab, setActiveTab] = useState('All Quizzes');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCourses();
        // eslint-disable-next-line
    }, [activeTab, searchQuery]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const status = activeTab === 'All Quizzes' ? 'all' : activeTab.toLowerCase();
            const data = await fetchTeacherCourses(status, searchQuery);
            setCourses(data);
            setError(null);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchQuery(e.target.value);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Inactive':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'Draft':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="flex min-h-screen relative grid-texture">
            <TeacherSidebar />
            <main className="flex-1 w-full lg:w-auto">
                <Header isAuth />
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Page Header */}
                    <div className="mb-6 lg:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Courses</h1>
                        <p className="text-sm muted">Create, manage and analyze your courses</p>
                    </div>

                    {/* Action Buttons */}
                    <CourseActionButtons activeButton="library" />

                    {/* Course Library Section */}
                    <div className="card-strong p-4 sm:p-5 lg:p-6 min-h-[600px]">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold mb-1">Course Library</h2>
                            <p className="text-xs sm:text-sm muted">Browse and manage all your courses</p>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 mb-6">
                            <div className="flex bg-black/20 p-1 rounded-lg overflow-x-auto scrollbar-hide">
                                {['All Quizzes', 'Active', 'Drafts'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                            activeTab === tab
                                                ? 'bg-white/10 text-white shadow-sm'
                                                : 'text-muted hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-3.5 h-3.5 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        className="w-full pl-9 pr-3 sm:pr-4 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                </div>
                                <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/5 transition-all duration-200 whitespace-nowrap">
                                    <FaFilter className="w-3 h-3" />
                                    <span className="hidden sm:inline">Filter</span>
                                    <span className="sm:hidden">Filter</span>
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-center">
                                {error}
                            </div>
                        )}

                        {/* Course List */}
                        {!loading && !error && (
                            <div className="space-y-3 sm:space-y-4">
                                {courses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-lg muted">No courses found</p>
                                    </div>
                                ) : (
                                    courses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="card p-4 sm:p-5 hover:bg-white/[0.02] transition-all duration-200 group"
                                        >
                                            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                                {/* Icon */}
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:border-blue-500/30 transition-all duration-200">
                                                    <FaBook className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                                                </div>
                                                {/* Content */}
                                                <div className="flex-1 min-w-0 w-full">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-base sm:text-lg line-clamp-1 group-hover:text-blue-400 transition-colors duration-200">
                                                            {course.name}
                                                        </h3>
                                                        <span
                                                            className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(
                                                                course.status
                                                            )} uppercase font-bold tracking-wider whitespace-nowrap flex-shrink-0 transition-all duration-200`}
                                                        >
                                                            {course.status}
                                                        </span>
                                                    </div>
                                                    {course.code && (
                                                        <p className="text-xs sm:text-sm muted mb-2 sm:mb-3 line-clamp-2">Code: {course.code}</p>
                                                    )}
                                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs muted">
                                                        <div className="flex items-center gap-1.5">
                                                            <FaBook className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                                            <span>{course.modules_count} modules</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <FaUserFriends className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                                            <span>{course.students_count} students</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>{course.completions} completions</span>
                                                        </div>
                                                        {course.created_on && (
                                                            <>
                                                                <div className="hidden sm:block text-white/20">|</div>
                                                                <div>{new Date(course.created_on).toLocaleDateString()}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:self-start">
                                                    <Link
                                                        to={`/teacher/courses/${course.id}/manage`}
                                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-[var(--border-color)] rounded-lg text-xs sm:text-sm font-medium hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-center whitespace-nowrap"
                                                    >
                                                        Manage
                                                    </Link>
                                                    <button className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                                        <FaEllipsisV className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Courses;