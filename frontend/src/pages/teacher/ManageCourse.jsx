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
import CourseDiscussionsTab from '../../components/teacher/CourseDiscussion';
import useManageCourseStore from '../../store/manageCourseStore';
import CourseEnrollment from '../../components/teacher/CourseEnrollement';
import CourseModules from '../../components/teacher/CourseModules';
import CourseDesign from '../../components/teacher/CourseDesign';



const ManageCourse = () => {

    const { courseId } = useParams();
    const {
    course, modules, loading, error, enrollments, loadingEnrollments, analytics, loadingAnalytics,
    activeTab, setActiveTab, showQuizQuestionManager, setShowQuizQuestionManager, selectedQuizId, setSelectedQuizId,
    moduleOrder, unitOrders, savingOrder, showModuleForm, editingModule, showLessonForm, showQuizForm,
    selectedModule, editingLesson, editingQuiz, moduleFormData, lessonFormData, quizFormData,
    setShowModuleForm, setEditingModule, setModuleFormData, handleModuleFormChange, handleCreateModule, handleUpdateModule, handleDeleteModule,
    openEditModule, openCreateModule, setShowLessonForm, setSelectedModule, setEditingLesson, setLessonFormData, handleLessonFormChange,
    openCreateLesson, openEditLesson, handleCreateLesson, handleDeleteLesson,
    setShowQuizForm, setEditingQuiz, setQuizFormData, handleQuizFormChange, openCreateQuiz, openEditQuiz, handleCreateQuiz, handleDeleteQuiz,
    loadCourseData, loadEnrollments, loadAnalytics, initializeOrdering, moveModule, saveModuleOrder, moveUnit, saveUnitOrder,
    handleApproveEnrollment, handleRejectEnrollment, handleRemoveEnrollment, openQuizQuestionManager, handleQuizQuestionsUpdate
    } = useManageCourseStore();

    useEffect(() => {
    if (courseId) {
        loadCourseData(courseId);
    }
}, [courseId]);

useEffect(() => {
    if (courseId && activeTab === 'Enrollment') {
        loadEnrollments(courseId);
    }
    if (courseId && activeTab === 'Analytics') {
        loadAnalytics(courseId);
    }
}, [courseId, activeTab]);

useEffect(() => {
    if (modules.length > 0 && activeTab === 'Design Course') {
        initializeOrdering();
    }
}, [modules, activeTab]);


   


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
        'Discussions',
        'Appearance',
        'Privacy',
    ];


    return (
        <div className="flex min-h-screen relative grid-texture">
            <TeacherSidebar />

            <main className="flex-1">
                <Header isAuth />

                <div className="p-8">
                    {/* Page Header */}
                    <div className="mb-6 lg:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Courses</h1>
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
                            {activeTab === 'Enrollment' && <CourseEnrollment />}
                            

                            {activeTab === 'Modules' && <CourseModules />}

                            {activeTab === 'Design Course' && <CourseDesign />}

                            {activeTab === 'Analytics' && (
                                <div>
                                    <div className="text-cyan-400 text-sm font-medium mb-6 flex items-center gap-2">
                                        COURSE ANALYTICS <span>&rarr;</span>
                                    </div>
                                    <CourseAnalytics analytics={analytics} loading={loadingAnalytics} />
                                </div>
                            )}

                            {activeTab === 'Discussions' && course && (
                                <CourseDiscussionsTab courseId={course.id} />
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
