import React from 'react';
import { FaPlus, FaBook, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import useManageCourseStore from '../../store/manageCourseStore';
import { useParams } from 'react-router-dom';
import { FaBookOpen, FaTimes } from 'react-icons/fa';

const CourseModules = () => {
    const {
        modules, showModuleForm, editingModule, moduleFormData, handleModuleFormChange, handleCreateModule, handleUpdateModule, setShowModuleForm, setEditingModule,
        showLessonForm, editingLesson, lessonFormData, handleLessonFormChange, handleCreateLesson, setShowLessonForm, setSelectedModule, setEditingLesson,
        showQuizForm, editingQuiz, quizFormData, handleQuizFormChange, handleCreateQuiz, setShowQuizForm, setSelectedModule: setSelectedModuleQuiz, setEditingQuiz,
        openCreateLesson, openCreateQuiz, openEditModule, handleDeleteModule, openEditLesson, handleDeleteLesson, openQuizQuestionManager, openEditQuiz, handleDeleteQuiz
    } = useManageCourseStore();

    const { courseId } = useParams();



    return (
        <div className="space-y-6">
            <div className="text-cyan-400 text-sm sm:text-base font-medium mb-6 flex items-center gap-2">
                 COURSE MODULES &rarr;
            </div>

            
            {showModuleForm && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
                <div className="card-strong w-full max-w-full sm:max-w-2xl p-4 sm:p-6 relative rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Close (Cross) Button */}
                <button
                    className="absolute right-4 top-4 text-lg sm:text-xl p-2 rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                    onClick={() => {
                    setShowModuleForm(false);
                    setEditingModule(null);
                    }}
                    aria-label="Close"
                >
                    <FaTimes />
                </button>
                {/* Header */}
                <div className="flex flex-row items-center gap-4 mb-4 sm:mt-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <FaBookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold mb-1 line-clamp-1">
                        {editingModule ? 'Edit Module' : 'Create New Module'}
                    </h2>
                    <p className="text-xs sm:text-sm muted line-clamp-2">
                        {editingModule
                        ? 'Update the details of this module.'
                        : 'Add a new module to your course.'}
                    </p>
                    </div>
                </div>
                {/* Form */}
                <form
                    onSubmit={e => {
                    e.preventDefault();
                    if (editingModule) {
                        handleUpdateModule(courseId);
                    } else {
                        handleCreateModule(courseId);
                    }
                    }}
                    className="space-y-4 mt-2"
                >
                    <div className="flex flex-col gap-2">
                    <input
                        className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus-visible:outline-none"
                        name="name"
                        placeholder="Module Name *"
                        value={moduleFormData.name}
                        onChange={handleModuleFormChange}
                        required
                    />
                    <textarea
                        className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus-visible:outline-none"
                        name="description"
                        placeholder="Description (markdown supported)"
                        value={moduleFormData.description}
                        onChange={handleModuleFormChange}
                        rows={4}
                    />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <input
                        className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm w-full focus-visible:outline-none"
                        type="number"
                        name="order"
                        placeholder="Order"
                        value={moduleFormData.order}
                        onChange={handleModuleFormChange}
                        />
                    </div>
                    <div className="flex items-center pt-2">
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
                    <div className="flex gap-2 justify-end mt-6 flex-wrap">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 font-medium transition"
                        onClick={() => {
                        setShowModuleForm(false);
                        setEditingModule(null);
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="card-strong rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="card-strong rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
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
                                        setSelectedModuleQuiz(null);
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
                <div key={module.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 gap-4">
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
                            <p className="text-xs muted mt-1 hidden sm:inline ">
                                {module.units_count} learning unit{module.units_count !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => openCreateLesson(module)}
                                className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-xs font-bold hover:bg-cyan-500/30 transition flex items-center gap-1"
                            >
                                <FaPlus className="w-2 h-2" />
                                <span className="inline sm:hidden">Lesson</span>
                                <span className="hidden sm:inline">Add Lesson</span>
                            </button>
                            <button
                                onClick={() => openCreateQuiz(module)}
                                className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-bold hover:bg-green-500/30 transition flex items-center gap-1"
                            >
                                <FaPlus className="w-2 h-2" />
                                <span className="inline sm:hidden">Quiz</span>
                                <span className="hidden sm:inline">Add Quiz</span>
                            </button>
                            <button
                                onClick={() => openEditModule(module)}
                                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-bold hover:bg-blue-500/30 transition flex items-center gap-1"
                            >
                                <FaEdit className="w-3 h-3" />
                                <span className="inline sm:hidden">Edit</span>
                                <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                                onClick={() => handleDeleteModule(module.id)}
                                className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-bold hover:bg-red-500/30 transition flex items-center gap-1"
                            >
                                <FaTrash className="w-3 h-3" />
                                <span className="inline sm:hidden">Delete</span>
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-2 space-y-2">
                        {module.units && module.units.length > 0 ? (
                            module.units.map((unit) => (
                                <div
                                    key={unit.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-white/10 transition group gap-2"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center ${unit.type === 'lesson'
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
                                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
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
    );
};

export default CourseModules;