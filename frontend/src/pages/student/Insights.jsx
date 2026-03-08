import React, { useState, useEffect } from 'react';
import { FaStar, FaCheckCircle, FaFire, FaBolt, FaLock, FaTrophy } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { fetchBadges } from '../../api/api';

const Insights = () => {
  const [badges, setBadges] = useState({ unlocked: [], inProgress: [], locked: [] });
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

  const badgeColors = {
    cyan: { icon: 'text-cyan-400', border: 'border-cyan-400/40', bg: 'bg-cyan-400/10' },
    orange: { icon: 'text-orange-400', border: 'border-orange-400/40', bg: 'bg-orange-400/10' },
    purple: { icon: 'text-purple-400', border: 'border-purple-400/40', bg: 'bg-purple-400/10' },
    blue: { icon: 'text-blue-400', border: 'border-blue-400/40', bg: 'bg-blue-400/10' },
    green: { icon: 'text-green-400', border: 'border-green-400/40', bg: 'bg-green-400/10' },
    amber: { icon: 'text-amber-400', border: 'border-amber-400/40', bg: 'bg-amber-400/10' },
    yellow: { icon: 'text-yellow-400', border: 'border-yellow-400/40', bg: 'bg-yellow-400/10' },
  };

  const defaultColors = { icon: 'text-indigo-400', border: 'border-indigo-400/40', bg: 'bg-indigo-400/10' };

  // Render an unlocked badge card
  const renderUnlockedBadge = (userBadge) => {
    const badge = userBadge.badge;
    const BadgeIcon = badgeIcons[badge.color] || FaTrophy;
    const colors = badgeColors[badge.color] || defaultColors;
    return (
      <div key={`unlocked-${userBadge.id}`} className={`card rounded-2xl p-6 text-center hover:scale-[1.02] transition border-l-4 ${colors.border}`}>
        <div className={`w-16 h-16 mx-auto mb-4 ${colors.bg} rounded-full flex items-center justify-center`}>
          <BadgeIcon className={`w-8 h-8 ${colors.icon}`} />
        </div>
        <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
        <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
        <div className="inline-block bg-white/10 text-indigo-300 text-xs px-3 py-1 rounded-full font-medium">
          {userBadge.earned_date}
        </div>
      </div>
    );
  };

  // Render an in-progress badge card
  const renderInProgressBadge = (badgeProgress) => {
    const badge = badgeProgress.badge;
    const BadgeIcon = badgeIcons[badge.color] || FaTrophy;
    const colors = badgeColors[badge.color] || defaultColors;
    return (
      <div key={`progress-${badgeProgress.id}`} className="card rounded-2xl p-6 text-center hover:scale-[1.02] transition opacity-80">
        <div className={`w-16 h-16 mx-auto mb-4 ${colors.bg} rounded-full flex items-center justify-center`}>
          <BadgeIcon className={`w-8 h-8 ${colors.icon} opacity-70`} />
        </div>
        <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
        <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
        {/* Progress bar */}
        <div className="mb-2">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${badgeProgress.progress_percentage}%` }}></div>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          {badgeProgress.steps.completed}/{badgeProgress.steps.total} completed
        </p>
      </div>
    );
  };

  // Render a locked badge card
  const renderLockedBadge = (badge) => {
    const BadgeIcon = badgeIcons[badge.color] || FaTrophy;
    return (
      <div key={`locked-${badge.id}`} className="card rounded-2xl p-6 text-center transition opacity-45 grayscale">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
            <BadgeIcon className="w-8 h-8 text-gray-500" />
          </div>
          {/* Lock overlay */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-800">
            <FaLock className="w-3 h-3 text-gray-400" />
          </div>
        </div>
        <h3 className="font-bold text-lg mb-2 text-gray-500">{badge.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
        <div className="inline-block bg-white/5 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
          Keep learning to unlock
        </div>
      </div>
    );
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

  const totalBadges = (badges.unlocked?.length || 0) + (badges.inProgress?.length || 0) + (badges.locked?.length || 0);
  const unlockedCount = badges.unlocked?.length || 0;

  return (
    <div className="flex min-h-screen relative grid-texture">
      <Sidebar />

      <main className="flex-1">
        <Header isAuth />

        <div className="p-8">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Insights</h1>
            <p className="text-gray-400 text-sm mt-1">
              Unlock badges and earn recognition for your learning
              {totalBadges > 0 && (
                <span className="ml-2 text-indigo-400">— {unlockedCount}/{totalBadges} badges earned</span>
              )}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 mb-6">
              {error}
            </div>
          )}

          {/* All Badges Grid */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FaTrophy className="w-5 h-5 text-yellow-400" />
              <h2 className="text-2xl font-bold">All Badges</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Unlocked badges first */}
              {badges.unlocked && badges.unlocked.map((userBadge) => renderUnlockedBadge(userBadge))}

              {/* In-progress badges next */}
              {badges.inProgress && badges.inProgress.map((badgeProgress) => renderInProgressBadge(badgeProgress))}

              {/* Locked badges last */}
              {badges.locked && badges.locked.map((badge) => renderLockedBadge(badge))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Insights;