import React, { useState, useEffect } from 'react';
import { FaStar, FaCheckCircle, FaFire, FaBolt } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { fetchBadges } from '../../api/api';

const Insights = () => {
  const [badges, setBadges] = useState({ unlocked: [], inProgress: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        setLoading(true);
        const data = await fetchBadges();
        setBadges(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load badges:', err);
        setError('Failed to load badges');
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, []);

  const badgeIcons = {
    cyan: FaCheckCircle,
    orange: FaFire,
    purple: FaStar,
    blue: FaBolt,
    green: FaCheckCircle,
    amber: FaStar,
    yellow: FaStar
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
              <p className="text-gray-400">Loading insights...</p>
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
            <h1 className="text-3xl font-bold">Insights</h1>
            <p className="text-gray-400 text-sm mt-1">Unlock badges and earn recognition for your learning</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 mb-6">
              {error}
            </div>
          )}

          {/* Unlocked Badges */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FaStar className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">Unlocked</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.unlocked && badges.unlocked.length > 0 ? (
                badges.unlocked.map((userBadge) => {
                  const badge = userBadge.badge;
                  const BadgeIcon = badgeIcons[badge.color] || FaStar;
                  return (
                    <div key={userBadge.id} className="card rounded-2xl p-6 text-center hover:scale-[1.02] transition border-l-4 border-indigo-400">
                      <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                        <BadgeIcon className="w-8 h-8 text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
                      <div className="inline-block bg-white/10 text-indigo-300 text-xs px-3 py-1 rounded-full font-medium">
                        {userBadge.earned_date}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-12 text-gray-400">
                  <p>No badges earned yet. Keep learning to unlock your first badge!</p>
                </div>
              )}
            </div>
          </section>

          {/* In Progress Badges */}
          <section>
            <h2 className="text-2xl font-bold mb-6">In Progress</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.inProgress && badges.inProgress.length > 0 ? (
                badges.inProgress.map((badgeProgress) => {
                  const badge = badgeProgress.badge;
                  return (
                    <div key={badgeProgress.id} className="card p-6 text-center hover:scale-[1.02] transition">
                      <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 00-3.138 3.138z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                      <p className="text-sm muted mb-4">{badge.description}</p>

                      <div className="mb-3">
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${badgeProgress.progress_percentage}%` }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {badgeProgress.steps.completed}/{badgeProgress.steps.total} completed
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-400">
                  <p>No badges in progress</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Insights;