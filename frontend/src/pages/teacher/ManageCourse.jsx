import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaChevronLeft,
    FaShareAlt,
    FaEllipsisV,
    FaPlus,
    FaCalendarAlt,
    FaChevronUp,
    FaChevronDown,
} from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';

const ManageCourse = () => {
    const [activeTab, setActiveTab] = useState('Modules');

    const tabs = [
        'Enrollment',
        'Modules',
        'Design Course',
        'Appearance',
        'Privacy',
        'Billing',
    ];

    return (
        <div className="flex min-h-screen relative grid-texture">
            <TeacherSidebar />

            <main className="flex-1">
                <Header isAuth />

                <div className="p-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">Courses</h1>
                        <p className="text-sm muted">Create, manage and analyze your courses</p>
                    </div>

                    {/* Course Container */}
                    <div className="card-strong p-6 min-h-[600px]">
                        {/* Course Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/teacher/courses"
                                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
                                >
                                    <FaChevronLeft className="w-4 h-4" />
                                </Link>
                                <div>
                                    <h2 className="text-xl font-bold mb-1">
                                        Introduction to Biology
                                    </h2>
                                    <p className="text-sm muted">
                                        Basic concepts of biology for beginners
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition flex items-center gap-2">
                                    <FaShareAlt className="w-3 h-3" />
                                    Share
                                </button>
                                <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition text-muted hover:text-white">
                                    <FaEllipsisV className="w-4 h-4" />
                                </button>
                                {activeTab === 'Modules' && (
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
                                        <FaPlus className="w-3 h-3" />
                                        Add Module
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-black/20 p-1 rounded-lg w-fit mb-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === tab
                                            ? 'bg-blue-600 text-white'
                                            : 'text-muted hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                            {activeTab === 'Enrollment' && (
                                <div>
                                    <div className="text-cyan-400 text-sm font-medium mb-4 flex items-center gap-2">
                                        ENROLLMENTS for the course are below <span>&rarr;</span>
                                    </div>
                                    {/* Empty state or list would go here */}
                                </div>
                            )}

                            {activeTab === 'Modules' && (
                                <div className="space-y-6">
                                    <div className="text-cyan-400 text-xs font-bold tracking-wider mb-4">
                                        MODULES for the course are below &rarr;
                                    </div>

                                    {/* Module 1 */}
                                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                            <div>
                                                <h3 className="font-bold text-lg">Module_01</h3>
                                                <p className="text-xs muted mt-1">
                                                    Manage your upcoming and active quiz events
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-xs font-bold flex items-center gap-1 hover:bg-cyan-500/30 transition">
                                                    <FaPlus className="w-2 h-2" /> Add Lesson
                                                </button>
                                                <button className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-bold flex items-center gap-1 hover:bg-green-500/30 transition">
                                                    <FaPlus className="w-2 h-2" /> Add Quiz
                                                </button>
                                                <button className="px-3 py-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-xs font-bold flex items-center gap-1 hover:bg-orange-500/30 transition">
                                                    <FaPlus className="w-2 h-2" /> Add Exercise
                                                </button>
                                                <button className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs font-bold hover:bg-yellow-500/30 transition">
                                                    Design Module
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-2 space-y-2">
                                            {/* Item 1 */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-400">
                                                        <FaCalendarAlt className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            Science Mid-term Quiz
                                                        </div>
                                                        <div className="text-xs muted flex items-center gap-3 mt-0.5">
                                                            <span>Today, 2:30 PM</span>
                                                            <span>32 participants</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition">
                                                    Manage
                                                </button>
                                            </div>

                                            {/* Item 2 */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-400">
                                                        <FaCalendarAlt className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            Mathematics Weekly Test
                                                        </div>
                                                        <div className="text-xs muted flex items-center gap-3 mt-0.5">
                                                            <span>Tomorrow, 10:00 AM</span>
                                                            <span>28 participants</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition">
                                                    Manage
                                                </button>
                                            </div>

                                            {/* Item 3 */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-400">
                                                        <FaCalendarAlt className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            History Final Exam
                                                        </div>
                                                        <div className="text-xs muted flex items-center gap-3 mt-0.5">
                                                            <span>May 20, 9:00 AM</span>
                                                            <span>45 participants</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition">
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Module 2 */}
                                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                            <div>
                                                <h3 className="font-bold text-lg">Module_02</h3>
                                                <p className="text-xs muted mt-1">
                                                    Manage your upcoming and active quiz events
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-xs font-bold flex items-center gap-1 hover:bg-cyan-500/30 transition">
                                                    <FaPlus className="w-2 h-2" /> Add Lesson
                                                </button>
                                                <button className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-bold flex items-center gap-1 hover:bg-green-500/30 transition">
                                                    <FaPlus className="w-2 h-2" /> Add Quiz
                                                </button>
                                                <button className="px-3 py-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-xs font-bold flex items-center gap-1 hover:bg-orange-500/30 transition">
                                                    <FaPlus className="w-2 h-2" /> Add Exercise
                                                </button>
                                                <button className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs font-bold hover:bg-yellow-500/30 transition">
                                                    Design Module
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-2 space-y-2">
                                            {/* Item 1 */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-400">
                                                        <FaCalendarAlt className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            Science Mid-term Quiz
                                                        </div>
                                                        <div className="text-xs muted flex items-center gap-3 mt-0.5">
                                                            <span>Today, 2:30 PM</span>
                                                            <span>32 participants</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition">
                                                    Manage
                                                </button>
                                            </div>

                                            {/* Item 2 */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-400">
                                                        <FaCalendarAlt className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            Mathematics Weekly Test
                                                        </div>
                                                        <div className="text-xs muted flex items-center gap-3 mt-0.5">
                                                            <span>Tomorrow, 10:00 AM</span>
                                                            <span>28 participants</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition">
                                                    Manage
                                                </button>
                                            </div>

                                            {/* Item 3 */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-400">
                                                        <FaCalendarAlt className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            History Final Exam
                                                        </div>
                                                        <div className="text-xs muted flex items-center gap-3 mt-0.5">
                                                            <span>May 20, 9:00 AM</span>
                                                            <span>45 participants</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition">
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Design Course' && (
                                <div>
                                    <div className="text-cyan-400 text-sm font-medium mb-4 flex items-center gap-2">
                                        DESIGN THE COURSE the course below <span>&rarr;</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Selected Modules */}
                                        <div className="border border-white/10 rounded-xl p-4 min-h-[400px] flex flex-col">
                                            <div className="mb-4">
                                                <h3 className="font-bold text-lg">Selected Modules</h3>
                                                <p className="text-xs muted">
                                                    Choose modules and configure your course
                                                </p>
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center"></div>
                                                    <span className="text-sm font-medium">Module_01</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto flex justify-between pt-4">
                                                <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition">
                                                    Remove
                                                </button>
                                                <div className="flex gap-2">
                                                    <button className="px-3 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition flex items-center gap-2">
                                                        <FaChevronUp className="w-3 h-3" /> Up
                                                    </button>
                                                    <button className="px-3 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition flex items-center gap-2">
                                                        <FaChevronDown className="w-3 h-3" /> Down
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pool of Modules */}
                                        <div className="border border-white/10 rounded-xl p-4 min-h-[400px] flex flex-col">
                                            <div className="mb-4">
                                                <h3 className="font-bold text-lg">Pool of Modules</h3>
                                                <p className="text-xs muted">Quizzes/lessons available</p>
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center"></div>
                                                    <span className="text-sm font-medium">Module_05</span>
                                                </div>
                                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    </div>
                                                    <span className="text-sm font-medium">Module_02</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto flex justify-between pt-4">
                                                <button className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium hover:bg-green-500/30 transition">
                                                    Add
                                                </button>
                                                <div className="flex gap-2">
                                                    <button className="px-3 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition flex items-center gap-2">
                                                        <FaChevronUp className="w-3 h-3" /> Up
                                                    </button>
                                                    <button className="px-3 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition flex items-center gap-2">
                                                        <FaChevronDown className="w-3 h-3" /> Down
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ManageCourse;
