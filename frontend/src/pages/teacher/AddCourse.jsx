import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import { createCourse, updateCourse, getTeacherCourse } from '../../api/api';

const AddCourse = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [searchParams] = useSearchParams();
    const editCourseId = courseId || searchParams.get('courseId');
    const isEditMode = !!editCourseId;

    const [formData, setFormData] = useState({
        name: '',
        enrollment: 'default',
        code: '',
        instructions: '',
        start_enroll_time: '',
        end_enroll_time: '',
        grading_system_id: null,
        view_grade: false,
        active: true,
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            loadCourse();
        }
    }, [editCourseId]);

    const loadCourse = async () => {
        try {
            setLoading(true);
            const course = await getTeacherCourse(editCourseId);
            setFormData({
                name: course.name || '',
                enrollment: course.enrollment || 'default',
                code: course.code || '',
                instructions: course.instructions || '',
                start_enroll_time: course.start_enroll_time ? new Date(course.start_enroll_time).toISOString().slice(0, 16) : '',
                end_enroll_time: course.end_enroll_time ? new Date(course.end_enroll_time).toISOString().slice(0, 16) : '',
                grading_system_id: course.grading_system_id || null,
                view_grade: course.view_grade || false,
                active: course.active !== undefined ? course.active : true,
            });
        } catch (err) {
            console.error('Failed to load course:', err);
            setError('Failed to load course data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);

            const submitData = {
                ...formData,
                start_enroll_time: formData.start_enroll_time ? new Date(formData.start_enroll_time).toISOString() : null,
                end_enroll_time: formData.end_enroll_time ? new Date(formData.end_enroll_time).toISOString() : null,
            };

            if (isEditMode) {
                await updateCourse(editCourseId, submitData);
            } else {
                const result = await createCourse(submitData);
                // Navigate to manage course after creation
                navigate(`/teacher/courses/${result.id}/manage`);
                return;
            }

            // For edit, navigate back to courses list
            navigate('/teacher/courses');
        } catch (err) {
            console.error('Failed to save course:', err);
            setError(err.response?.data?.error || 'Failed to save course');
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
                            <p className="text-gray-400">Loading course...</p>
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
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-start gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/teacher/courses')}
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
                                >
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
                                    <h1 className="text-2xl font-bold mb-1">
                                        {isEditMode ? 'Edit Course' : 'Create New Course'}
                                    </h1>
                                    <p className="text-sm muted">
                                        {isEditMode ? 'Update course details and settings' : 'Add details, set timings and configure course settings'}
                                    </p>
                                </div>
                            </div>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                                    {error}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
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
                                            Course Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            placeholder="Enter course name"
                                        />
                                    </div>

                                    {/* Instructions */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold soft mb-2">
                                            Instructions
                                        </label>
                                        <textarea
                                            rows="4"
                                            name="instructions"
                                            value={formData.instructions}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg resize-none focus:outline-none focus:border-blue-500/50"
                                            placeholder="Enter course instructions..."
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
                                                name="code"
                                                value={formData.code}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                placeholder="Course code"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold soft mb-2">
                                                Enrollment
                                            </label>
                                            <select
                                                name="enrollment"
                                                value={formData.enrollment}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            >
                                                <option value="default">Default</option>
                                                <option value="open">Open</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Course Settings */}
                                <div className="card-strong p-6">
                                    <div className="mb-6">
                                        <h2 className="text-lg font-bold mb-1">Course Settings</h2>
                                        <p className="text-sm muted">Configure how your course works</p>
                                    </div>

                                    {/* Start date & Time */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold soft mb-2">
                                            Start Enrollment Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="start_enroll_time"
                                            value={formData.start_enroll_time}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>

                                    {/* End date & Time */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold soft mb-2">
                                            End Enrollment Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="end_enroll_time"
                                            value={formData.end_enroll_time}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>

                                    {/* Grading System */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold soft mb-2">
                                            Grading System
                                        </label>
                                        <input
                                            type="number"
                                            name="grading_system_id"
                                            value={formData.grading_system_id || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                            placeholder="Grading system ID (optional)"
                                        />
                                        <p className="text-xs muted mt-1">Leave empty if not using a grading system</p>
                                    </div>

                                    {/* View Grade Toggle */}
                                    <div
                                        className="flex items-center justify-between p-4 rounded-lg mb-5"
                                        style={{
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        <div>
                                            <div className="font-semibold mb-1">View Grade</div>
                                            <div className="text-xs muted">Allow students to view their grades</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="view_grade"
                                            checked={formData.view_grade}
                                            onChange={handleChange}
                                            className="toggle-checkbox"
                                        />
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
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={formData.active}
                                            onChange={handleChange}
                                            className="toggle-checkbox"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Action Buttons */}
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => navigate('/teacher/courses')}
                                    className="border border-white/10 px-6 py-2.5 rounded-lg font-semibold hover:bg-white/5 transition flex items-center gap-2"
                                >
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
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : (isEditMode ? 'Update Course' : 'Create Course')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddCourse;
