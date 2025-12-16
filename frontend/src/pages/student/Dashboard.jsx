import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaBolt, FaChartLine, FaClock, FaArrowRight } from 'react-icons/fa';
import { AiOutlineCheck, AiOutlineTrophy, AiOutlineMessage, AiOutlineFire } from 'react-icons/ai';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useAuthStore } from '../../store/authStore';
import { fetchDashboardData } from '../../api/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        setStats(data.stats);
        setCourses(data.activeCourses);
        setActivities(data.recentActivities);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        <Sidebar />
        <main className="flex-1">
          <Header isAuth />
          <div className="p-8 flex items-center justify-center h-96">
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
          <div className="p-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
              {error}
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
            <h1 className="text-2xl font-bold">Welcome back, {user?.first_name || user?.username}!</h1>
            <p className="text-gray-400 text-sm mt-1">Keep up the momentum with your learning journey</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="muted text-sm mb-1">Courses Enrolled</p>
                    <p className="text-3xl font-bold">{stats.coursesEnrolled || 0}</p>
                    <p className="muted text-xs mt-1">{stats.inProgress || 0} in progress</p>
                  </div>
                  <div className="w-12 h-12 icon-circle rounded-full flex items-center justify-center">
                    <FaCheckCircle className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="muted text-sm mb-1">Challenges Solved</p>
                    <p className="text-3xl font-bold">{stats.total_challenges_solved || 0}</p>
                    <p className="muted text-xs mt-1">+{stats.challenges_this_week || 0} this week</p>
                  </div>
                  <div className="w-12 h-12 icon-circle rounded-full flex items-center justify-center">
                    <FaBolt className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="muted text-sm mb-1">Current Streak</p>
                    <p className="text-3xl font-bold">{stats.current_streak || 0} days</p>
                    <p className="muted text-xs mt-1">Keep it up!</p>
                  </div>
                  <div className="w-12 h-12 icon-circle rounded-full flex items-center justify-center">
                    <FaChartLine className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="muted text-sm mb-1">Learning Hours</p>
                    <p className="text-3xl font-bold">{stats.learning_hours || '0h 0m'}</p>
                    <p className="muted text-xs mt-1">Total time</p>
                  </div>
                  <div className="w-12 h-12 icon-circle rounded-full flex items-center justify-center">
                    <FaClock className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Active Courses */}
            <div className="lg:col-span-2 card-strong p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Active Courses</h2>
                <span className="text-sm muted bg-white/3 px-3 py-1 rounded-full">
                  {courses.length} courses
                </span>
              </div>

              <div className="space-y-4">
                {courses && courses.length > 0 ? (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-5 rounded-xl card"
                      style={{ borderLeft: `4px solid rgba(${course.color === 'indigo' ? '99,102,241' : course.color === 'pink' ? '236,72,153' : course.color === 'cyan' ? '34,211,238' : '59,130,246'},0.6)` }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
                          <p className="text-sm muted">{course.instructor}</p>
                        </div>
                        <span className="text-lg font-bold">{course.progress}%</span>
                      </div>

                      <div className="w-full bg-white/6 rounded-full h-2 mb-3 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-sm muted">
                          Lessons: {course.lessons.completed}/{course.lessons.total}
                        </p>
                        {course.next_lesson && (
                          <p className="text-sm text-indigo-400 font-medium truncate max-w-xs">
                            Next: {course.next_lesson}
                          </p>
                        )}
                      </div>

                      <Link
                        to={`/courses/${course.id}/modules`}
                        className="w-full mt-4 py-2.5 text-white btn-primary flex items-center justify-center gap-2 hover:brightness-110 transition"
                      >
                        Continue Learning
                        <FaArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No active courses yet.</p>
                    <Link to="/courses" className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
                      Browse Course Catalog
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6">Recent Activity</h2>

              <div className="space-y-4">
                {activities && activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full icon-circle flex items-center justify-center flex-shrink-0">
                        {activity.icon === 'check' && <AiOutlineCheck className="w-5 h-5 text-green-400" />}
                        {activity.icon === 'award' && <AiOutlineTrophy className="w-5 h-5 text-amber-400" />}
                        {activity.icon === 'flame' && <AiOutlineFire className="w-5 h-5 text-orange-400" />}
                        {activity.icon === 'message' && <AiOutlineMessage className="w-5 h-5 text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs muted">{activity.description}</p>
                        )}
                        {activity.badge_name && (
                          <div className="inline-block bg-yellow-400/20 text-yellow-400 text-xs px-2 py-1 rounded mt-1">
                            {activity.badge_name}
                          </div>
                        )}
                        <p className="text-xs muted mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No recent activities</p>
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

export default Dashboard;