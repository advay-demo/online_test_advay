import React, { useState, useEffect } from 'react';

import {
  FaCheckCircle,
  FaFire,
  FaLock,
  FaTrophy,
  FaBook,
  FaClipboardCheck,
  FaCertificate,
  FaChartLine,
  FaLinkedin
} from 'react-icons/fa';

import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

// Badge Images
import birdBadge from '../../assets/badges/bird.png';
import genieBadge from '../../assets/badges/genie.png';
import senseiBadge from '../../assets/badges/sensei.png';
import wizardBadge from '../../assets/badges/wizard1.png';

const Insights = () => {

  const [badges, setBadges] = useState({
    unlocked: [],
    inProgress: [],
    locked: []
  });

  const [achievements] = useState({
    total_courses: 12,
    completed_lessons: 85,
    pending_quizzes: 4,
    certificates_earned: 6,
    highest_score: 96
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadData = async () => {

      try {

        const data = {

          unlocked: [
            {
              id: 1,
              earned_date: "Apr 2, 2026",
              badge: {
                name: "Wizard",
                description: "Complete 250 quizzes",
              }
            },

            {
              id: 2,
              earned_date: "Mar 31, 2026",
              badge: {
                name: "Genie",
                description: "Score 100 quiz answers",
              }
            }
          ],

          inProgress: [
            {
              id: 3,

              progress_percentage: 65,

              steps: {
                completed: 65,
                total: 100
              },

              badge: {
                name: "Sensei",
                description: "Complete 100 courses",
              }
            }
          ],

          locked: [
            {
              id: 4,

              badge: {
                name: "Bird",
                description: "Complete 500 quizzes",
              }
            }
          ]
        };

        setBadges(data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

    loadData();

  }, []);

  const badgeImages = {
    Bird: birdBadge,
    Genie: genieBadge,
    Sensei: senseiBadge,
    Wizard: wizardBadge,
  };

  if (loading) {

    return (
      <div className="flex items-center justify-center h-screen dark:bg-[#121212] dark:text-white">
        Loading...
      </div>
    );
  }

  return (

    <div className="flex min-h-screen bg-gray-50 dark:bg-[#121212] transition-all duration-300">

      <Sidebar />

      <main className="flex-1 dark:bg-[#121212]">

        <Header isAuth />

        <div className="p-8">

          {/* HEADER */}

          <div className="mb-10">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">

                <FaTrophy className="text-yellow-500 text-3xl" />

              </div>

              <div>

                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                  Insights
                </h1>

                <p className="text-gray-500 dark:text-gray-300">
                  Track your learning achievements
                </p>

              </div>

            </div>

          </div>

          {/* PERFORMANCE SUMMARY */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-12">

            <div className="bg-white dark:bg-[#1e1e2f] text-black dark:text-white rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <FaBook className="text-blue-500 text-2xl mb-3" />
              <h3 className="text-2xl font-bold">
                {achievements.total_courses}
              </h3>
              <p className="text-gray-500 dark:text-gray-300 text-sm">
                Courses Enrolled
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e1e2f] text-black dark:text-white rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <FaCheckCircle className="text-green-500 text-2xl mb-3" />
              <h3 className="text-2xl font-bold">
                {achievements.completed_lessons}
              </h3>
              <p className="text-gray-500 dark:text-gray-300 text-sm">
                Lessons Completed
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e1e2f] text-black dark:text-white rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <FaClipboardCheck className="text-orange-500 text-2xl mb-3" />
              <h3 className="text-2xl font-bold">
                {achievements.pending_quizzes}
              </h3>
              <p className="text-gray-500 dark:text-gray-300 text-sm">
                Pending Quizzes
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e1e2f] text-black dark:text-white rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <FaCertificate className="text-purple-500 text-2xl mb-3" />
              <h3 className="text-2xl font-bold">
                {achievements.certificates_earned}
              </h3>
              <p className="text-gray-500 dark:text-gray-300 text-sm">
                Certificates Earned
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e1e2f] text-black dark:text-white rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <FaChartLine className="text-pink-500 text-2xl mb-3" />
              <h3 className="text-2xl font-bold">
                {achievements.highest_score}%
              </h3>
              <p className="text-gray-500 dark:text-gray-300 text-sm">
                Highest Quiz Score
              </p>
            </div>

          </div>

          {/* EARNED BADGES */}

          <section className="mb-12">

            <div className="flex items-center gap-3 mb-6">

              <FaCheckCircle className="text-green-500 text-2xl" />

              <h2 className="text-2xl font-bold dark:text-white">
                Recently Earned Badges
              </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {badges.unlocked.map((userBadge) => (

                <div
                  key={userBadge.id}
                  className="bg-white dark:bg-[#1e1e2f] text-black dark:text-white rounded-3xl shadow-lg p-6 text-center hover:scale-105 transition border border-gray-200 dark:border-gray-700"
                >

                  <img
                    src={badgeImages[userBadge.badge.name]}
                    alt=""
                    className="w-20 h-20 mx-auto mb-4"
                  />

                  <h3 className="text-xl font-bold mb-2">
                    {userBadge.badge.name}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-300 text-sm mb-3">
                    {userBadge.badge.description}
                  </p>

                  <div className="text-xs bg-indigo-100 text-indigo-600 inline-block px-4 py-1 rounded-full mb-4">
                    Awarded on {userBadge.earned_date}
                  </div>

                  <button
                    onClick={() =>
                      window.open(
                        "https://www.linkedin.com/sharing/share-offsite/?url=https://yaksh.com",
                        "_blank"
                      )
                    }
                    className="flex items-center gap-2 mx-auto bg-[#0A66C2] text-white px-4 py-2 rounded-xl hover:scale-105 transition"
                  >
                    <FaLinkedin />
                    Share Badge
                  </button>

                </div>
              ))}

            </div>

          </section>

          {/* IN PROGRESS */}

          <section className="mb-12">

            <div className="flex items-center gap-3 mb-6">

              <FaFire className="text-orange-500 text-2xl" />

              <h2 className="text-2xl font-bold dark:text-white">
                Your Next Target
              </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {badges.inProgress.map((item) => (

                <div
                  key={item.id}
                  className="bg-white dark:bg-[#1e1e2f] text-black dark:text-white rounded-3xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >

                  <img
                    src={badgeImages[item.badge.name]}
                    alt=""
                    className="w-20 h-20 mx-auto mb-4"
                  />

                  <h3 className="text-xl font-bold text-center mb-2">
                    {item.badge.name}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-300 text-sm text-center mb-5">
                    {item.badge.description}
                  </p>

                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{item.progress_percentage}%</span>
                  </div>

                  <div className="w-full h-3 bg-gray-200 rounded-full">

                    <div
                      className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{
                        width: `${item.progress_percentage}%`
                      }}
                    />

                  </div>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-300 mt-3">
                    {item.steps.completed}/{item.steps.total} completed
                  </p>

                </div>
              ))}

            </div>

          </section>

          {/* LOCKED */}

          <section>

            <div className="flex items-center gap-3 mb-6">

              <FaLock className="text-gray-500 text-2xl" />

              <h2 className="text-2xl font-bold dark:text-white">
                Locked Achievements
              </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {badges.locked.map((item) => (

                <div
                  key={item.id}
                  className="bg-gray-100 dark:bg-[#232336] text-black dark:text-white rounded-3xl p-6 text-center opacity-70 border border-gray-200 dark:border-gray-700"
                >

                  <img
                    src={badgeImages[item.badge.name]}
                    alt=""
                    className="w-20 h-20 mx-auto mb-4 grayscale"
                  />

                  <h3 className="text-xl font-bold mb-2">
                    {item.badge.name}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-300 text-sm mb-4">
                    {item.badge.description}
                  </p>

                  <div className="inline-block bg-gray-300 text-gray-700 text-xs px-4 py-1 rounded-full">
                    Locked
                  </div>

                </div>
              ))}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};

export default Insights;