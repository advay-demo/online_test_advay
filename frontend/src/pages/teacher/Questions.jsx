import React, { useEffect, useState } from 'react';
import { FaSearch, FaEdit, FaTrash, FaBook, FaCode, FaCheckCircle, FaEllipsisV, FaTimes, FaPlus, FaUpload, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import useQuestionsStore from '../../store/questionsStore';
import QuestionActionButtons from '../../components/teacher/QuestionActionButtons';

const defaultFormData = {
    summary: '',
    description: '',
    type: '',
    language: 'python',
    points: 1.0,
    active: true,
    topic: '',
    snippet: '',
    solution: '',
    partial_grading: false,
    min_time: 0,
};

const getDefaultTestCase = (questionType) => {
    switch (questionType) {
        case 'mcq':
            return {
                type: 'mcqtestcase',
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                correct: 0 // index of correct option
            };
        case 'mcc':
            return {
                type: 'mcqtestcase',
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                correct: [] // array of indices
            };
        case 'code':
            return {
                type: 'stdiobasedtestcase',
                expected_input: '',
                expected_output: '',
                weight: 1.0,
                hidden: false
            };
        case 'assignment_upload':
            return {
                type: 'uploadtestcase',
                description: '',
                required: true
            };
        case 'integer':
            return {
                type: 'integertestcase',
                correct: 0
            };
        case 'float':
            return {
                type: 'floattestcase',
                correct: 0.0,
                error_margin: 0.0
            };
        case 'string':
            return {
                type: 'stringtestcase',
                correct: '',
                string_check: 'lower'
            };
        case 'arrange':
            return {
                type: 'arrangetestcase',
                options: ['Option 1', 'Option 2', 'Option 3']
            };
        default:
            return { type: 'stdiobasedtestcase', expected_output: '', weight: 1.0 };
    }
};

const Questions = () => {
    const {
        questions,
        loading,
        error,
        filters,
        setFilters,
        loadQuestions,
        deleteQuestion,
        getQuestion,
        updateQuestion
    } = useQuestionsStore();

    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState(defaultFormData);
    const [editTestCases, setEditTestCases] = useState([]);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState(null);

    useEffect(() => {
        loadQuestions();
    }, [filters, loadQuestions]);

    // Open edit modal and load question data
    const handleEdit = async (question) => {
        setEditError(null);
        setSaving(false);
        setEditId(question.id);
        setShowEditModal(true);
        try {
            const q = await getQuestion(question.id);
            setEditForm({
                summary: q.summary || '',
                description: q.description || '',
                type: q.type || '',
                language: q.language || 'python',
                points: q.points || 1.0,
                active: q.active !== undefined ? q.active : true,
                topic: q.topic || '',
                snippet: q.snippet || '',
                solution: q.solution || '',
                partial_grading: q.partial_grading || false,
                min_time: q.min_time || 0,
                grade_assignment_upload: q.grade_assignment_upload || false,
                files: q.files || [],
            });
            setEditTestCases(q.test_cases || []);
        } catch (err) {
            setEditError('Failed to load question');
        }
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const addEditTestCase = () => {
        const newTestCase = getDefaultTestCase(editForm.type);
        setEditTestCases([...editTestCases, newTestCase]);
    };

    const updateEditTestCase = (index, field, value) => {
        const updated = [...editTestCases];
        updated[index] = { ...updated[index], [field]: value };
        setEditTestCases(updated);
    };

    const removeEditTestCase = (index) => {
        setEditTestCases(editTestCases.filter((_, i) => i !== index));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setEditError(null);
        try {
            await updateQuestion(editId, {
                ...editForm,
                test_cases: editTestCases,
                files: editForm.files, 
            });
            setShowEditModal(false);
            setEditId(null);
            setEditForm(defaultFormData);
            setEditTestCases([]);
            await loadQuestions();
        } catch (err) {
            setEditError('Failed to update question');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question? This will also remove it from all quizzes.')) {
            return;
        }
        try {
            await deleteQuestion(questionId);
        } catch (err) {
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
            <main className="flex-1 w-full lg:w-auto">
                <Header isAuth />
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Page Header */}
                    <div className="mb-6 lg:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Questions</h1>
                        <p className="text-sm muted">Create and manage your questions</p>
                    </div>

                    {/* Action Buttons */}
                    <QuestionActionButtons activeButton="library" />

                    {/* Questions Library Section */}
                    <div className="card-strong p-4 sm:p-5 lg:p-6 min-h-[600px]">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold mb-1">Question Library</h2>
                            <p className="text-xs sm:text-sm muted">Browse and manage all your questions</p>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
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
                                        <option value="mcq">Single Correct Choice</option>
                                        <option value="mcc">Multiple Correct Choices</option>
                                        <option value="code">Code</option>
                                        <option value="assignment_upload">Assignment Upload</option>
                                        <option value="integer">Answer in Integer</option>
                                        <option value="string">Answer in String</option>
                                        <option value="float">Answer in Float</option>
                                        <option value="arrange">Arrange in Correct Order</option>
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

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-center">
                                {error}
                            </div>
                        )}

                        {/* Questions List */}
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
                                                                <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400 border-gray-500/30">
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
                                                <div className="relative gs-action-menu">
                                                    <button
                                                        className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                        onClick={() => setActionMenuOpen(actionMenuOpen === question.id ? null : question.id)}
                                                        aria-label="Actions"
                                                        tabIndex={0}
                                                    >
                                                        <FaEllipsisV className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </button>
                                                    {actionMenuOpen === question.id && (
                                                        <div className="absolute right-0 mt-2 z-50 w-32 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 flex flex-col text-sm animate-fade-in">
                                                            <button
                                                                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-500/10 transition"
                                                                onClick={() => {
                                                                    setActionMenuOpen(null);
                                                                    handleEdit(question);
                                                                }}
                                                            >
                                                                <FaEdit className="w-4 h-4" /> Edit
                                                            </button>
                                                            <button
                                                                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition"
                                                                onClick={() => {
                                                                    setActionMenuOpen(null);
                                                                    handleDelete(question.id);
                                                                }}
                                                            >
                                                                <FaTrash className="w-4 h-4" /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted">
                                        <p>No questions found. Create your first question!</p>
                                        <a
                                            href="/teacher/questions/create"
                                            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Create Question
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
                    <div className="card-strong w-full max-w-full sm:max-w-2xl p-4 sm:p-6 relative rounded-xl shadow-2xl max-h-[75vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            className="absolute right-4 top-4 text-lg sm:text-xl p-2 rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                            onClick={() => setShowEditModal(false)}
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>
                        {/* Header */}
                        <div className="flex flex-row items-center gap-4 mb-4 sm:mt-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <FaEdit className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold mb-1 line-clamp-1">
                                    Edit Question
                                </h2>
                                <p className="text-xs sm:text-sm muted line-clamp-2">
                                    Update the details of this question.
                                </p>
                            </div>
                        </div>
                        {/* Error */}
                        {editError && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 mb-4">
                                {editError}
                            </div>
                        )}
                        {/* Form */}
                        <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                            <div className="flex flex-col gap-2">
                                <input
                                    className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus-visible:outline-none"
                                    name="summary"
                                    placeholder="Question Title *"
                                    value={editForm.summary}
                                    onChange={handleEditChange}
                                    required
                                />
                                <textarea
                                    className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus-visible:outline-none"
                                    name="description"
                                    placeholder="Description (HTML supported)"
                                    value={editForm.description}
                                    onChange={handleEditChange}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Question Type *
                                    </label>
                                    <select
                                        name="type"
                                        value={editForm.type}
                                        onChange={(e) => {
                                            handleEditChange(e);
                                            setEditTestCases([]);
                                        }}
                                        required
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="mcq">Single Correct Choice</option>
                                        <option value="mcc">Multiple Correct Choices</option>
                                        <option value="code">Code</option>
                                        <option value="assignment_upload">Assignment Upload</option>
                                        <option value="integer">Answer in Integer</option>
                                        <option value="string">Answer in String</option>
                                        <option value="float">Answer in Float</option>
                                        <option value="arrange">Arrange in Correct Order</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Language
                                    </label>
                                    <select
                                        name="language"
                                        value={editForm.language}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="c">C</option>
                                        <option value="cpp">C++</option>
                                        <option value="bash">Bash</option>
                                        <option value="r">R</option>
                                        <option value="scilab">Scilab</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Points *
                                    </label>
                                    <input
                                        type="number"
                                        name="points"
                                        value={editForm.points}
                                        onChange={handleEditChange}
                                        required
                                        min="0"
                                        step="0.5"
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Topic
                                    </label>
                                    <input
                                        type="text"
                                        name="topic"
                                        value={editForm.topic}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                        placeholder="Optional topic"
                                    />
                                </div>
                            </div>
                            {editForm.type === 'code' && (
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Code Snippet (Optional)
                                    </label>
                                    <textarea
                                        name="snippet"
                                        value={editForm.snippet}
                                        onChange={handleEditChange}
                                        rows="4"
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none font-mono text-sm"
                                        placeholder="Initial code snippet for students"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Solution (Optional)
                                </label>
                                <textarea
                                    name="solution"
                                    value={editForm.solution}
                                    onChange={handleEditChange}
                                    rows="4"
                                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                    placeholder="Solution or explanation"
                                />
                            </div>
                            <div className="bg-black/10 rounded-lg p-4 border border-white/5">
                                <label className="block text-sm font-semibold mb-3 text-gray-300">Question Settings</label>
                                <div className="flex flex-wrap items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="active"
                                                checked={editForm.active}
                                                onChange={handleEditChange}
                                                className="peer sr-only"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition">Active</span>
                                    </label>
                                    
                                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="partial_grading"
                                                checked={editForm.partial_grading}
                                                onChange={handleEditChange}
                                                className="peer sr-only"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-green-600 transition-all duration-300"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition">Allow Partial Grading</span>
                                    </label>
                                    
                                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="grade_assignment_upload"
                                                checked={editForm.grade_assignment_upload || false}
                                                onChange={handleEditChange}
                                                className="peer sr-only"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-purple-600 transition-all duration-300"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition">Grade Assignment Upload</span>
                                    </label>
                                </div>
                            </div>

                            {/* Uploaded Files Section */}
                                                        
                            {editForm.files && editForm.files.length > 0 && (
                                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl p-5 border border-blue-500/20">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                <FaFileAlt className="text-blue-400 w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold">Uploaded Files</h2>
                                                <p className="text-xs text-gray-400">{editForm.files.length} file{editForm.files.length !== 1 ? 's' : ''} attached</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {editForm.files.map((file) => (
                                                <div key={file.id} className="group bg-black/20 hover:bg-black/30 rounded-lg p-3 border border-white/5 hover:border-blue-500/30 transition-all duration-200">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        {/* Delete Button */}
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1.5 border border-red-500/30 text-red-400 rounded-md hover:bg-red-500/10 hover:border-red-500/50 text-xs font-medium transition-all duration-200 hover:scale-105"
                                                            onClick={async () => {
                                                                if (window.confirm('Delete this file?')) {
                                                                    try {
                                                                        await useQuestionsStore.getState().deleteQuestionFile(file.id);
                                                                        setEditForm((prev) => ({
                                                                            ...prev,
                                                                            files: prev.files.filter((f) => f.id !== file.id),
                                                                        }));
                                                                    } catch {
                                                                        alert('Failed to delete file');
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <FaTrash className="inline w-3 h-3 mr-1" /> Delete
                                                        </button>
                                                        
                                                        {/* Extract Checkbox */}
                                                        <label className="flex items-center gap-2 text-xs cursor-pointer select-none group/extract px-3 py-1.5 rounded-md hover:bg-white/5 transition">
                                                            <div className="relative">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={file.extract}
                                                                    onChange={(e) => {
                                                                        setEditForm((prev) => ({
                                                                            ...prev,
                                                                            files: prev.files.map((f) =>
                                                                                f.id === file.id ? { ...f, extract: e.target.checked } : f
                                                                            ),
                                                                        }));
                                                                    }}
                                                                    className="peer sr-only"
                                                                />
                                                                <div className="w-4 h-4 border-2 border-gray-500 rounded peer-checked:bg-green-500 peer-checked:border-green-500 transition-all duration-200"></div>
                                                                <svg className="absolute top-0 left-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                                </svg>
                                                            </div>
                                                            <span className="text-gray-300 group-hover/extract:text-white transition">Extract</span>
                                                        </label>
                                                        
                                                        {/* Hide Checkbox */}
                                                        <label className="flex items-center gap-2 text-xs cursor-pointer select-none group/hide px-3 py-1.5 rounded-md hover:bg-white/5 transition">
                                                            <div className="relative">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={file.hide}
                                                                    onChange={(e) => {
                                                                        setEditForm((prev) => ({
                                                                            ...prev,
                                                                            files: prev.files.map((f) =>
                                                                                f.id === file.id ? { ...f, hide: e.target.checked } : f
                                                                            ),
                                                                        }));
                                                                    }}
                                                                    className="peer sr-only"
                                                                />
                                                                <div className="w-4 h-4 border-2 border-gray-500 rounded peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all duration-200"></div>
                                                                <svg className="absolute top-0 left-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                                </svg>
                                                            </div>
                                                            <span className="text-gray-300 group-hover/hide:text-white transition">Hide</span>
                                                        </label>
                                                        
                                                        {/* File Link */}
                                                        <a
                                                            href={file.url.startsWith('http') 
                                                                ? file.url 
                                                                : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${file.url}`
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 min-w-0 flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-medium truncate px-3 py-1.5 rounded-md hover:bg-blue-500/10 transition-all duration-200 group/link"
                                                        >
                                                            <FaExternalLinkAlt className="w-3 h-3 flex-shrink-0 group-hover/link:scale-110 transition-transform duration-200" />
                                                            <span className="truncate">{file.name}</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Upload File Section */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl p-5 border border-purple-500/20">
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <FaUpload className="text-purple-400 w-5 h-5" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-200 block">Upload New File</label>
                                            <p className="text-xs text-gray-400">Attach files to this question</p>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                try {
                                                    const uploaded = await useQuestionsStore.getState().uploadQuestionFile(editId, file);
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        files: [...(prev.files || []), uploaded],
                                                    }));
                                                    e.target.value = '';
                                                } catch {
                                                    alert('Failed to upload file');
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <label 
                                            htmlFor="file-upload"
                                            className="flex items-center justify-center gap-3 w-full px-6 py-4 border-2 border-dashed border-purple-500/30 rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-200 group-hover:scale-[1.02]"
                                        >
                                            <FaUpload className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                                            <div className="text-center">
                                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">
                                                    Click to browse or drag and drop
                                                </span>
                                                <p className="text-xs text-gray-400 mt-1">All file types supported</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            


                            {/* Test Cases */}
                                                   
                            {editForm.type && (
                                <div className="relative overflow-hidden bg-gradient-to-br from-green-500/5 to-cyan-500/5 rounded-xl p-5 border border-green-500/20">
                                    <div className="absolute top-0 left-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
                                    <div className="relative">
                                        <div className="flex justify-between items-center mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                    <FaCheckCircle className="text-green-400 w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold">Test Cases</h2>
                                                    <p className="text-xs text-gray-400">{editTestCases.length} test case{editTestCases.length !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addEditTestCase}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105"
                                            >
                                                <FaPlus className="w-3 h-3" />
                                                Add Test Case
                                            </button>
                                        </div>
                                        
                                        {editTestCases.length === 0 ? (
                                            <div className="text-center py-12 bg-black/20 rounded-lg border border-white/5">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                                                    <FaPlus className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <p className="text-gray-400 mb-2">No test cases added yet</p>
                                                <p className="text-xs text-gray-500">Click "Add Test Case" to create one</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {editTestCases.map((testCase, index) => (
                                                    <div key={index} className="relative group bg-black/20 hover:bg-black/30 rounded-lg p-4 border border-white/5 hover:border-green-500/30 transition-all duration-200">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                                                    <span className="text-sm font-bold text-green-400">{index + 1}</span>
                                                                </div>
                                                                <h3 className="font-semibold text-gray-200">Test Case {index + 1}</h3>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEditTestCase(index)}
                                                                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                            >
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="space-y-4 bg-black/10 rounded-lg p-4 border border-white/5">
                                                            {/* MCQ/MCC Test Case */}
                                                            {(testCase.type === 'mcqtestcase' || editForm.type === 'mcq' || editForm.type === 'mcc') && (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            Options (one per line)
                                                                        </label>
                                                                        <textarea
                                                                            value={Array.isArray(testCase.options) ? testCase.options.join('\n') : (testCase.options || '')}
                                                                            onChange={(e) => {
                                                                                const options = e.target.value.split('\n').filter(o => o.trim());
                                                                                updateEditTestCase(index, 'options', options);
                                                                            }}
                                                                            rows="4"
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                                                            placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
                                                                        />
                                                                    </div>
                                                                    {editForm.type === 'mcq' && (
                                                                        <div>
                                                                            <label className="block text-sm font-semibold mb-2">
                                                                                Correct Option Index (0-based)
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                value={testCase.correct || 0}
                                                                                onChange={(e) => updateEditTestCase(index, 'correct', parseInt(e.target.value))}
                                                                                min="0"
                                                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {editForm.type === 'mcc' && (
                                                                        <div>
                                                                            <label className="block text-sm font-semibold mb-2">
                                                                                Correct Option Indices (comma-separated, 0-based)
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={Array.isArray(testCase.correct) ? testCase.correct.join(',') : (testCase.correct || '')}
                                                                                onChange={(e) => {
                                                                                    const correct = e.target.value.split(',').map(c => parseInt(c.trim())).filter(c => !isNaN(c));
                                                                                    updateEditTestCase(index, 'correct', correct);
                                                                                }}
                                                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                                placeholder="0,2,3"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Code Test Case (StdIO) */}
                                                            {testCase.type === 'stdiobasedtestcase' && (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            Expected Input (Optional)
                                                                        </label>
                                                                        <textarea
                                                                            value={testCase.expected_input || ''}
                                                                            onChange={(e) => updateEditTestCase(index, 'expected_input', e.target.value)}
                                                                            rows="3"
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none font-mono text-sm"
                                                                            placeholder="Input for the program"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            Expected Output *
                                                                        </label>
                                                                        <textarea
                                                                            value={testCase.expected_output || ''}
                                                                            onChange={(e) => updateEditTestCase(index, 'expected_output', e.target.value)}
                                                                            required
                                                                            rows="3"
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none font-mono text-sm"
                                                                            placeholder="Expected output"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="block text-sm font-semibold mb-2">
                                                                                Weight
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                value={testCase.weight || 1.0}
                                                                                onChange={(e) => updateEditTestCase(index, 'weight', parseFloat(e.target.value))}
                                                                                min="0"
                                                                                step="0.1"
                                                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center pt-8">
                                                                            <label className="flex items-center gap-2 cursor-pointer group/hidden">
                                                                                <div className="relative">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={testCase.hidden || false}
                                                                                        onChange={(e) => updateEditTestCase(index, 'hidden', e.target.checked)}
                                                                                        className="peer sr-only"
                                                                                    />
                                                                                    <div className="w-4 h-4 border-2 border-gray-500 rounded peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all duration-200"></div>
                                                                                    <svg className="absolute top-0 left-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                                                    </svg>
                                                                                </div>
                                                                                <span className="text-sm text-gray-300 group-hover/hidden:text-white transition">Hidden</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Upload Test Case */}
                                                            {testCase.type === 'uploadtestcase' && (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            Description
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={testCase.description || ''}
                                                                            onChange={(e) => updateEditTestCase(index, 'description', e.target.value)}
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                            placeholder="Describe the required upload"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="flex items-center gap-2 text-sm cursor-pointer group/required">
                                                                            <div className="relative">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={testCase.required || false}
                                                                                    onChange={(e) => updateEditTestCase(index, 'required', e.target.checked)}
                                                                                    className="peer sr-only"
                                                                                />
                                                                                <div className="w-4 h-4 border-2 border-gray-500 rounded peer-checked:bg-red-500 peer-checked:border-red-500 transition-all duration-200"></div>
                                                                                <svg className="absolute top-0 left-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-gray-300 group-hover/required:text-white transition">Required</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Integer Test Case */}
                                                            {testCase.type === 'integertestcase' && (
                                                                <div>
                                                                    <label className="block text-sm font-semibold mb-2">
                                                                        Correct Answer *
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        value={testCase.correct || 0}
                                                                        onChange={(e) => updateEditTestCase(index, 'correct', parseInt(e.target.value))}
                                                                        required
                                                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                    />
                                                                </div>
                                                            )}
                                                            
                                                            {/* Float Test Case */}
                                                            {testCase.type === 'floattestcase' && (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            Correct Answer *
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={testCase.correct || 0.0}
                                                                            onChange={(e) => updateEditTestCase(index, 'correct', parseFloat(e.target.value))}
                                                                            required
                                                                            step="0.01"
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            Error Margin
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={testCase.error_margin || 0.0}
                                                                            onChange={(e) => updateEditTestCase(index, 'error_margin', parseFloat(e.target.value))}
                                                                            min="0"
                                                                            step="0.01"
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* String Test Case */}
                                                            {testCase.type === 'stringtestcase' && (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            Correct Answer *
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={testCase.correct || ''}
                                                                            onChange={(e) => updateEditTestCase(index, 'correct', e.target.value)}
                                                                            required
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            String Check Type
                                                                        </label>
                                                                        <select
                                                                            value={testCase.string_check || 'lower'}
                                                                            onChange={(e) => updateEditTestCase(index, 'string_check', e.target.value)}
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                        >
                                                                            <option value="lower">Case Insensitive</option>
                                                                            <option value="exact">Exact Match</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Arrange Test Case */}
                                                            {testCase.type === 'arrangetestcase' && (
                                                                <div>
                                                                    <label className="block text-sm font-semibold mb-2">
                                                                        Options (one per line, in correct order)
                                                                    </label>
                                                                    <textarea
                                                                        value={Array.isArray(testCase.options) ? testCase.options.join('\n') : (testCase.options || '')}
                                                                        onChange={(e) => {
                                                                            const options = e.target.value.split('\n').filter(o => o.trim());
                                                                            updateEditTestCase(index, 'options', options);
                                                                        }}
                                                                        rows="4"
                                                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                                                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 justify-end mt-6 flex-wrap">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 font-medium transition"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                    disabled={saving || !editForm.type || editTestCases.length === 0}
                                >
                                    {saving ? 'Saving...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Questions;