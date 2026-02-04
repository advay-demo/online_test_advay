import React, { useState } from 'react';
import { FaSearch, FaBook, FaCalendarAlt, FaUser, FaInfoCircle, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { AiOutlineClockCircle, AiOutlineBarChart } from 'react-icons/ai';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import CourseActionButtons from '../../components/student/CourseActionButtons';
import useCourseStore from '../../store/student/courseStore';
import { enrollInCourse } from '../../api/api';


const AddNewCourseStudent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const { newCourses, loading, error, searchCourses, clearSearch } = useCourseStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchCourses(searchTerm.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    clearSearch();
  };

  const handleEnroll = async (courseId, courseName) => {
    try {
      setEnrollingCourseId(courseId);
      await enrollInCourse(courseId);
      
      // Remove the enrolled course from the list
      setTimeout(() => {
        clearSearch();
        setEnrollingCourseId(null);
      }, 1000);
    } catch (err) {
     
      setEnrollingCourseId(null);
    }
  };

  const toggleCourseDetails = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    };

  return (
    <div className="flex min-h-screen relative grid-texture">
      <Sidebar />
      <main className="flex-1 w-full lg:w-auto">
        <Header isAuth />
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Courses</h1>
            <p className="text-sm muted">Browse, enroll, and manage your learning courses</p>
          </div>

          {/* Action Buttons */}
          <CourseActionButtons activeButton="create" />

          {/* Main Content Card */}
          <div className="card-strong p-4 sm:p-5 lg:p-6 min-h-[500px]">
            {/* Search Section */}
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-bold mb-1">Search for Courses</h2>
              <p className="text-xs sm:text-sm muted">Browse and explore new courses</p> 

              <form className="flex flex-row gap-2 sm:gap-3 mt-4" onSubmit={handleSearch}>
                <div className="relative flex-1">
                    <input
                    type="text"
                    className="input input-bordered w-full pl-10 pr-10 py-2.5 text-sm focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Enter course code (e.g., CS101, 0002)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                    >
                        <FaTimes className="w-3.5 h-3.5" />
                    </button>
                    )}
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <button 
                        type="submit" 
                        disabled={!searchTerm.trim() || loading}
                        className="flex-1 sm:flex-none px-3 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                        <>
                            <FaSpinner className="animate-spin w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Searching...</span>
                        </>
                        ) : (
                        <>
                            <FaSearch className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Search</span>
                        </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleClearSearch}
                        disabled={loading || (newCourses.length === 0 && !searchTerm)}
                        className="flex-1 sm:flex-none px-3 sm:px-6 py-2.5 bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
                    >
                        <FaTimes className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                </div>
            </form>
              
              {/* Search Tips */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-blue-200">
                    <span className="font-semibold">Search Tips:</span> Enter the exact course code to find available courses. 
                    Contact your instructor if you need the course code.
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500"></div>
                  <FaBook className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 text-xl" />
                </div>
                <p className="mt-4 text-sm muted">Searching for courses...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center animate-fade-in">
                <div className="flex items-center justify-center gap-2 text-red-300 mb-2">
                  <FaTimes className="w-5 h-5" />
                  <span className="font-semibold text-lg">Error</span>
                </div>
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Empty State - No Search Yet */}
            {!loading && !error && newCourses.length === 0 && !searchTerm && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 p-6 bg-blue-500/10 rounded-full">
                  <FaSearch className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Start Your Search</h3>
                <p className="text-sm muted max-w-md">
                  Enter a course code above to discover new courses and expand your learning opportunities.
                </p>
              </div>
            )}

            {/* Empty State - No Results Found */}
            {!loading && !error && newCourses.length === 0 && searchTerm && (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                <div className="mb-4 p-6 bg-orange-500/10 rounded-full">
                  <FaBook className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Courses Found</h3>
                <p className="text-sm muted max-w-md mb-4">
                  We couldn't find any courses matching "<span className="font-semibold text-white">{searchTerm}</span>".
                  Please check the course code and try again.
                </p>
                <button 
                  onClick={handleClearSearch}
                  className="btn btn-info px-6 py-2"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Course Results */}
            {!loading && !error && newCourses.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-1">Result :</h3>
                  <p className="text-sm muted">Found {newCourses.length} course{newCourses.length > 1 ? 's' : ''}</p>
                </div>
                
                {newCourses.map((item) => {
                  const course = item.data;
                  const isExpanded = expandedCourse === course.id;
                  const isEnrolling = enrollingCourseId === course.id;
                  
                  return (
                    <div
                        key={course.id}
                        className="card p-4 sm:p-6 hover:bg-white/[0.02] transition-all duration-300 group border-l-4 border-blue-500"
                        >
                        {/* Course Header and Enroll Button */}
                        <div className="flex flex-row items-center justify-between gap-3 sm:gap-4 mb-4">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:border-blue-500/30 transition-all duration-200">
                                <FaBook className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-base sm:text-lg line-clamp-1 group-hover:text-blue-400 transition-colors duration-200">
                                    {course.name}
                                    </h3>
                                    <span className="text-[10px] px-2 py-0.5 rounded border bg-green-500/20 text-green-400 border-green-500/30 uppercase font-bold tracking-wider whitespace-nowrap flex-shrink-0 transition-all duration-200">
                                    Available
                                    </span>
                                </div>
                                {course.code && (
                                    <p className="text-xs sm:text-sm muted mb-2 sm:mb-3 line-clamp-2">
                                    Code: {course.code}
                                    </p>
                                )}
                                </div>
                            </div>
                        
                            {/* Enroll Button */}
                            <button
                                onClick={() => handleEnroll(course.id, course.name)}
                                disabled={isEnrolling}
                                className="px-3 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg sm:rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
                            >
                                {isEnrolling ? (
                                <>
                                    <FaSpinner className="animate-spin w-4 h-4" />
                                    <span className="hidden sm:inline">Enrolling...</span>
                                </>
                                ) : (
                                <>
                                    <FaCheckCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">Enroll</span>
                                </>
                                )}
                            </button>
                        </div>

                        {/* Course Metadata - Separate Section */}
                        <div className="mb-4">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            {course.instructor && (
                                <div className="flex items-center gap-2 text-gray-300">
                                    <FaUser className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                    <span className="truncate">
                                    <span className="font-semibold">Instructor:</span> {course.instructor}
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-gray-300">
                                <FaCalendarAlt className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="truncate">
                                    <span className="font-semibold">Start:</span> {formatDateTime(course.start_date)}
                                </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-300">
                                    <AiOutlineClockCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <span className="truncate">
                                    <span className="font-semibold">End:</span> {formatDateTime(course.end_date)}
                                    </span>
                                </div>
                                
                                {course.modules && (
                                <div className="flex items-center gap-2 text-gray-300">
                                    <FaBook className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-semibold">Modules:</span> {course.modules.length}
                                    </span>
                                </div>
                            )}
                            </div>
                        </div>

                        

                      {/* Course Details Toggle */}
                      <button
                        onClick={() => toggleCourseDetails(course.id)}
                        className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-between mb-3"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Expandable Course Details */}
                      {isExpanded && (
                        <div className="animate-fade-in space-y-4 pt-4 border-t border-white/10">
                          {/* Instructions */}
                          {course.instructions && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <FaInfoCircle className="text-yellow-400" />
                                Course Instructions
                              </h4>
                              <div className="p-3 bg-white/5 rounded-lg text-sm text-gray-300 leading-relaxed">
                                {course.instructions}
                              </div>
                            </div>
                          )}

                          {/* Course Modules */}
                          {course.modules && course.modules.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <FaBook className="text-blue-400" />
                                Course Content ({course.modules.length} Modules)
                              </h4>
                              <div className="space-y-2">
                                {course.modules.map((mod, index) => (
                                  <div
                                    key={mod.id}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center gap-3"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-400">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{mod.name}</p>
                                      {mod.description && (
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{mod.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Progress Info (if applicable) */}
                          {course.completion_percent !== undefined && course.completion_percent > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <AiOutlineBarChart className="text-green-400" />
                                Course Progress
                              </h4>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500 rounded-full"
                                    style={{ width: `${course.completion_percent || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-green-400 whitespace-nowrap">
                                  {course.completion_percent || 0}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddNewCourseStudent;