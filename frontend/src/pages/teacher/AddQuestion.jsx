import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaChevronLeft, FaPlus, FaTrash } from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import { getTeacherQuestion, createQuestion, updateQuestion } from '../../api/api';

const AddQuestion = () => {
    const { questionId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!questionId;

    const [formData, setFormData] = useState({
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
    });

    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            loadQuestion();
        }
    }, [questionId]);

    const loadQuestion = async () => {
        try {
            setLoading(true);
            const question = await getTeacherQuestion(questionId);
            setFormData({
                summary: question.summary || '',
                description: question.description || '',
                type: question.type || '',
                language: question.language || 'python',
                points: question.points || 1.0,
                active: question.active !== undefined ? question.active : true,
                topic: question.topic || '',
                snippet: question.snippet || '',
                solution: question.solution || '',
                partial_grading: question.partial_grading || false,
                min_time: question.min_time || 0,
            });
            setTestCases(question.test_cases || []);
        } catch (err) {
            console.error('Failed to load question:', err);
            setError('Failed to load question');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const addTestCase = () => {
        const newTestCase = getDefaultTestCase(formData.type);
        setTestCases([...testCases, newTestCase]);
    };

    const getDefaultTestCase = (questionType) => {
        switch (questionType) {
            case 'mcq':
            case 'mcc':
                return {
                    type: 'mcqtestcase',
                    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                    correct: false
                };
            case 'code':
                return {
                    type: 'stdiobasedtestcase',
                    expected_input: '',
                    expected_output: '',
                    weight: 1.0,
                    hidden: false
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

    const updateTestCase = (index, field, value) => {
        const updated = [...testCases];
        updated[index] = { ...updated[index], [field]: value };
        setTestCases(updated);
    };

    const removeTestCase = (index) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);

            const submitData = {
                ...formData,
                test_cases: testCases
            };

            if (isEditMode) {
                await updateQuestion(questionId, submitData);
            } else {
                await createQuestion(submitData);
            }

            navigate('/teacher/questions');
        } catch (err) {
            console.error('Failed to save question:', err);
            setError(err.response?.data?.error || 'Failed to save question');
        } finally {
            setSaving(false);
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
                            <p className="text-gray-400">Loading question...</p>
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

                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={() => navigate('/teacher/questions')}
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
                                >
                                    <FaChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold mb-1">
                                        {isEditMode ? 'Edit Question' : 'Create New Question'}
                                    </h1>
                                    <p className="text-sm muted">
                                        {isEditMode ? 'Update question details and test cases' : 'Add question details and configure test cases'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Basic Question Info */}
                                <div className="card-strong p-6">
                                    <h2 className="text-lg font-bold mb-4">Question Details</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Question Summary/Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="summary"
                                                value={formData.summary}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                placeholder="Enter question title"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Question Description *
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                required
                                                rows="6"
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                                placeholder="Enter question description (HTML supported)"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">
                                                    Question Type *
                                                </label>
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        // Reset test cases when type changes
                                                        setTestCases([]);
                                                    }}
                                                    required
                                                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="mcq">MCQ (Single Correct)</option>
                                                    <option value="mcc">MCC (Multiple Correct)</option>
                                                    <option value="code">Code (Programming)</option>
                                                    <option value="integer">Integer Answer</option>
                                                    <option value="float">Float Answer</option>
                                                    <option value="string">String Answer</option>
                                                    <option value="arrange">Arrange in Order</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">
                                                    Language
                                                </label>
                                                <select
                                                    name="language"
                                                    value={formData.language}
                                                    onChange={handleChange}
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
                                                    value={formData.points}
                                                    onChange={handleChange}
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
                                                    value={formData.topic}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                    placeholder="Optional topic"
                                                />
                                            </div>
                                        </div>

                                        {formData.type === 'code' && (
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">
                                                    Code Snippet (Optional)
                                                </label>
                                                <textarea
                                                    name="snippet"
                                                    value={formData.snippet}
                                                    onChange={handleChange}
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
                                                value={formData.solution}
                                                onChange={handleChange}
                                                rows="4"
                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                                placeholder="Solution or explanation"
                                            />
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="active"
                                                    checked={formData.active}
                                                    onChange={handleChange}
                                                    className="toggle-checkbox"
                                                />
                                                <span className="text-sm">Active</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="partial_grading"
                                                    checked={formData.partial_grading}
                                                    onChange={handleChange}
                                                    className="toggle-checkbox"
                                                />
                                                <span className="text-sm">Allow Partial Grading</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Cases */}
                                {formData.type && (
                                    <div className="card-strong p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-bold">Test Cases</h2>
                                            <button
                                                type="button"
                                                onClick={addTestCase}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                                            >
                                                <FaPlus className="w-3 h-3" />
                                                Add Test Case
                                            </button>
                                        </div>

                                        {testCases.length === 0 ? (
                                            <div className="text-center py-8 text-muted">
                                                <p>No test cases added. Click "Add Test Case" to add one.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {testCases.map((testCase, index) => (
                                                    <div key={index} className="card p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h3 className="font-semibold">Test Case {index + 1}</h3>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTestCase(index)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* MCQ/MCC Test Case */}
                                                        {(testCase.type === 'mcqtestcase' || formData.type === 'mcq' || formData.type === 'mcc') && (
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="block text-sm font-semibold mb-2">
                                                                        Options (one per line)
                                                                    </label>
                                                                    <textarea
                                                                        value={Array.isArray(testCase.options) ? testCase.options.join('\n') : (testCase.options || '')}
                                                                        onChange={(e) => {
                                                                            const options = e.target.value.split('\n').filter(o => o.trim());
                                                                            updateTestCase(index, 'options', options);
                                                                        }}
                                                                        rows="4"
                                                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                                                        placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
                                                                    />
                                                                </div>
                                                                {formData.type === 'mcq' && (
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            Correct Option Index (0-based)
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={testCase.correct || 0}
                                                                            onChange={(e) => updateTestCase(index, 'correct', parseInt(e.target.value))}
                                                                            min="0"
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {formData.type === 'mcc' && (
                                                                    <div>
                                                                        <label className="block text-sm font-semibold mb-2">
                                                                            Correct Option Indices (comma-separated, 0-based)
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={Array.isArray(testCase.correct) ? testCase.correct.join(',') : (testCase.correct || '')}
                                                                            onChange={(e) => {
                                                                                const correct = e.target.value.split(',').map(c => parseInt(c.trim())).filter(c => !isNaN(c));
                                                                                updateTestCase(index, 'correct', correct);
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
                                                                        onChange={(e) => updateTestCase(index, 'expected_input', e.target.value)}
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
                                                                        onChange={(e) => updateTestCase(index, 'expected_output', e.target.value)}
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
                                                                            onChange={(e) => updateTestCase(index, 'weight', parseFloat(e.target.value))}
                                                                            min="0"
                                                                            step="0.1"
                                                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center pt-8">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={testCase.hidden || false}
                                                                                onChange={(e) => updateTestCase(index, 'hidden', e.target.checked)}
                                                                                className="toggle-checkbox"
                                                                            />
                                                                            <span className="text-sm">Hidden</span>
                                                                        </label>
                                                                    </div>
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
                                                                    onChange={(e) => updateTestCase(index, 'correct', parseInt(e.target.value))}
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
                                                                        onChange={(e) => updateTestCase(index, 'correct', parseFloat(e.target.value))}
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
                                                                        onChange={(e) => updateTestCase(index, 'error_margin', parseFloat(e.target.value))}
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
                                                                        onChange={(e) => updateTestCase(index, 'correct', e.target.value)}
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
                                                                        onChange={(e) => updateTestCase(index, 'string_check', e.target.value)}
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
                                                                        updateTestCase(index, 'options', options);
                                                                    }}
                                                                    rows="4"
                                                                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Submit Buttons */}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/teacher/questions')}
                                        className="px-6 py-2.5 border border-white/10 rounded-lg font-semibold hover:bg-white/5 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving || !formData.type || testCases.length === 0}
                                        className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Saving...' : (isEditMode ? 'Update Question' : 'Create Question')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddQuestion;

