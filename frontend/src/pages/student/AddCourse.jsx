import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaSearch, FaTimes, FaBook, FaSpinner, FaCheckCircle, 
  FaInfoCircle, FaUser, FaCalendarAlt, FaExclamationTriangle,
  FaBan, FaHourglassHalf
} from 'react-icons/fa';
import { AiOutlineClockCircle, AiOutlineBarChart } from 'react-icons/ai';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import CourseActionButtons from '../../components/student/CourseActionButtons';
import useCourseStore from '../../store/student/courseStore';
import toast from 'react-hot-toast';

const AddNewCourseStudent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  
  const { 
    newCourses, 
    loading, 
    error, 
    enrollmentLoading,
    enrollmentError,
    enrollmentSuccess,
    fetchAvailableCourses,
    requestEnrollment,
    selfEnroll,
    clearEnrollmentMessages
  } = useCourseStore();

  // Load all available courses on mount
  useEffect(() => {
    fetchAvailableCourses();
  }, [fetchAvailableCourses]);

  // Frontend search: filter newCourses by name or code
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return newCourses;
    const term = searchTerm.toLowerCase().trim();
    return newCourses.filter((item) => {
      const course = item.data;
      const name = (course.name || '').toLowerCase();
      const code = (course.code || '').toLowerCase();
      return name.includes(term) || code.includes(term);
    });
  }, [newCourses, searchTerm]);

  const handleEnroll = async (course) => {
    clearEnrollmentMessages();
    
    let result;
    
    // Determine the enrollment type based on status
    if (course.enrollment_status === 'can_enroll_open') {
      // Self-enrollment
      result = await selfEnroll(course.id);
    } else if (course.enrollment_status === 'can_enroll_request') {
      // Request enrollment
      result = await requestEnrollment(course.id);
    } else {
      toast.error('Enrollment is not available for this course');
      return;
    }

    // Handle result
    if (result.success) {
      toast.success(result.data.message);
      // Refresh the available courses list
      setTimeout(() => {
        fetchAvailableCourses();
      }, 1000);
    } else {
      toast.error(result.error);
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

  // Function to render enrollment button/badge based on status
  const renderEnrollmentAction = (course) => {
    const courseStatus = course.enrollment_status;

    switch (courseStatus) {
      case 'enrolled':
        return (
          <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-green-600/20 text-green-400 border border-green-500/30 text-sm font-semibold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 flex-shrink-0">
            <FaCheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Enrolled</span>
          </div>
        );

      case 'request_pending':
        return (
          <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 text-sm font-semibold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 flex-shrink-0">
            <FaHourglassHalf className="w-4 h-4" />
            <span className="hidden sm:inline">Request Pending</span>
          </div>
        );

      case 'request_rejected':
        return (
          <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-red-600/20 text-red-400 border border-red-500/30 text-sm font-semibold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 flex-shrink-0">
            <FaBan className="w-4 h-4" />
            <span className="hidden sm:inline">Request Rejected</span>
          </div>
        );

      case 'can_enroll_open':
        return (
          <button
            onClick={() => handleEnroll(course)}
            disabled={enrollmentLoading}
            className="px-3 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg sm:rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
          >
            {enrollmentLoading ? (
              <>
                <FaSpinner className="animate-spin w-4 h-4" />
                <span className="hidden sm:inline">Enrolling...</span>
              </>
            ) : (
              <>
                <FaCheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Enroll Now</span>
              </>
            )}
          </button>
        );

      case 'can_enroll_request':
        return (
          <button
            onClick={() => handleEnroll(course)}
            disabled={enrollmentLoading}
            className="px-3 sm:px-6 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg sm:rounded-xl shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
          >
            {enrollmentLoading ? (
              <>
                <FaSpinner className="animate-spin w-4 h-4" />
                <span className="hidden sm:inline">Requesting...</span>
              </>
            ) : (
              <>
                <FaHourglassHalf className="w-4 h-4" />
                <span className="hidden sm:inline">Request Enrollment</span>
              </>
            )}
          </button>
        );

      case 'no_enrollment_allowed':
        return (
          <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-gray-600/20 text-gray-400 border border-gray-500/30 text-sm font-semibold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 flex-shrink-0">
            <FaBan className="w-4 h-4" />
            <span className="hidden sm:inline">Enrollment Closed</span>
          </div>
        );

      case 'inactive_course':
        return (
          <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-red-600/20 text-red-400 border border-red-500/30 text-sm font-semibold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 flex-shrink-0">
            <FaExclamationTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Inactive Course</span>
          </div>
        );

      default:
        return (
          <button
            onClick={() => handleEnroll(course)}
            disabled={enrollmentLoading}
            className="px-3 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg sm:rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
          >
            {enrollmentLoading ? (
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
        );
    }
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
              <h2 className="text-lg sm:text-xl font-bold mb-1">Available Courses</h2>
              <p className="text-xs sm:text-sm muted">Browse and enroll in new courses</p> 

              <div className="relative mt-4">
                <input
                  type="text"
                  className="input input-bordered w-full pl-10 pr-10 py-2.5 text-sm focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Search by course name or code..."
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

              {/* Enrollment Success/Error Messages */}
              {enrollmentSuccess && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-fade-in">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-200">{enrollmentSuccess}</p>
                  </div>
                </div>
              )}

              {enrollmentError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-200">{enrollmentError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500"></div>
                  <FaBook className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 text-xl" />
                </div>
                <p className="mt-4 text-sm muted">Loading available courses...</p>
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

            {/* Empty State - No courses available */}
            {!loading && !error && filteredCourses.length === 0 && !searchTerm && newCourses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 p-6 bg-blue-500/10 rounded-full">
                  <FaBook className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Courses Available</h3>
                <p className="text-sm muted max-w-md">
                  There are no new courses available at the moment. Check back later!
                </p>
              </div>
            )}

            {/* Empty State - No search results */}
            {!loading && !error && filteredCourses.length === 0 && searchTerm && (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                <div className="mb-4 p-6 bg-orange-500/10 rounded-full">
                  <FaSearch className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Matching Courses</h3>
                <p className="text-sm muted max-w-md mb-4">
                  No courses match "<span className="font-semibold text-white">{searchTerm}</span>".
                  Try a different search term.
                </p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="btn btn-info px-6 py-2"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Course Results */}
            {!loading && !error && filteredCourses.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="mb-4">
                  <p className="text-sm muted">
                    Showing {filteredCourses.length} course{filteredCourses.length > 1 ? 's' : ''}
                    {searchTerm && <span> matching "<span className="font-semibold text-white">{searchTerm}</span>"</span>}
                  </p>
                </div>
                
                {filteredCourses.map((item) => {
                  const course = item.data;
                  const isExpanded = expandedCourse === course.id;
                  
                  return (
                    <div
                      key={course.id}
                      className="card p-4 sm:p-6 hover:bg-white/[0.02] transition-all duration-300 group border-l-4 border-blue-500"
                    >
                      {/* Course Header and Enrollment Action */}
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
                            </div>
                            {course.code && (
                              <p className="text-xs sm:text-sm muted mb-2 sm:mb-3 line-clamp-2">
                                Code: {course.code}
                              </p>
                            )}
                          </div>
                        </div>
                      
                        {/* Dynamic Enrollment Action */}
                        {renderEnrollmentAction(course)}
                      </div>

                      {/* Course Metadata */}
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