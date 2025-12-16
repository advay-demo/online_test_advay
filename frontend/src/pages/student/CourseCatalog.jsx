import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaUsers, FaClock, FaCode } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { fetchCourseCatalog, enrollInCourse } from '../../api/api';
import { useAuthStore } from '../../store/authStore';

const CourseCatalog = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState('all');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  useEffect(() => {
    loadCourses();
  }, [enrollmentStatus]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await fetchCourseCatalog({ enrollment_status: enrollmentStatus });
      setCourses(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourseId(courseId);
      await enrollInCourse(courseId);
      // Reload courses to update enrollment status
      await loadCourses();
      // Navigate to course modules
      navigate(`/courses/${courseId}/modules`);
    } catch (err) {
      console.error('Failed to enroll:', err);
      alert('Failed to enroll in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        <Sidebar />
        <main className="flex-1">
          <Header isAuth />
          <div className="p-8 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading courses...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 mb-6">
              {error}
            </div>
          )}

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
                <button 
                  onClick={() => setEnrollmentStatus('all')}
                  className={enrollmentStatus === 'all' ? "bg-gradient-to-r from-[var(--grad-1)] to-[var(--grad-2)] text-white px-6 py-2 rounded-full font-semibold" : "bg-white/[0.02] text-soft px-5 py-2 rounded-full hover:bg-white/[0.05] transition"}
                >
                  All Courses
                </button>
                <button 
                  onClick={() => setEnrollmentStatus('enrolled')}
                  className={enrollmentStatus === 'enrolled' ? "bg-gradient-to-r from-[var(--grad-1)] to-[var(--grad-2)] text-white px-6 py-2 rounded-full font-semibold" : "bg-white/[0.02] text-soft px-5 py-2 rounded-full hover:bg-white/[0.05] transition"}
                >
                  Enrolled
                </button>
                <button 
                  onClick={() => setEnrollmentStatus('completed')}
                  className={enrollmentStatus === 'completed' ? "bg-gradient-to-r from-[var(--grad-1)] to-[var(--grad-2)] text-white px-6 py-2 rounded-full font-semibold" : "bg-white/[0.02] text-soft px-5 py-2 rounded-full hover:bg-white/[0.05] transition"}
                >
                  Completed
                </button>
              </div>

              {/* Course Cards Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {courses && courses.length > 0 ? (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className="card overflow-hidden transition hover:scale-[1.01] block"
                    >
                      {/* Minimal Dark Header */}
                      <div className="bg-gradient-to-b from-white/[0.02] to-black/[0.06] border-b border-white/[0.03] h-44 flex items-center justify-center relative">
                        <div className="absolute top-4 right-4 bg-white/[0.06] text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {course.level}
                        </div>
                        <div className="text-center">
                          <FaCode className="w-20 h-20 text-indigo-400 mx-auto mb-2" />
                          <p className="text-xs text-white/80 font-medium truncate max-w-xs px-4">{course.name}</p>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2 text-white">{course.name}</h3>
                        <p className="muted text-sm mb-4">{course.instructor}</p>

                        <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
                          <div className="flex items-center gap-1">
                            <FaStar className="w-4 h-4 text-yellow-400" />
                            <span className="font-semibold">{course.rating}</span>
                          </div>

                          <div className="flex items-center gap-1 muted">
                            <FaUsers className="w-4 h-4" />
                            <span>{course.students_count}</span>
                          </div>

                          <div className="flex items-center gap-1 muted">
                            <FaClock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                        </div>

                        {course.is_enrolled && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="muted">Progress</span>
                              <span className="font-semibold">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-white/6 rounded-full h-2">
                              <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${course.progress}%` }}></div>
                            </div>
                          </div>
                        )}

                        {course.is_enrolled ? (
                          <Link
                            to={`/courses/${course.id}/modules`}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                          >
                            View Course
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollingCourseId === course.id}
                            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll Now'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-gray-400">
                    <p>No courses found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseCatalog;