import React from 'react';
import { FaStar, FaCheckCircle, FaFire, FaBolt } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useStore } from '../../store/useStore';

const Insights = () => {
  const { badges } = useStore();

  const badgeIcons = {
    cyan: FaCheckCircle,
    orange: FaFire,
    purple: FaStar,
    blue: FaBolt
  };

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

          {/* Unlocked Badges */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FaStar className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">Unlocked</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.unlocked.map((badge) => {
                const BadgeIcon = badgeIcons[badge.color];
                return (
                  <div key={badge.id} className={`badge-${badge.color} rounded-2xl p-6 text-center hover:scale-[1.02] transition`}>
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                      <BadgeIcon className={`w-8 h-8 text-${badge.color}-400`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
                    <div className={`inline-block bg-white/10 text-${badge.color}-300 text-xs px-3 py-1 rounded-full font-medium`}>
                      {badge.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* In Progress Badges */}
          <section>
            <h2 className="text-2xl font-bold mb-6">In Progress</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.inProgress.map((badge) => (
                <div key={badge.id} className="card p-6 text-center hover:scale-[1.02] transition">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 00-3.138 3.138z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                  <p className="text-sm muted mb-4">{badge.description}</p>

                  <div className="mb-3">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${badge.progress}%` }}></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {badge.steps.completed}/{badge.steps.total} {badge.name.includes('Century') ? 'challenges' : 'steps'}
                  </p>
                </div>
              ))}

              {/* Additional In Progress Badges */}
              <div className="card p-6 text-center hover:scale-[1.02] transition">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Night Owl</h3>
                <p className="text-sm muted mb-4">Complete 10 late-night sessions</p>

                <div className="mb-3">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">5/10 sessions</p>
              </div>

              <div className="card p-6 text-center hover:scale-[1.02] transition">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-11.622z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Bug Hunter</h3>
                <p className="text-sm muted mb-4">Find and report 5 bugs</p>

                <div className="mb-3">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">1/5 bugs</p>
              </div>

              <div className="card p-6 text-center hover:scale-[1.02] transition">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m-6 8a6 6 0 00-6 6h12a6 6 0 00-6-6z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Polyglot</h3>
                <p className="text-sm muted mb-4">Learn 3 programming languages</p>

                <div className="mb-3">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '66%' }}></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">2/3 languages</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Insights;