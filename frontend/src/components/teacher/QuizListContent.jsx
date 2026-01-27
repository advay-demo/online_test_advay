import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaCalendar,
    FaClock,
    FaUsers,
    FaCheckCircle,
    FaBook,
    FaTrophy,
    FaDumbbell,
    FaChartLine,
    FaChevronDown,
    FaChevronUp,
    FaEye,
    FaEllipsisV
} from 'react-icons/fa';

const QuizListContent = ({
    courses,
    loading,
    error,
    filteredCourses,
    activeFilter,
    searchQuery,
    expandedCourseId,
    openMenuId,
    totalQuizzes,
    totalExercises,
    totalActive,
    loadQuizzes,
    toggleCourseDetails,
    toggleMenu,
    getQuizTypeIcon,
    getQuizTypeColor,
    onGradeClick,
    onMonitorClick

}) => {
    return (
        <>
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="card p-3 sm:p-4 hover:bg-white/[0.02] transition-all duration-200 group">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/30 transition-all flex-shrink-0">
                            <FaTrophy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs muted mb-0.5 sm:mb-1">Total Quizzes</p>
                            <p className="text-xl sm:text-2xl font-bold truncate">{totalQuizzes}</p>
                        </div>
                    </div>
                </div>

                

                <div className="card p-3 sm:p-4 hover:bg-white/[0.02] transition-all duration-200 group xs:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:border-green-500/30 transition-all flex-shrink-0">
                            <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs muted mb-0.5 sm:mb-1">Active</p>
                            <p className="text-xl sm:text-2xl font-bold truncate">{totalActive}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notice Banner - Responsive */}
            {courses.length > 0 && !loading && (
                <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 lg:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs lg:text-sm text-blue-400 font-medium mb-0.5 sm:mb-1">
                                📚 Showing {courses.length} course{courses.length !== 1 ? 's' : ''} with quizzes or exercises
                            </p>
                            <p className="text-[9px] sm:text-[10px] lg:text-xs text-blue-400/80">
                                Courses without any quizzes or exercises are not displayed here.{' '}
                                <Link to="/teacher/courses" className="underline hover:text-blue-300 font-medium">
                                    View all courses →
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Card */}
            <div className="card-strong p-3 sm:p-4 lg:p-6 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
                <div className="mb-3 sm:mb-4 lg:mb-6">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1">All Quizzes & Exercises</h2>
                    <p className="text-[10px] sm:text-xs lg:text-sm muted">Browse and manage all assessments across courses</p>
                </div>

                {error ? (
                    <div className="card p-4 sm:p-6 border-red-500/30 text-center">
                        <p className="text-sm sm:text-base text-red-400 mb-3 sm:mb-4">{error}</p>
                        <button
                            onClick={loadQuizzes}
                            className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-xs sm:text-sm"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                        {filteredCourses.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    {activeFilter === 'quiz' ? (
                                        <FaTrophy className="w-6 h-6 sm:w-8 sm:h-8 text-muted" />
                                    ) : activeFilter === 'exercise' ? (
                                        <FaDumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-muted" />
                                    ) : (
                                        <FaBook className="w-6 h-6 sm:w-8 sm:h-8 text-muted" />
                                    )}
                                </div>
                                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">
                                    {searchQuery ? 'No matches found' :
                                        activeFilter === 'quiz' ? 'No quizzes found' :
                                            activeFilter === 'exercise' ? 'No exercises found' :
                                                'No quizzes or exercises found'}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted mb-4 sm:mb-6 px-4">
                                    {searchQuery ? 'Try adjusting your search terms' :
                                        'Create your first quiz or exercise in a course'}
                                </p>
                                <Link
                                    to="/teacher/courses"
                                    className="inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition active:scale-95 text-xs sm:text-sm font-medium"
                                >
                                    Go to Courses
                                </Link>
                            </div>
                        ) : (
                            filteredCourses.map((course) => {
                                const isExpanded = expandedCourseId === course.course_id;
                                const quizCount = course.quizzes.filter(q => !q.is_exercise).length;
                                const exerciseCount = course.quizzes.filter(q => q.is_exercise).length;

                                return (
                                    <div key={course.course_id}>
                                        <div className="card p-3 sm:p-4 lg:p-5 hover:bg-white/[0.02] transition-all duration-200 group">
                                            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                                {/* Icon - Hidden on mobile, visible on sm+ */}
                                                <div className="hidden sm:flex w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-blue-500/10 items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:border-blue-500/30 transition-all duration-200">
                                                    <FaBook className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0 w-full">
                                                    <div className="flex items-start gap-2 mb-1 sm:mb-2">
                                                        {/* Icon - Visible only on mobile */}
                                                        <div className="sm:hidden w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                                                            <FaBook className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold line-clamp-2 sm:line-clamp-1 group-hover:text-blue-400 transition-colors duration-200">
                                                                {course.course_name}
                                                            </h3>
                                                            
                                                        </div>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 text-[10px] sm:text-xs muted mt-2">
                                                        <div className="flex items-center gap-1 sm:gap-1.5">
                                                            <FaTrophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 flex-shrink-0" />
                                                            <span>{quizCount} quiz{quizCount !== 1 ? 'zes' : ''} & exercise{quizCount !== 1 ? 's' : ''}</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1 sm:gap-1.5">
                                                            <FaBook className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 flex-shrink-0" />
                                                            <span>{course.quizzes.length} total</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 w-full sm:w-auto sm:self-start flex-shrink-0">
                                                    <button
                                                        onClick={() => toggleCourseDetails(course.course_id)}
                                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 border border-[var(--border-color)] rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-center whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2"
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <span className="hidden sm:inline">Hide Details</span>
                                                                <span className="sm:hidden">Hide</span>
                                                                <FaChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>Details</span>
                                                                <FaChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* Three Dot Menu */}
                                                    <div className="relative menu-container">
                                                        <button
                                                            onClick={(e) => toggleMenu(course.course_id, e)}
                                                            className="p-1.5 sm:p-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                            aria-label="Course Actions"
                                                        >
                                                            <FaEllipsisV className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                                                        </button>

                                                        {openMenuId === course.course_id && (
                                                            <div className="absolute right-0 mt-2 z-50 w-44 sm:w-48 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 animate-fadeIn">
                                                                <Link
                                                                    to={`/teacher/courses/${course.course_id}/manage`}
                                                                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-white/5 transition-colors"
                                                                    onClick={() => toggleMenu(null)}
                                                                >
                                                                    <FaChartLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                                                                    <span>Manage Course</span>
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quiz Details Dropdown */}
                                        {isExpanded && (
                                            <div className="mt-2 border-t border-[var(--border-color)] bg-[var(--surface)] rounded-lg overflow-hidden animate-slideDown">
                                                <div className="p-3 sm:p-4 lg:p-5">
                                                    <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span>
                                                        Quizzes & Exercises ({course.quizzes.length})
                                                    </h4>

                                                    <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                                                        {course.quizzes.length === 0 ? (
                                                            <div className="text-center py-6 sm:py-8">
                                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                                                    <FaBook className="w-5 h-5 sm:w-6 sm:h-6 text-muted" />
                                                                </div>
                                                                <p className="text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-2 font-medium">No quizzes or exercises yet</p>
                                                                <Link
                                                                    to={`/teacher/courses/${course.course_id}/manage`}
                                                                    className="text-[10px] sm:text-xs text-blue-400 hover:text-blue-300"
                                                                >
                                                                    Add quizzes in course management →
                                                                </Link>
                                                            </div>
                                                        ) : (
                                                            <ul className="space-y-2 sm:space-y-3">
    {course.quizzes.map((quiz) => {
        const TypeIcon = getQuizTypeIcon(quiz.is_exercise);
        const typeColor = getQuizTypeColor(quiz.is_exercise);

        return (
            <li
                key={quiz.id}
                className="bg-white/5 border border-blue-100/20 rounded-lg p-2.5 sm:p-3 hover:bg-white/10 transition-all duration-200 group"
            >
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-${typeColor}-500/10 border border-${typeColor}-500/20 flex-shrink-0`}>
                        <TypeIcon className={`w-3 h-3 sm:w-4 sm:h-4 text-${typeColor}-400`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] sm:text-[10px] font-medium text-blue-400 mb-0.5 sm:mb-1">
                                    {quiz.module_name}
                                </div>
                                <h5 className="text-xs sm:text-sm font-semibold text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                                    {quiz.name}
                                </h5>
                            </div>
                            <div className={`
                                px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0
                                ${quiz.active
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                }
                            `}>
                                {quiz.active ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400 mb-2 sm:mb-3">
                            <span className="flex items-center gap-1">
                                <FaUsers className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {quiz.attempts || 0} attempts
                            </span>
                            <span className="flex items-center gap-1">
                                <FaCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">{new Date(quiz.start_date).toLocaleDateString()}</span>
                                <span className="sm:hidden">{new Date(quiz.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </span>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                            <Link
                                to={`/teacher/courses/${course.course_id}/manage`}
                                className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <FaEye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                View in Course
                            </Link>
                            <div className="flex gap-2">
                                <Link
                                    to="#"
                                    onClick={() => onMonitorClick(quiz, course)}
                                    className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-sm hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all duration-150"
                                    style={{ boxShadow: '0 2px 8px 0 rgba(168,85,247,0.10)' }}
                                >
                                    <FaChartLine className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Monitor
                                </Link>
                                <Link
                                    to="#"
                                    onClick={e => { e.preventDefault(); onGradeClick(quiz, course); }}
                                    className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-lg bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white shadow-sm hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all duration-150"
                                    style={{ boxShadow: '0 2px 8px 0 rgba(34,197,94,0.10)' }}
                                >
                                    <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Grade
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        );
    })}
</ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    );
};

export default QuizListContent;