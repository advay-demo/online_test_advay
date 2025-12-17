import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    FaChevronLeft,
    FaShareAlt,
    FaEllipsisV,
    FaPlus,
    FaCalendarAlt,
    FaChevronUp,
    FaChevronDown,
    FaBook,
    FaEdit,
    FaTrash,
} from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import CourseAnalytics from '../../components/teacher/CourseAnalytics';
import QuizQuestionManager from '../../components/teacher/QuizQuestionManager';
import { getTeacherCourse, getCourseModules, createModule, updateModule, deleteModule, createLesson, updateLesson, deleteLesson, createQuiz, updateQuiz, deleteQuiz, getCourseEnrollments, approveEnrollment, rejectEnrollment, removeEnrollment, reorderCourseModules, reorderModuleUnits, getCourseAnalytics, getTeacherLesson, getTeacherQuiz } from '../../api/api';

const ManageCourse = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Modules');
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollments, setEnrollments] = useState({
        enrolled: [],
        pending_requests: [],
        rejected: []
    });
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [showQuizQuestionManager, setShowQuizQuestionManager] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [moduleOrder, setModuleOrder] = useState([]);
    const [unitOrders, setUnitOrders] = useState({}); // { moduleId: [{unit_id, order}] }
    const [savingOrder, setSavingOrder] = useState(false);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [showQuizForm, setShowQuizForm] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [moduleFormData, setModuleFormData] = useState({
        name: '',
        description: '',
        order: 1,
        check_prerequisite: false,
        active: true,
    });
    const [lessonFormData, setLessonFormData] = useState({
        name: '',
        description: '',
        video_path: '',
        active: true,
        order: 1,
    });
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
        if (courseId) {
            loadCourseData();
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId && activeTab === 'Enrollment') {
            loadEnrollments();
        }
        if (courseId && activeTab === 'Analytics') {
            loadAnalytics();
        }
    }, [courseId, activeTab]);

    const loadAnalytics = async () => {
        try {
            setLoadingAnalytics(true);
            const data = await getCourseAnalytics(courseId);
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    useEffect(() => {
        if (modules.length > 0 && activeTab === 'Design Course') {
            initializeOrdering();
        }
    }, [modules, activeTab]);

    const initializeOrdering = () => {
        // Initialize module order
        const orderedModules = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));
        setModuleOrder(orderedModules.map(m => m.id));
        
        // Initialize unit orders for each module
        const orders = {};
        modules.forEach(module => {
            if (module.units) {
                const orderedUnits = [...module.units].sort((a, b) => (a.order || 0) - (b.order || 0));
                orders[module.id] = orderedUnits.map(u => ({
                    unit_id: u.lesson_id || u.quiz_id,
                    order: u.order || 0
                }));
            }
        });
        setUnitOrders(orders);
    };

    const loadEnrollments = async () => {
        try {
            setLoadingEnrollments(true);
            const data = await getCourseEnrollments(courseId);
            setEnrollments({
                enrolled: data.enrolled || [],
                pending_requests: data.pending_requests || [],
                rejected: data.rejected || []
            });
        } catch (err) {
            console.error('Failed to load enrollments:', err);
        } finally {
            setLoadingEnrollments(false);
        }
    };

    const handleApproveEnrollment = async (userId) => {
        try {
            await approveEnrollment(courseId, userId);
            loadEnrollments();
        } catch (err) {
            console.error('Failed to approve enrollment:', err);
            alert('Failed to approve enrollment');
        }
    };

    const handleRejectEnrollment = async (userId) => {
        try {
            await rejectEnrollment(courseId, userId);
            loadEnrollments();
        } catch (err) {
            console.error('Failed to reject enrollment:', err);
            alert('Failed to reject enrollment');
        }
    };

    const handleRemoveEnrollment = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this student from the course?')) {
            return;
        }
        try {
            await removeEnrollment(courseId, userId);
            loadEnrollments();
        } catch (err) {
            console.error('Failed to remove enrollment:', err);
            alert('Failed to remove enrollment');
        }
    };

    // Design Course - Module Reordering
    const moveModule = (moduleId, direction) => {
        const currentIndex = moduleOrder.indexOf(moduleId);
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= moduleOrder.length) return;
        
        const newOrder = [...moduleOrder];
        [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
        setModuleOrder(newOrder);
    };

    const saveModuleOrder = async () => {
        try {
            setSavingOrder(true);
            const moduleOrders = moduleOrder.map((moduleId, index) => ({
                module_id: moduleId,
                order: index + 1
            }));
            await reorderCourseModules(courseId, moduleOrders);
            loadCourseData();
            alert('Module order saved successfully');
        } catch (err) {
            console.error('Failed to save module order:', err);
            alert('Failed to save module order');
        } finally {
            setSavingOrder(false);
        }
    };

    // Design Course - Unit Reordering
    const moveUnit = (moduleId, unitId, direction) => {
        const units = unitOrders[moduleId] || [];
        const currentIndex = units.findIndex(u => u.unit_id === unitId);
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= units.length) return;
        
        const newUnits = [...units];
        [newUnits[currentIndex], newUnits[newIndex]] = [newUnits[newIndex], newUnits[currentIndex]];
        setUnitOrders({ ...unitOrders, [moduleId]: newUnits });
    };

    const saveUnitOrder = async (moduleId) => {
        try {
            setSavingOrder(true);
            const units = unitOrders[moduleId] || [];
            const unitOrdersData = units.map((unit, index) => ({
                unit_id: unit.unit_id,
                order: index + 1
            }));
            await reorderModuleUnits(moduleId, unitOrdersData);
            loadCourseData();
            alert('Unit order saved successfully');
        } catch (err) {
            console.error('Failed to save unit order:', err);
            alert('Failed to save unit order');
        } finally {
            setSavingOrder(false);
        }
    };

    const loadCourseData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Loading course data for courseId:', courseId);
            
            // teacher_get_course already includes modules in the response
            const courseData = await getTeacherCourse(courseId);
            
            console.log('Course data received:', courseData);
            
            if (!courseData) {
                throw new Error('Course data not found');
            }
            
            // Check if response has error
            if (courseData.error) {
                throw new Error(courseData.error);
            }
            
            setCourse(courseData);
            
            // Extract modules from course data if available, otherwise fetch separately
            if (courseData.modules && Array.isArray(courseData.modules)) {
                console.log('Using modules from course data:', courseData.modules.length);
                setModules(courseData.modules);
            } else {
                console.log('Modules not in course data, fetching separately...');
                // Fallback: fetch modules separately if not included
                try {
                    const modulesData = await getCourseModules(courseId);
                    console.log('Modules fetched separately:', modulesData);
                    setModules(Array.isArray(modulesData) ? modulesData : []);
                } catch (moduleErr) {
                    console.error('Failed to load modules separately:', moduleErr);
                    // Set empty array if modules can't be loaded (course might not have modules yet)
                    setModules([]);
                }
            }
        } catch (err) {
            console.error('Failed to load course data:', err);
            console.error('Error details:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to load course data';
            setError(errorMessage);
            setCourse(null);
        } finally {
            setLoading(false);
        }
    };

    const handleModuleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setModuleFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        try {
            await createModule(courseId, moduleFormData);
            setShowModuleForm(false);
            setModuleFormData({
                name: '',
                description: '',
                order: modules.length + 1,
                check_prerequisite: false,
                active: true,
            });
            loadCourseData();
        } catch (err) {
            console.error('Failed to create module:', err);
            alert('Failed to create module');
        }
    };

    const handleUpdateModule = async (e) => {
        e.preventDefault();
        try {
            await updateModule(courseId, editingModule.id, moduleFormData);
            setShowModuleForm(false);
            setEditingModule(null);
            setModuleFormData({
                name: '',
                description: '',
                order: 1,
                check_prerequisite: false,
                active: true,
            });
            loadCourseData();
        } catch (err) {
            console.error('Failed to update module:', err);
            alert('Failed to update module');
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Are you sure you want to delete this module? This will also delete all lessons and quizzes in it.')) {
            return;
        }
        try {
            await deleteModule(courseId, moduleId);
            loadCourseData();
        } catch (err) {
            console.error('Failed to delete module:', err);
            alert('Failed to delete module');
        }
    };

    const openEditModule = (module) => {
        setEditingModule(module);
        setModuleFormData({
            name: module.name,
            description: module.description,
            order: module.order,
            check_prerequisite: module.check_prerequisite,
            active: module.active,
        });
        setShowModuleForm(true);
    };

    const openCreateModule = () => {
        setEditingModule(null);
        setModuleFormData({
            name: '',
            description: '',
            order: modules.length + 1,
            check_prerequisite: false,
            active: true,
        });
        setShowModuleForm(true);
    };

    const handleLessonFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLessonFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleQuizFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setQuizFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const openCreateLesson = (module) => {
        setSelectedModule(module);
        setEditingLesson(null);
        const lastUnit = module.units && module.units.length > 0 
            ? Math.max(...module.units.map(u => u.order)) 
            : 0;
        setLessonFormData({
            name: '',
            description: '',
            video_path: '',
            active: true,
            order: lastUnit + 1,
        });
        setShowLessonForm(true);
    };

    const openEditLesson = async (module, unit) => {
        setSelectedModule(module);
        setEditingLesson(unit);
        try {
            // Fetch full lesson data
            const lessonData = await getTeacherLesson(module.id, unit.lesson_id);
            setLessonFormData({
                name: lessonData.name || '',
                description: lessonData.description || '',
                video_path: lessonData.video_path || '',
                active: lessonData.active !== undefined ? lessonData.active : true,
                order: lessonData.order || unit.order,
            });
            setShowLessonForm(true);
        } catch (err) {
            console.error('Failed to load lesson data:', err);
            alert('Failed to load lesson data: ' + (err.response?.data?.error || err.message));
            // Fallback to basic data
            setLessonFormData({
                name: unit.name || '',
                description: '',
                video_path: '',
                active: true,
                order: unit.order,
            });
            setShowLessonForm(true);
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        try {
            await createLesson(selectedModule.id, lessonFormData);
            setShowLessonForm(false);
            setSelectedModule(null);
            loadCourseData();
        } catch (err) {
            console.error('Failed to create lesson:', err);
            alert('Failed to create lesson: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteLesson = async (module, unit) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) {
            return;
        }
        try {
            await deleteLesson(module.id, unit.lesson_id);
            loadCourseData();
        } catch (err) {
            console.error('Failed to delete lesson:', err);
            alert('Failed to delete lesson');
        }
    };

    const openCreateQuiz = (module) => {
        setSelectedModule(module);
        setEditingQuiz(null);
        const lastUnit = module.units && module.units.length > 0 
            ? Math.max(...module.units.map(u => u.order)) 
            : 0;
        setQuizFormData({
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
            order: lastUnit + 1,
        });
        setShowQuizForm(true);
    };

    const openEditQuiz = async (module, unit) => {
        setSelectedModule(module);
        setEditingQuiz(unit);
        try {
            // Fetch full quiz data
            const quizData = await getTeacherQuiz(module.id, unit.quiz_id);
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
                order: quizData.order || unit.order,
            });
            setShowQuizForm(true);
        } catch (err) {
            console.error('Failed to load quiz data:', err);
            alert('Failed to load quiz data: ' + (err.response?.data?.error || err.message));
            // Fallback to basic data
            setQuizFormData({
                description: unit.name || '',
                instructions: '',
                duration: 20,
                attempts_allowed: 1,
                time_between_attempts: 0.0,
                pass_criteria: 40.0,
                weightage: 100.0,
                allow_skip: true,
                is_exercise: false,
                active: true,
                order: unit.order,
            });
            setShowQuizForm(true);
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            await createQuiz(selectedModule.id, quizFormData);
            setShowQuizForm(false);
            setSelectedModule(null);
            loadCourseData();
        } catch (err) {
            console.error('Failed to create quiz:', err);
            alert('Failed to create quiz: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteQuiz = async (module, unit) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) {
            return;
        }
        try {
            await deleteQuiz(module.id, unit.quiz_id);
            loadCourseData();
        } catch (err) {
            console.error('Failed to delete quiz:', err);
            alert('Failed to delete quiz');
        }
    };

    const openQuizQuestionManager = (quizId) => {
        setSelectedQuizId(quizId);
        setShowQuizQuestionManager(true);
    };

    const handleQuizQuestionsUpdate = () => {
        loadCourseData();
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

    if (error || !course) {
        return (
            <div className="flex min-h-screen relative grid-texture">
                <TeacherSidebar />
                <main className="flex-1">
                    <Header isAuth />
                    <div className="p-8 flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 mb-4">
                                {error || 'Course not found'}
                            </div>
                            <Link to="/teacher/courses" className="text-blue-400 hover:text-blue-300">
                                Back to Courses
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const tabs = [
        'Enrollment',
        'Modules',
        'Design Course',
        'Analytics',
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
                                        {course?.name || 'Course'}
                                    </h2>
                                    <p className="text-sm muted">
                                        {course?.instructions || 'Course management'}
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
                                    <button
                                        onClick={openCreateModule}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                                    >
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
                                    <div className="text-cyan-400 text-sm font-medium mb-6 flex items-center gap-2">
                                        ENROLLMENTS for the course are below <span>&rarr;</span>
                                    </div>

                                    {loadingEnrollments ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {/* Pending Requests */}
                                            {enrollments.pending_requests.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                                        Pending Requests ({enrollments.pending_requests.length})
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {enrollments.pending_requests.map((student) => (
                                                            <div key={student.user_id} className="card p-4 flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="font-semibold">{student.first_name} {student.last_name}</h4>
                                                                    <p className="text-sm muted">{student.username} • {student.email}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleApproveEnrollment(student.user_id)}
                                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectEnrollment(student.user_id)}
                                                                        className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition text-sm font-medium"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Enrolled Students */}
                                            <div>
                                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    Enrolled Students ({enrollments.enrolled.length})
                                                </h3>
                                                {enrollments.enrolled.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {enrollments.enrolled.map((student) => (
                                                            <div key={student.user_id} className="card p-4 flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <h4 className="font-semibold">{student.first_name} {student.last_name}</h4>
                                                                        {student.grade && (
                                                                            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                                                Grade: {student.grade}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm muted">
                                                                        <span>{student.username} • {student.email}</span>
                                                                        <span>Progress: {student.progress}%</span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveEnrollment(student.user_id)}
                                                                    className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition text-sm font-medium"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-muted">
                                                        No enrolled students yet
                                                    </div>
                                                )}
                                            </div>

                                            {/* Rejected Students */}
                                            {enrollments.rejected.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                        Rejected ({enrollments.rejected.length})
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {enrollments.rejected.map((student) => (
                                                            <div key={student.user_id} className="card p-4 flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="font-semibold">{student.first_name} {student.last_name}</h4>
                                                                    <p className="text-sm muted">{student.username} • {student.email}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleApproveEnrollment(student.user_id)}
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                                                >
                                                                    Approve
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {enrollments.pending_requests.length === 0 && 
                                             enrollments.enrolled.length === 0 && 
                                             enrollments.rejected.length === 0 && (
                                                <div className="text-center py-12 text-muted">
                                                    <p>No enrollment requests or enrolled students</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Modules' && (
                                <div className="space-y-6">
                                    <div className="text-cyan-400 text-xs font-bold tracking-wider mb-4">
                                        MODULES for the course are below &rarr;
                                    </div>

                                    {/* Module Form Modal */}
                                    {showModuleForm && (
                                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                            <div className="bg-[var(--bg-1)] border border-white/10 rounded-xl p-6 max-w-2xl w-full mx-4">
                                                <h3 className="text-xl font-bold mb-4">
                                                    {editingModule ? 'Edit Module' : 'Create New Module'}
                                                </h3>
                                                <form onSubmit={editingModule ? handleUpdateModule : handleCreateModule}>
                                                    <div className="space-y-4">
                                            <div>
                                                            <label className="block text-sm font-semibold mb-2">
                                                                Module Name *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={moduleFormData.name}
                                                                onChange={handleModuleFormChange}
                                                                required
                                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                placeholder="Enter module name"
                                                            />
                                            </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-2">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                name="description"
                                                                value={moduleFormData.description}
                                                                onChange={handleModuleFormChange}
                                                                rows="4"
                                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                                                placeholder="Enter module description (markdown supported)"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-semibold mb-2">
                                                                    Order
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    name="order"
                                                                    value={moduleFormData.order}
                                                                    onChange={handleModuleFormChange}
                                                                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                />
                                                            </div>
                                                            <div className="flex items-center pt-8">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="active"
                                                                        checked={moduleFormData.active}
                                                                        onChange={handleModuleFormChange}
                                                                        className="toggle-checkbox"
                                                                    />
                                                                    <span className="text-sm">Active</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                            <div>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    name="check_prerequisite"
                                                                    checked={moduleFormData.check_prerequisite}
                                                                    onChange={handleModuleFormChange}
                                                                    className="toggle-checkbox"
                                                                />
                                                                <span className="text-sm">Check Prerequisite</span>
                                                            </label>
                                                        </div>
                                            </div>
                                                    <div className="flex justify-end gap-3 mt-6">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowModuleForm(false);
                                                                setEditingModule(null);
                                                            }}
                                                            className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition"
                                                        >
                                                            Cancel
                                                </button>
                                                        <button
                                                            type="submit"
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                        >
                                                            {editingModule ? 'Update' : 'Create'}
                                                </button>
                                            </div>
                                                </form>
                                        </div>
                                        </div>
                                    )}

                                    {/* Lesson Form Modal */}
                                    {showLessonForm && (
                                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                            <div className="bg-[var(--bg-1)] border border-white/10 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                                <h3 className="text-xl font-bold mb-4">
                                                    {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
                                                </h3>
                                                <form onSubmit={handleCreateLesson}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-2">
                                                                Lesson Name *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={lessonFormData.name}
                                                                onChange={handleLessonFormChange}
                                                                required
                                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                placeholder="Enter lesson name"
                                                            />
                                                    </div>
                                                    <div>
                                                            <label className="block text-sm font-semibold mb-2">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                name="description"
                                                                value={lessonFormData.description}
                                                                onChange={handleLessonFormChange}
                                                                rows="6"
                                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                                                                placeholder="Enter lesson description (markdown supported)"
                                                            />
                                                        </div>
                                                    <div>
                                                            <label className="block text-sm font-semibold mb-2">
                                                                Video URL/Path
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="video_path"
                                                                value={lessonFormData.video_path}
                                                                onChange={handleLessonFormChange}
                                                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                placeholder="YouTube ID, Vimeo ID, or video URL"
                                                            />
                                                            <p className="text-xs muted mt-1">Enter YouTube ID, Vimeo ID, or direct video URL</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-semibold mb-2">
                                                                    Order
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    name="order"
                                                                    value={lessonFormData.order}
                                                                    onChange={handleLessonFormChange}
                                                                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                                                                />
                                                    </div>
                                                            <div className="flex items-center pt-8">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="active"
                                                                        checked={lessonFormData.active}
                                                                        onChange={handleLessonFormChange}
                                                                        className="toggle-checkbox"
                                                                    />
                                                                    <span className="text-sm">Active</span>
                                                                </label>
                                                </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-3 mt-6">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowLessonForm(false);
                                                                setSelectedModule(null);
                                                                setEditingLesson(null);
                                                            }}
                                                            className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                        >
                                                            {editingLesson ? 'Update' : 'Create'}
                                                </button>
                                            </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quiz Form Modal */}
                                    {showQuizForm && (
                                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                            <div className="bg-[var(--bg-1)] border border-white/10 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                                <h3 className="text-xl font-bold mb-4">
                                                    {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                                                </h3>
                                                <form onSubmit={handleCreateQuiz}>
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
                                                                setSelectedModule(null);
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
                                                            {editingQuiz ? 'Update' : 'Create'}
                                                </button>
                                            </div>
                                                </form>
                                        </div>
                                    </div>
                                    )}

                                    {/* Modules List */}
                                    {modules.length > 0 ? (
                                        modules.map((module) => (
                                            <div key={module.id} className="card rounded-xl overflow-hidden">
                                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="font-bold text-lg">{module.name}</h3>
                                                            {!module.active && (
                                                                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded text-xs">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </div>
                                                        {module.description && (
                                                            <p className="text-xs muted mt-1 line-clamp-2">
                                                                {module.description}
                                                            </p>
                                                        )}
                                                <p className="text-xs muted mt-1">
                                                            {module.units_count} learning unit{module.units_count !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => openCreateLesson(module)}
                                                            className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-xs font-bold hover:bg-cyan-500/30 transition flex items-center gap-1"
                                                        >
                                                    <FaPlus className="w-2 h-2" /> Add Lesson
                                                </button>
                                                        <button
                                                            onClick={() => openCreateQuiz(module)}
                                                            className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-bold hover:bg-green-500/30 transition flex items-center gap-1"
                                                        >
                                                    <FaPlus className="w-2 h-2" /> Add Quiz
                                                </button>
                                                        <button
                                                            onClick={() => openEditModule(module)}
                                                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-bold hover:bg-blue-500/30 transition flex items-center gap-1"
                                                        >
                                                            <FaEdit className="w-3 h-3" /> Edit
                                                </button>
                                                        <button
                                                            onClick={() => handleDeleteModule(module.id)}
                                                            className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-bold hover:bg-red-500/30 transition flex items-center gap-1"
                                                        >
                                                            <FaTrash className="w-3 h-3" /> Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-2 space-y-2">
                                                    {module.units && module.units.length > 0 ? (
                                                        module.units.map((unit) => (
                                                            <div
                                                                key={unit.id}
                                                                className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] border border-white/10 hover:bg-[var(--surface)] transition group"
                                                            >
                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                                                        unit.type === 'lesson' 
                                                                            ? 'bg-cyan-500/10 text-cyan-400' 
                                                                            : 'bg-green-500/10 text-green-400'
                                                                    }`}>
                                                                        {unit.type === 'lesson' ? (
                                                                            <FaBook className="w-4 h-4" />
                                                                        ) : (
                                                        <FaCalendarAlt className="w-4 h-4" />
                                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                                            {unit.name || `${unit.type} #${unit.id}`}
                                                        </div>
                                                        <div className="text-xs muted flex items-center gap-3 mt-0.5">
                                                                            <span className="uppercase">{unit.type}</span>
                                                                            <span>Order: {unit.order}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {unit.type === 'lesson' ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => openEditLesson(module, unit)}
                                                                                className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition"
                                                                            >
                                                                                Edit
                                                </button>
                                                                            <button
                                                                                onClick={() => handleDeleteLesson(module, unit)}
                                                                                className="px-3 py-1 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/20 transition"
                                                                            >
                                                                                Delete
                                                </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => openQuizQuestionManager(unit.quiz_id)}
                                                                                className="px-3 py-1 border border-blue-500/30 text-blue-400 rounded text-xs hover:bg-blue-500/20 transition"
                                                                            >
                                                                                Questions
                                                                            </button>
                                                                            <button
                                                                                onClick={() => openEditQuiz(module, unit)}
                                                                                className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteQuiz(module, unit)}
                                                                                className="px-3 py-1 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/20 transition"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </>
                                                                    )}
                                            </div>
                                                    </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-muted text-sm">
                                                            No learning units yet. Add a lesson or quiz to get started.
                                                        </div>
                                                    )}
                                                        </div>
                                                    </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-muted">
                                            <p>No modules yet. Create your first module!</p>
                                                </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Design Course' && (
                                <div>
                                    <div className="text-cyan-400 text-sm font-medium mb-6 flex items-center gap-2">
                                        DESIGN THE COURSE - Reorder modules and learning units <span>&rarr;</span>
                                    </div>

                                    {modules.length === 0 ? (
                                        <div className="text-center py-12 text-muted">
                                            <p>No modules found. Add modules first to reorder them.</p>
                                            </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Module Reordering */}
                                            <div className="card-strong p-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-bold">Module Order</h3>
                                                    <button
                                                        onClick={saveModuleOrder}
                                                        disabled={savingOrder}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                    >
                                                        {savingOrder ? 'Saving...' : 'Save Module Order'}
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {moduleOrder.map((moduleId, index) => {
                                                        const module = modules.find(m => m.id === moduleId);
                                                        if (!module) return null;
                                                        return (
                                                            <div
                                                                key={moduleId}
                                                                className="card p-4 flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                                                                        {index + 1}
                                            </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold">{module.name}</h4>
                                                                        <p className="text-xs muted">{module.units_count || 0} learning units</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => moveModule(moduleId, 'up')}
                                                                        disabled={index === 0}
                                                                        className="px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        title="Move up"
                                                                    >
                                                                        <FaChevronUp className="w-4 h-4" />
                                                </button>
                                                                    <button
                                                                        onClick={() => moveModule(moduleId, 'down')}
                                                                        disabled={index === moduleOrder.length - 1}
                                                                        className="px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        title="Move down"
                                                                    >
                                                                        <FaChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                                        );
                                                    })}
                                        </div>
                                            </div>

                                            {/* Unit Reordering per Module */}
                                            {moduleOrder.map((moduleId) => {
                                                const module = modules.find(m => m.id === moduleId);
                                                if (!module || !module.units || module.units.length === 0) return null;
                                                
                                                const units = unitOrders[moduleId] || [];
                                                return (
                                                    <div key={moduleId} className="card-strong p-6">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-lg font-bold">{module.name} - Learning Units</h3>
                                                            <button
                                                                onClick={() => saveUnitOrder(moduleId)}
                                                                disabled={savingOrder}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                            >
                                                                {savingOrder ? 'Saving...' : 'Save Unit Order'}
                                                            </button>
                                                </div>
                                                        <div className="space-y-2">
                                                            {units.map((unit, index) => {
                                                                const unitData = module.units.find(u => (u.lesson_id || u.quiz_id) === unit.unit_id);
                                                                if (!unitData) return null;
                                                                const isLesson = !!unitData.lesson_id;
                                                                return (
                                                                    <div
                                                                        key={unit.unit_id}
                                                                        className="card p-3 flex items-center justify-between"
                                                                    >
                                                                        <div className="flex items-center gap-4 flex-1">
                                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                                                                isLesson 
                                                                                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400' 
                                                                                    : 'bg-green-500/20 border border-green-500/30 text-green-400'
                                                                            }`}>
                                                                                {index + 1}
                                                    </div>
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    {isLesson ? (
                                                                                        <FaBook className="w-4 h-4 text-cyan-400" />
                                                                                    ) : (
                                                                                        <span className="text-green-400 font-bold">Q</span>
                                                                                    )}
                                                                                    <h4 className="font-semibold">{unitData.name}</h4>
                                                                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                                                                        isLesson 
                                                                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                                                                                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                                    }`}>
                                                                                        {isLesson ? 'Lesson' : 'Quiz'}
                                                                                    </span>
                                                </div>
                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => moveUnit(moduleId, unit.unit_id, 'up')}
                                                                                disabled={index === 0}
                                                                                className="px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                                                title="Move up"
                                                                            >
                                                                                <FaChevronUp className="w-3 h-3" />
                                                </button>
                                                                            <button
                                                                                onClick={() => moveUnit(moduleId, unit.unit_id, 'down')}
                                                                                disabled={index === units.length - 1}
                                                                                className="px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                                                title="Move down"
                                                                            >
                                                                                <FaChevronDown className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                                                );
                                                            })}
                                        </div>
                                    </div>
                                                );
                                            })}
                                </div>
                            )}
                        </div>
                            )}

                            {activeTab === 'Analytics' && (
                                <div>
                                    <div className="text-cyan-400 text-sm font-medium mb-6 flex items-center gap-2">
                                        COURSE ANALYTICS <span>&rarr;</span>
                                    </div>
                                    <CourseAnalytics analytics={analytics} loading={loadingAnalytics} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Quiz Question Manager Modal */}
            {showQuizQuestionManager && selectedQuizId && (
                <QuizQuestionManager
                    quizId={selectedQuizId}
                    onClose={() => {
                        setShowQuizQuestionManager(false);
                        setSelectedQuizId(null);
                    }}
                    onUpdate={handleQuizQuestionsUpdate}
                />
            )}
        </div>
    );
};

export default ManageCourse;
