import React from 'react';
import { FaUsers, FaCheckCircle, FaChartLine, FaTrophy, FaBook, FaQuestionCircle } from 'react-icons/fa';

const CourseAnalytics = ({ analytics, loading }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12 text-muted">
                <p>No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs muted mb-1">Total Students</p>
                            <p className="text-2xl font-bold">{analytics.total_students || 0}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <FaUsers className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs muted mb-1">Completion Rate</p>
                            <p className="text-2xl font-bold">{analytics.completion_rate || 0}%</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                            <FaCheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs muted mb-1">Average Score</p>
                            <p className="text-2xl font-bold">{analytics.average_score || 0}%</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                            <FaChartLine className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs muted mb-1">Active Students</p>
                            <p className="text-2xl font-bold">{analytics.enrolled_students || 0}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                            <FaUsers className="w-5 h-5 text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Statistics */}
            {analytics.module_stats && analytics.module_stats.length > 0 && (
                <div className="card-strong p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FaBook className="w-5 h-5" />
                        Module Completion Statistics
                    </h3>
                    <div className="space-y-3">
                        {analytics.module_stats.map((module) => (
                            <div key={module.module_id} className="card p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{module.module_name}</h4>
                                    <span className="text-sm font-bold text-green-400">
                                        {module.completion_rate}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-500/20 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all"
                                        style={{ width: `${module.completion_rate}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between text-xs muted">
                                    <span>{module.students_completed} students completed</span>
                                    <span>{module.total_units} units</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quiz Statistics */}
            {analytics.quiz_stats && analytics.quiz_stats.length > 0 && (
                <div className="card-strong p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FaQuestionCircle className="w-5 h-5" />
                        Quiz Performance
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-3 text-sm font-semibold">Quiz Name</th>
                                    <th className="text-left p-3 text-sm font-semibold">Attempts</th>
                                    <th className="text-left p-3 text-sm font-semibold">Avg Score</th>
                                    <th className="text-left p-3 text-sm font-semibold">Pass Rate</th>
                                    <th className="text-left p-3 text-sm font-semibold">Questions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.quiz_stats.map((quiz) => (
                                    <tr key={quiz.quiz_id} className="border-b border-white/5">
                                        <td className="p-3">{quiz.quiz_name}</td>
                                        <td className="p-3">{quiz.total_attempts}</td>
                                        <td className="p-3 font-semibold">{quiz.average_score}%</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                quiz.pass_rate >= 70 
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : quiz.pass_rate >= 50
                                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                                {quiz.pass_rate}%
                                            </span>
                                        </td>
                                        <td className="p-3">{quiz.total_questions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Top Students */}
            {analytics.top_students && analytics.top_students.length > 0 && (
                <div className="card-strong p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FaTrophy className="w-5 h-5 text-yellow-400" />
                        Top Students
                    </h3>
                    <div className="space-y-3">
                        {analytics.top_students.map((student, index) => (
                            <div key={student.user_id} className="card p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">
                                            {student.first_name} {student.last_name}
                                        </h4>
                                        <p className="text-xs muted">{student.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{student.score}%</p>
                                        <p className="text-xs muted">Score</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{student.completion}%</p>
                                        <p className="text-xs muted">Complete</p>
                                    </div>
                                    {student.grade && student.grade !== 'N/A' && (
                                        <div className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm font-bold">
                                            {student.grade}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Question Statistics */}
            {analytics.question_statistics && analytics.question_statistics.length > 0 && (
                <div className="card-strong p-6">
                    <h3 className="text-lg font-bold mb-4">Question Statistics</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-3 text-sm font-semibold">Question</th>
                                    <th className="text-left p-3 text-sm font-semibold">Quiz</th>
                                    <th className="text-left p-3 text-sm font-semibold">Attempts</th>
                                    <th className="text-left p-3 text-sm font-semibold">Correct</th>
                                    <th className="text-left p-3 text-sm font-semibold">Avg Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.question_statistics.slice(0, 10).map((q, index) => (
                                    <tr key={index} className="border-b border-white/5">
                                        <td className="p-3">{q.summary}</td>
                                        <td className="p-3 text-xs muted">{q.quiz_name}</td>
                                        <td className="p-3">{q.attempts}</td>
                                        <td className="p-3">{q.correct_attempts}</td>
                                        <td className="p-3 font-semibold">{q.average_score}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseAnalytics;

