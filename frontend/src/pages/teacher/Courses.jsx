import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaBook, FaClock, FaUserFriends, FaEllipsisV } from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';

const Courses = () => {
    const [activeTab, setActiveTab] = useState('All Quizzes');

    const courses = [
        {
            id: 1,
            title: 'Introduction to Biology',
            description: 'Basic concepts of biology for beginners',
            status: 'Active',
            questions: 15,
            time: '20 min',
            completions: 32,
            created: 'Created just now',
            color: 'blue',
        },
        {
            id: 2,
            title: 'Advanced Mathematics',
            description: 'Basic concepts of biology for beginners',
            status: 'Inactive',
            questions: 15,
            time: '20 min',
            completions: 32,
            created: 'Created just now',
            color: 'indigo',
        },
        {
            id: 3,
            title: 'Chemistry Fundamentals',
            description: 'Basic concepts of biology for beginners',
            status: 'Draft',
            questions: 15,
            time: '20 min',
            completions: 32,
            created: 'Created just now',
            color: 'purple',
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Inactive':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'Draft':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

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

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                            <FaPlus className="w-3 h-3" />
                            Course Library
                        </button>
                        <button className="border border-white/10 px-5 py-2.5 rounded-lg font-semibold hover:bg-white/5 transition flex items-center gap-2">
                            <FaPlus className="w-3 h-3" />
                            Create Grading System
                        </button>
                        <Link
                            to="/teacher/add-course"
                            className="border border-white/10 px-5 py-2.5 rounded-lg font-semibold hover:bg-white/5 transition flex items-center gap-2"
                        >
                            <FaPlus className="w-3 h-3" />
                            Create New Course
                        </Link>
                    </div>

                    {/* Course Library Section */}
                    <div className="card-strong p-6 min-h-[600px]">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-1">Course Library</h2>
                            <p className="text-sm muted">Browse and manage all your courses</p>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="flex bg-black/20 p-1 rounded-lg">
                                {['All Quizzes', 'Active', 'Drafts'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === tab
                                                ? 'bg-white/10 text-white'
                                                : 'text-muted hover:text-white'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition">
                                    <FaFilter className="w-3 h-3" />
                                    All Categories
                                </button>
                            </div>
                        </div>

                        {/* Course List */}
                        <div className="space-y-4">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="card p-4 hover:bg-white/[0.02] transition group"
                                >
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                        {/* Icon */}
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                                            <FaBook className="w-5 h-5 text-blue-400" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-lg truncate">
                                                    {course.title}
                                                </h3>
                                                <span
                                                    className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(
                                                        course.status
                                                    )} uppercase font-bold tracking-wider`}
                                                >
                                                    {course.status}
                                                </span>
                                            </div>
                                            <p className="text-sm muted mb-3">{course.description}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs muted">
                                                <div className="flex items-center gap-1.5">
                                                    <FaBook className="w-3 h-3" />
                                                    {course.questions} questions
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <FaClock className="w-3 h-3" />
                                                    {course.time}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <FaUserFriends className="w-3 h-3" />
                                                    {course.completions} completions
                                                </div>
                                                <div className="text-white/20">|</div>
                                                <div>{course.created}</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                            <button className="flex-1 md:flex-none px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition">
                                                Manage
                                            </button>
                                            <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition text-muted hover:text-white">
                                                <FaEllipsisV className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Courses;
