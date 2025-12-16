import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaClipboardList, FaBook, FaComments, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { fetchCourseModules, fetchModuleDetail } from '../../api/api';

const CourseModule = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourseModules();
  }, [courseId]);

  useEffect(() => {
    if (moduleId) {
      loadModuleDetail();
    }
  }, [moduleId]);

  const loadCourseModules = async () => {
    try {
      setLoading(true);
      const data = await fetchCourseModules(courseId);
      setCourse(data.course);
      setModules(data.modules);
      setError(null);
    } catch (err) {
      console.error('Failed to load course modules:', err);
      setError('Failed to load course modules');
    } finally {
      setLoading(false);
    }
  };

  const loadModuleDetail = async () => {
    try {
      setLoading(true);
      const data = await fetchModuleDetail(moduleId);
      setCurrentModule(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load module detail:', err);
      setError('Failed to load module detail');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'inprogress':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'inprogress':
        return 'In Progress';
      default:
        return 'Not Attempted';
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
              <p className="text-gray-400">Loading course modules...</p>
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
          <div className="p-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
              {error}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If moduleId is provided, show detailed module view
  if (moduleId && currentModule) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        <Sidebar />
        <main className="flex-1">
          <Header isAuth />
          <div className="p-8">
            {/* Breadcrumb */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">{currentModule.name}</h1>
              <p className="text-gray-400 text-sm mt-1">
                <Link to="/courses" className="hover:text-white transition">Courses</Link> /
                <Link to={`/courses/${courseId}/modules`} className="hover:text-white transition"> {course?.name}</Link> /
                <span className="text-white"> {currentModule.name}</span>
              </p>
            </div>

            {/* Module Progress */}
            <div className="card-strong p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Module Progress</h2>
                <span className="text-3xl font-bold text-white">{currentModule.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div className="h-3 rounded-full bg-indigo-500 transition-all" style={{ width: `${currentModule.progress}%` }}></div>
              </div>
            </div>

            {/* Learning Units */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {currentModule.units && currentModule.units.length > 0 ? (
                currentModule.units.map((unit) => (
                  <div
                    key={unit.id}
                    className={`card p-6 hover:scale-[1.02] transition-all duration-200 border-l-4 ${
                      unit.type === 'quiz' ? 'border-indigo-400' : 'border-blue-400'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          unit.type === 'quiz'
                            ? 'bg-indigo-500/15 border border-indigo-500/20'
                            : 'bg-blue-500/15 border border-blue-500/20'
                        }`}
                      >
                        {unit.type === 'quiz' ? (
                          <FaClipboardList className="w-8 h-8 text-indigo-400" />
                        ) : (
                          <FaBook className="w-8 h-8 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">
                          {unit.type === 'quiz' ? unit.quiz?.description : unit.lesson?.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-400 font-medium capitalize">{unit.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 ${getStatusColor(unit.status)} rounded-full`}></div>
                            <span className={`font-medium ${
                              unit.status === 'completed' ? 'text-green-400' :
                              unit.status === 'inprogress' ? 'text-yellow-400' :
                              'text-gray-400'
                            }`}>
                              {getStatusText(unit.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {unit.type === 'quiz' ? (
                      <Link
                        to={`/courses/${courseId}/quizzes/${unit.quiz?.id}`}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                      >
                        {unit.status === 'completed' ? 'Review Quiz' : 'Start Quiz'}
                        <FaArrowRight className="w-5 h-5" />
                      </Link>
                    ) : (
                      <Link
                        to={`/lessons/${unit.lesson?.id}`}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        {unit.status === 'completed' ? 'Review Lesson' : 'Continue Learning'}
                        <FaArrowRight className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  <p>No learning units in this module</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Default: Show all modules for the course
  return (
    <div className="flex min-h-screen relative grid-texture">
      <Sidebar />
      <main className="flex-1">
        <Header isAuth />
        <div className="p-8">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{course?.name || 'Course Modules'}</h1>
            <p className="text-gray-400 text-sm mt-1">
              <Link to="/courses" className="hover:text-white transition">Courses</Link> /
              <span className="text-white"> {course?.name}</span>
            </p>
          </div>

          {/* Course Progress */}
          {course && (
            <div className="card-strong p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Course Progress</h2>
                <span className="text-3xl font-bold text-white">{course.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div className="h-3 rounded-full bg-indigo-500 transition-all" style={{ width: `${course.progress}%` }}></div>
              </div>
            </div>
          )}

          {/* Modules List */}
          <div className="space-y-6 mb-8">
            {modules && modules.length > 0 ? (
              modules.map((module) => (
                <div key={module.id} className="card p-6 hover:scale-[1.01] transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{module.name}</h3>
                      {module.description && (
                        <p className="text-gray-400 text-sm">{module.description}</p>
                      )}
                    </div>
                    <span className="text-xl font-bold">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${module.progress}%` }}></div>
                  </div>
                  <Link
                    to={`/courses/${courseId}/modules/${module.id}`}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-2"
                  >
                    View Module
                    <FaArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No modules available in this course</p>
              </div>
            )}
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