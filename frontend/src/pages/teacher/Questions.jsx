import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBook, FaCode, FaCheckCircle } from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import { fetchTeacherQuestions, deleteQuestion } from '../../api/api';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        type: '',
        language: '',
        search: '',
        active: undefined
    });

    useEffect(() => {
        loadQuestions();
    }, [filters]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const data = await fetchTeacherQuestions(filters);
            setQuestions(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load questions:', err);
            setError('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question? This will also remove it from all quizzes.')) {
            return;
        }
        try {
            await deleteQuestion(questionId);
            loadQuestions();
        } catch (err) {
            console.error('Failed to delete question:', err);
            alert('Failed to delete question');
        }
    };

    const getQuestionTypeIcon = (type) => {
        switch (type) {
            case 'code':
                return <FaCode className="w-4 h-4" />;
            case 'mcq':
            case 'mcc':
                return <FaCheckCircle className="w-4 h-4" />;
            default:
                return <FaBook className="w-4 h-4" />;
        }
    };

    const getQuestionTypeColor = (type) => {
        switch (type) {
            case 'code':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'mcq':
            case 'mcc':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'integer':
            case 'float':
            case 'string':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
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
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Questions</h1>
                                <p className="text-sm muted">Create and manage your questions</p>
                            </div>
                            <Link
                                to="/teacher/questions/create"
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <FaPlus className="w-3 h-3" />
                                Create Question
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card-strong p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Search</label>
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search questions..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Type</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="">All Types</option>
                                    <option value="mcq">MCQ</option>
                                    <option value="mcc">MCC</option>
                                    <option value="code">Code</option>
                                    <option value="integer">Integer</option>
                                    <option value="float">Float</option>
                                    <option value="string">String</option>
                                    <option value="arrange">Arrange</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Language</label>
                                <select
                                    value={filters.language}
                                    onChange={(e) => setFilters({...filters, language: e.target.value})}
                                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="">All Languages</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="c">C</option>
                                    <option value="cpp">C++</option>
                                    <option value="bash">Bash</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Status</label>
                                <select
                                    value={filters.active === undefined ? '' : filters.active.toString()}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        active: e.target.value === '' ? undefined : e.target.value === 'true'
                                    })}
                                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="">All</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="card-strong p-6">
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-center">
                                {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="space-y-4">
                                {questions.length > 0 ? (
                                    questions.map((question) => (
                                        <div
                                            key={question.id}
                                            className="card p-4 hover:bg-white/[0.02] transition group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getQuestionTypeColor(question.type)}`}>
                                                        {getQuestionTypeIcon(question.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-semibold text-lg">{question.summary}</h3>
                                                            <span className={`text-xs px-2 py-1 rounded border ${getQuestionTypeColor(question.type)} uppercase font-bold`}>
                                                                {question.type.toUpperCase()}
                                                            </span>
                                                            {question.active ? (
                                                                <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm muted">
                                                            <span>Language: {question.language || 'N/A'}</span>
                                                            <span>Points: {question.points}</span>
                                                            <span>Test Cases: {question.test_cases_count}</span>
                                                            {question.topic && <span>Topic: {question.topic}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/teacher/questions/${question.id}/edit`}
                                                        className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition flex items-center gap-2"
                                                    >
                                                        <FaEdit className="w-3 h-3" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(question.id)}
                                                        className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition flex items-center gap-2"
                                                    >
                                                        <FaTrash className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted">
                                        <p>No questions found. Create your first question!</p>
                                        <Link
                                            to="/teacher/questions/create"
                                            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Create Question
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Questions;

