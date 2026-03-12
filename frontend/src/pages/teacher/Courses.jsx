import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaBook, FaClock, FaUserFriends, FaEllipsisV, FaEdit, FaTimes } from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import CourseActionButtons from '../../components/teacher/CourseActionButtons';
import { fetchTeacherCourses, getTeacherCourse, updateCourse } from '../../api/api';
import useGradingSystemStore from '../../store/teacherGradeStore';


const Courses = () => {
    const [activeTab, setActiveTab] = useState('All Quizzes');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Edit Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        enrollment: '',
        code: '',
        instructions: '',
        start_enroll_time: '',
        end_enroll_time: '',
        grading_system_id: '',
        view_grade: false,
        active: true,
    });
    const [editError, setEditError] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Dropdown States
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    
    const { gradingSystems, loadGradingSystems, loading: gradingLoading } = useGradingSystemStore();

    useEffect(() => {
        loadCourses();
        loadGradingSystems();
        // eslint-disable-next-line
    }, [activeTab, searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const status = activeTab === 'All Quizzes' ? 'all' : activeTab.toLowerCase();
            const data = await fetchTeacherCourses(status, searchQuery);
            setCourses(data);
            setError(null);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchQuery(e.target.value);

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

    const toggleDropdown = (courseId) => {
        setOpenDropdownId(openDropdownId === courseId ? null : courseId);
    };

    const handleEditClick = async (courseId) => {
        try {
            setOpenDropdownId(null);
            setEditingCourseId(courseId);
            setEditError(null);
            
            const course = await getTeacherCourse(courseId);
            setEditForm({
                name: course.name || '',
                enrollment: course.enrollment || 'default',
                code: course.code || '',
                instructions: course.instructions || '',
                start_enroll_time: course.start_enroll_time ? new Date(course.start_enroll_time).toISOString().slice(0, 16) : '',
                end_enroll_time: course.end_enroll_time ? new Date(course.end_enroll_time).toISOString().slice(0, 16) : '',
                grading_system_id: course.grading_system_id || '',
                view_grade: course.view_grade || false,
                active: course.active !== undefined ? course.active : true,
            });
            
            setShowEditModal(true);
        } catch (err) {
            console.error('Failed to load course:', err);
            alert('Failed to load course data');
        }
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setEditError(null);

            const submitData = {
                ...editForm,
                start_enroll_time: editForm.start_enroll_time ? new Date(editForm.start_enroll_time).toISOString() : null,
                end_enroll_time: editForm.end_enroll_time ? new Date(editForm.end_enroll_time).toISOString() : null,
            };

            await updateCourse(editingCourseId, submitData);
            setShowEditModal(false);
            loadCourses(); // Reload courses to show updated data
        } catch (err) {
            console.error('Failed to update course:', err);
            setEditError(err.response?.data?.error || 'Failed to update course');
        } finally {
            setSaving(false);
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
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Courses</h1>
                        <p className="text-sm muted">Create, manage and analyze your courses</p>
                    </div>

                    {/* Action Buttons */}
                    <CourseActionButtons activeButton="library" />

                    {/* Course Library Section */}
                    <div className="card-strong p-4 sm:p-5 lg:p-6 min-h-[600px] border-2 border-[var(--border-strong)] shadow-lg rounded-2xl">
                        <div className="mb-5 sm:mb-7 pb-4 border-b-2 border-[var(--border-subtle)] flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center flex-shrink-0">
                                <FaBook className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold mb-0.5">Course Library</h2>
                                <p className="text-xs sm:text-sm muted">Browse and manage all your courses</p>
                            </div>
                        </div>

                        

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 mb-6">
                            <div className="flex bg-[var(--input-bg)] p-1.5 rounded-xl overflow-x-auto scrollbar-hide border-2 border-[var(--border-strong)]">
                                {['All Quizzes', 'Active'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                                            activeTab === tab
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-3.5 h-3.5 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        className="w-full pl-9 pr-3 sm:pr-4 py-2.5 bg-[var(--input-bg)] border-2 border-[var(--border-strong)] rounded-xl text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
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

                        {/* Course List */}
                        {!loading && !error && (
                            <div className="space-y-3 sm:space-y-4">
                                {courses.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="inline-block p-5 bg-blue-500/10 rounded-full mb-4">
                                            <FaBook className="w-12 h-12 text-blue-400 opacity-50" />
                                        </div>
                                        <p className="text-lg font-semibold text-[var(--text-secondary)] mb-2">No courses found</p>
                                        <p className="text-sm muted">Create your first course to get started</p>
                                    </div>
                                ) : (
                                    courses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="card-strong p-4 sm:p-5 hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 group border-l-4 border-l-blue-500 rounded-xl"
                                        >
                                            <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4">
                                                {/* Icon */}
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0 border-2 border-blue-500/30 group-hover:border-blue-500/50 group-hover:scale-110 transition-all duration-300">
                                                    <FaBook className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                                                </div>
                                                {/* Content */}
                                                <div className="flex-1 min-w-0 w-full">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h3 className="font-bold text-base sm:text-lg line-clamp-1 group-hover:text-blue-400 transition-colors duration-300">
                                                            {course.name}
                                                        </h3>
                                                        <span
                                                            className={`text-[10px] px-2.5 py-1 rounded-lg border-2 ${getStatusColor(
                                                                course.status
                                                            )} uppercase font-bold tracking-wider whitespace-nowrap flex-shrink-0 transition-all duration-300`}
                                                        >
                                                            {course.status}
                                                        </span>
                                                    </div>
                                                    {course.code && (
                                                        <p className="text-xs sm:text-sm muted mb-2 sm:mb-3 line-clamp-2">Code: {course.code}</p>
                                                    )}
                                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs muted">
                                                        <div className="flex items-center gap-1.5">
                                                            <FaBook className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                                            <span>{course.modules_count} modules</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <FaUserFriends className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                                            <span>{course.students_count} students</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>{course.completions} completions</span>
                                                        </div>
                                                        {course.created_on && (
                                                            <>
                                                                <div className="hidden sm:block text-white/20">|</div>
                                                                <div>{new Date(course.created_on).toLocaleDateString()}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:self-start">
                                                    <Link
                                                        to={`/teacher/courses/${course.id}/manage`}
                                                        className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 border-2 border-blue-500/30 bg-blue-500/10 rounded-lg text-xs sm:text-sm font-semibold text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all duration-300 text-center whitespace-nowrap"
                                                    >
                                                        Manage
                                                    </Link>
                                                    <div className="relative" ref={openDropdownId === course.id ? dropdownRef : null}>
                                                        <button 
                                                            onClick={() => toggleDropdown(course.id)}
                                                            className="p-2.5 border-2 border-[var(--border-strong)] rounded-lg hover:bg-[var(--input-bg)] hover:border-blue-500/30 active:scale-95 transition-all duration-300 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                        >
                                                            <FaEllipsisV className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </button>
                                                        
                                                        {/* Dropdown Menu */}
                                                        {openDropdownId === course.id && (
                                                            
                                                            <div className="absolute right-0 mt-2 z-50 w-36 bg-[var(--card-strong-bg)] border-2 border-[var(--border-strong)] rounded-xl shadow-2xl py-1.5 flex flex-col text-sm animate-fade-in">
                                                                <button
                                                                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                                                    onClick={() => handleEditClick(course.id)}
                                                                >
                                                                    <FaEdit className="w-4 h-4" /> Edit
                                                                </button>
                                                                
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {showEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
                <div className="card-strong w-full max-w-full sm:max-w-2xl lg:max-w-4xl my-4 sm:my-8 p-4 sm:p-5 md:p-7 relative rounded-2xl shadow-2xl border-2 border-[var(--border-strong)] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <button
                        className="absolute right-3 top-3 sm:right-5 sm:top-5 z-10 text-base sm:text-lg p-2 sm:p-2.5 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--input-bg)] hover:bg-red-500/10 hover:border-red-500/30 text-[var(--text-muted)] hover:text-red-400 transition-all duration-300"
                        onClick={() => setShowEditModal(false)}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                    
                    {/* Header */}
                    <div className="flex flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pr-10 sm:pr-0 pb-4 border-b-2 border-[var(--border-subtle)]">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/30 flex-shrink-0">
                            <FaEdit className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 line-clamp-1">
                                Edit Course
                            </h2>
                            <p className="text-xs sm:text-sm muted line-clamp-2">
                                Update the details of this course.
                            </p>
                        </div>
                    </div>
                    
                    {/* Error */}
                    {editError && (
                        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-3 sm:p-4 text-red-300 mb-4 sm:mb-5 text-sm">
                            {editError}
                        </div>
                    )}
                    
                    {/* Form */}
                    <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                            {/* Left Column */}
                            <div className="space-y-4 sm:space-y-5">
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold mb-2">
                                        Course Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditChange}
                                        required
                                        placeholder="Enter course title"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--input-bg)] border-2 border-[var(--border-strong)] rounded-xl focus:outline-none focus:border-blue-500/50 text-sm sm:text-base transition-colors"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold mb-2">
                                        Instructions
                                    </label>
                                    <textarea
                                        name="instructions"
                                        rows="10"
                                        value={editForm.instructions}
                                        onChange={handleEditChange}
                                        placeholder="Enter course instructions"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--input-bg)] border-2 border-[var(--border-strong)] rounded-xl focus:outline-none focus:border-blue-500/50 resize-none text-sm sm:text-base transition-colors"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold mb-2">
                                            Code
                                        </label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={editForm.code}
                                            onChange={handleEditChange}
                                            placeholder="xxxx"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--input-bg)] border-2 border-[var(--border-strong)] rounded-xl focus:outline-none focus:border-blue-500/50 text-sm sm:text-base transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold mb-2">
                                            Enrollment
                                        </label>
                                        <select
                                            name="enrollment"
                                            value={editForm.enrollment}
                                            onChange={handleEditChange}
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--input-bg)] border-2 border-[var(--border-strong)] rounded-xl focus:outline-none focus:border-blue-500/50 text-sm sm:text-base transition-colors"
                                        >
                                            <option value="">---------</option>
                                            <option value="default">Enroll Request</option>
                                            <option value="open">Open Enrollment</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-4 sm:space-y-5">
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold mb-2">
                                        Start Enrollment Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="start_enroll_time"
                                        value={editForm.start_enroll_time}
                                        onChange={handleEditChange}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--input-bg)] border-2 border-[var(--border-strong)] rounded-xl focus:outline-none focus:border-blue-500/50 text-sm sm:text-base transition-colors"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold mb-2">
                                        End Enrollment Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="end_enroll_time"
                                        value={editForm.end_enroll_time}
                                        onChange={handleEditChange}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--input-bg)] border-2 border-[var(--border-strong)] rounded-xl focus:outline-none focus:border-blue-500/50 text-sm sm:text-base transition-colors"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold mb-2">
                                        Grading System
                                    </label>
                                    <select
                                        name="grading_system_id"
                                        value={editForm.grading_system_id}
                                        onChange={handleEditChange}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--input-bg)] border-2 border-[var(--border-strong)] rounded-xl focus:outline-none focus:border-blue-500/50 text-sm sm:text-base transition-colors"
                                    >
                                        <option value="">---------</option>
                                        {gradingSystems.map(gs => (
                                            <option key={gs.id} value={gs.id}>
                                                {gs.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs muted mt-1.5">Leave empty if not using a grading system</p>
                                </div>
                                
                                
                                
                                    
                                    <div className="flex flex-col gap-3 sm:gap-4">
                                        <div className="p-4 rounded-xl bg-[var(--input-bg)] border-2 border-[var(--border-strong)]">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-sm sm:text-base font-semibold mb-1">View Grade</div>
                                                    <div className="text-xs muted">Allow students to view their grades</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        name="view_grade"
                                                        checked={editForm.view_grade}
                                                        onChange={handleEditChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-[var(--input-bg)] border-2 border-[var(--border-strong)]">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-sm sm:text-base font-semibold mb-1">Active</div>
                                                    <div className="text-xs muted">Course ready for Enrollment</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        name="active"
                                                        checked={editForm.active}
                                                        onChange={handleEditChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        
                                    </div>
                                
                            </div>
                        </div>
                        
                        <div className="flex flex-row gap-2 sm:gap-3 justify-end mt-5 sm:mt-6 pt-4 sm:pt-5 border-t-2 border-[var(--border-subtle)]">
                            <button
                                type="button"
                                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 hover:border-[var(--border-subtle)] font-semibold transition-all duration-300 text-sm sm:text-base"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-xl hover:shadow-blue-600/30 active:scale-95 transition-all duration-300 disabled:opacity-60 text-sm sm:text-base"
                                disabled={saving}
                            >
                                {saving ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            )}
        </div>
    );
};

export default Courses;