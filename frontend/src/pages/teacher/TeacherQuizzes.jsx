import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import { fetchTeacherQuizzesGrouped, getTeacherQuiz, updateQuiz } from '../../api/api';
import { FaCalendar, FaEdit, FaClock, FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const TeacherQuizzes = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [showQuizForm, setShowQuizForm] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [quizFormData, setQuizFormData] = useState({
        description: '',
        instructions: '',
        duration: 20,
        attempts_allowed: 1,
        time_between_attempts: 0.0,
        pass_criteria: 40.0,
        weightage: 100.0,
        allow_skip: true,
        is_exercise: false,
        active: true,
        order: 1,
    });

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const data = await fetchTeacherQuizzesGrouped();
            setCourses(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load quizzes:', err);
            setError('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleQuizFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setQuizFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const openEditQuiz = async (quiz, moduleId) => {
        setEditingQuiz(quiz);
        setSelectedModuleId(moduleId);
        setSelectedQuizId(quiz.id);

        try {
            // Fetch full quiz data
            const quizData = await getTeacherQuiz(moduleId, quiz.id);
            setQuizFormData({
                description: quizData.description || '',
                instructions: quizData.instructions || '',
                duration: quizData.duration || 20,
                attempts_allowed: quizData.attempts_allowed || 1,
                time_between_attempts: quizData.time_between_attempts || 0.0,
                pass_criteria: quizData.pass_criteria || 40.0,
                weightage: quizData.weightage || 100.0,
                allow_skip: quizData.allow_skip !== undefined ? quizData.allow_skip : true,
                is_exercise: quizData.is_exercise !== undefined ? quizData.is_exercise : false,
                active: quizData.active !== undefined ? quizData.active : true,
                order: quizData.order || 1,
            });
            setShowQuizForm(true);
        } catch (err) {
            console.error('Failed to load quiz data:', err);
            alert('Failed to load quiz data: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleUpdateQuiz = async (e) => {
        e.preventDefault();
        try {
            await updateQuiz(selectedModuleId, selectedQuizId, quizFormData);
            setShowQuizForm(false);
            setEditingQuiz(null);
            loadQuizzes(); // Reload to show changes
        } catch (err) {
            console.error('Failed to update quiz:', err);
            alert('Failed to update quiz: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen relative grid-texture">
                <TeacherSidebar />
                <main className="flex-1">
                    <Header isAuth />
                    <div className="p-8 flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading quizzes...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen relative grid-texture">
            <TeacherSidebar />

            <main className="flex-1">
                <Header isAuth />

                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
                            <p className="muted text-sm">
                                Manage and monitor your quizzes across all courses
                            </p>
                        </div>
                    </div>

                    {error ? (
                        <div className="card p-6 border-red-500/30 text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={loadQuizzes}
                                className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <div key={course.course_id} className="card-strong p-6">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <FaCalendar className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">{course.course_name}</h2>
                                                <p className="text-xs muted">{course.course_code || 'No code'}</p>
                                            </div>
                                            <div className="ml-auto">
                                                <Link
                                                    to={`/teacher/courses/${course.course_id}/manage`}
                                                    className="text-sm text-blue-400 hover:text-blue-300 transition"
                                                >
                                                    Manage Course
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {course.quizzes.map((quiz) => (
                                                <div key={quiz.id} className="card p-4 hover:border-white/10 transition group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <div className="text-xs font-medium text-blue-400 mb-1">
                                                                {quiz.module_name}
                                                            </div>
                                                            <h3 className="font-bold truncate pr-2" title={quiz.name}>
                                                                {quiz.name}
                                                            </h3>
                                                        </div>
                                                        <div className={`
                                                            px-2 py-1 rounded text-[10px] font-uppercase font-bold
                                                            ${quiz.active
                                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                            }
                                                        `}>
                                                            {quiz.active ? 'ACTIVE' : 'INACTIVE'}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-y-2 text-xs muted mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaClock className="w-3 h-3" />
                                                            {quiz.duration} mins
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FaUsers className="w-3 h-3" />
                                                            {quiz.attempts} attempts
                                                        </div>
                                                        <div className="flex items-center gap-2 col-span-2">
                                                            <FaCalendar className="w-3 h-3" />
                                                            {new Date(quiz.start_date).toLocaleDateString()}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Link
                                                            to={`/teacher/courses/${course.course_id}/manage`}
                                                            className="flex-1 bg-white/5 hover:bg-white/10 text-center py-2 rounded-lg text-sm font-medium transition"
                                                        >
                                                            View Stats
                                                        </Link>
                                                        <button
                                                            onClick={() => openEditQuiz(quiz, quiz.module_id)}
                                                            className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-center py-2 rounded-lg text-sm font-medium transition"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaCalendar className="w-8 h-8 text-muted" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">No Quizzes Found</h3>
                                    <p className="text-muted mb-6">You haven't created any quizzes yet.</p>
                                    <Link
                                        to="/teacher/courses"
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Go to Courses
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Edit Quiz Modal */}
                {showQuizForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="card-strong rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">Edit Quiz</h3>
                            <form onSubmit={handleUpdateQuiz}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Quiz Name/Description *
                                        </label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={quizFormData.description}
                                            onChange={handleQuizFormChange}
                                            required
                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            placeholder="Enter quiz name/description"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Instructions
                                        </label>
                                        <textarea
                                            name="instructions"
                                            value={quizFormData.instructions}
                                            onChange={handleQuizFormChange}
                                            rows="3"
                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                            placeholder="Enter quiz instructions for students"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Duration (minutes) *
                                            </label>
                                            <input
                                                type="number"
                                                name="duration"
                                                value={quizFormData.duration}
                                                onChange={handleQuizFormChange}
                                                required
                                                min="1"
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Attempts Allowed
                                            </label>
                                            <input
                                                type="number"
                                                name="attempts_allowed"
                                                value={quizFormData.attempts_allowed}
                                                onChange={handleQuizFormChange}
                                                min="-1"
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            />
                                            <p className="text-xs muted mt-1">-1 for unlimited</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Time Between Attempts (hours)
                                            </label>
                                            <input
                                                type="number"
                                                name="time_between_attempts"
                                                value={quizFormData.time_between_attempts}
                                                onChange={handleQuizFormChange}
                                                min="0"
                                                step="0.5"
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Pass Criteria (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="pass_criteria"
                                                value={quizFormData.pass_criteria}
                                                onChange={handleQuizFormChange}
                                                min="0"
                                                max="100"
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Weightage (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="weightage"
                                                value={quizFormData.weightage}
                                                onChange={handleQuizFormChange}
                                                min="0"
                                                max="100"
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Order
                                            </label>
                                            <input
                                                type="number"
                                                name="order"
                                                value={quizFormData.order}
                                                onChange={handleQuizFormChange}
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="allow_skip"
                                                checked={quizFormData.allow_skip}
                                                onChange={handleQuizFormChange}
                                                className="toggle-checkbox"
                                            />
                                            <span className="text-sm">Allow Skip Questions</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="is_exercise"
                                                checked={quizFormData.is_exercise}
                                                onChange={handleQuizFormChange}
                                                className="toggle-checkbox"
                                            />
                                            <span className="text-sm">Is Exercise (Practice Mode)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="active"
                                                checked={quizFormData.active}
                                                onChange={handleQuizFormChange}
                                                className="toggle-checkbox"
                                            />
                                            <span className="text-sm">Active</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowQuizForm(false);
                                            setEditingQuiz(null);
                                        }}
                                        className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherQuizzes;
