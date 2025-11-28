import React from 'react';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';

const AddCourse = () => {
    return (
        <div className="flex min-h-screen relative grid-texture">
            <TeacherSidebar />

            <main className="flex-1">
                <Header isAuth />

                <div className="p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-start gap-4">
                                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold mb-1">Create New Course</h1>
                                    <p className="text-sm muted">
                                        Add details, set timings and configure course settings
                                    </p>
                                </div>
                            </div>
                            <button className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition">
                                Save Draft
                            </button>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Left Column - Course Details */}
                            <div className="card-strong p-6">
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold mb-1">Course Details</h2>
                                    <p className="text-sm muted">Basic information about your Course</p>
                                </div>

                                {/* Course Title */}
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold soft mb-2">
                                        Course Title
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="Introduction to Environmental Science"
                                        className="w-full px-4 py-2.5"
                                    />
                                </div>

                                {/* Instructions */}
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold soft mb-2">
                                        Instructions
                                    </label>
                                    <textarea
                                        rows="4"
                                        className="w-full px-4 py-2.5 resize-none"
                                        placeholder="Enter course instructions..."
                                        defaultValue="Test your knowledge about environmental science basics, including renewable energy, ecosystems, and sustainability."
                                    ></textarea>
                                </div>

                                {/* Code and Enrollment */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold soft mb-2">
                                            Code
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="0001"
                                            className="w-full px-4 py-2.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold soft mb-2">
                                            Enrollment
                                        </label>
                                        <select className="w-full px-4 py-2.5">
                                            <option>Medium</option>
                                            <option>Low</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Quiz Settings */}
                            <div className="card-strong p-6">
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold mb-1">Quiz Settings</h2>
                                    <p className="text-sm muted">Configure how your course works</p>
                                </div>

                                {/* Start date & Time */}
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold soft mb-2">
                                        Start date & Time
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg"
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                            }}
                                        >
                                            <svg
                                                className="w-5 h-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span className="soft">15</span>
                                        </div>
                                    </div>
                                </div>

                                {/* End date & Time */}
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold soft mb-2">
                                        End date & Time
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg"
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                            }}
                                        >
                                            <svg
                                                className="w-5 h-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span className="soft">70</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Grading System */}
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold soft mb-2">
                                        Grading System
                                    </label>
                                    <select className="w-full px-4 py-2.5">
                                        <option>Select grading system</option>
                                        <option>Percentage</option>
                                        <option>Letter Grade</option>
                                        <option>Pass/Fail</option>
                                    </select>
                                </div>

                                {/* Active Toggle */}
                                <div
                                    className="flex items-center justify-between p-4 rounded-lg"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                    }}
                                >
                                    <div>
                                        <div className="font-semibold mb-1">Active</div>
                                        <div className="text-xs muted">Course ready for Enrollment</div>
                                    </div>
                                    <input type="checkbox" className="toggle-checkbox" defaultChecked />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="flex justify-end gap-3 mt-8">
                            <button className="border border-white/10 px-6 py-2.5 rounded-lg font-semibold hover:bg-white/5 transition flex items-center gap-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Prev
                            </button>
                            <button className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
                                Publish
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddCourse;
