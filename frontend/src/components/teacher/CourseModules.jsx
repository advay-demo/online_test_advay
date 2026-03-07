import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaBook, FaCalendarAlt, FaEdit, FaTrash, FaCheckCircle, FaEllipsisV, FaVideo, FaTimes, FaUpload, FaFileAlt, FaExternalLinkAlt, FaArrowUp, FaArrowDown, FaCheck, FaCog, FaRandom, FaList, FaSync, FaSearch } from 'react-icons/fa';
import useManageCourseStore from '../../store/manageCourseStore';
import { useParams } from 'react-router-dom';
import { FaBookOpen } from 'react-icons/fa';

const CourseModules = () => {
    const {
        modules, 
        showModuleForm, 
        editingModule, 
        moduleFormData, 
        handleModuleFormChange, 
        handleCreateModule, 
        handleUpdateModule, 
        setShowModuleForm, 
        setEditingModule,
        showLessonForm, 
        editingLesson, 
        lessonFormData, 
        handleLessonFormChange, 
        handleCreateLesson, 
        handleUpdateLesson, 
        setShowLessonForm, 
        setSelectedModule, 
        setEditingLesson,
        showQuizForm, 
        editingQuiz, 
        quizFormData, 
        handleQuizFormChange, 
        handleCreateQuiz, 
        handleUpdateQuiz, 
        setShowQuizForm, 
        setSelectedModule: setSelectedModuleQuiz, 
        setEditingQuiz,
        openCreateLesson, 
        openCreateQuiz, 
        openEditModule, 
        handleDeleteModule, 
        openEditLesson, 
        handleDeleteLesson,  
        openEditQuiz, 
        handleDeleteQuiz,
        showExerciseForm,
        editingExercise,
        exerciseFormData,
        handleExerciseFormChange,
        handleCreateExercise,
        handleUpdateExercise,
        setShowExerciseForm,
        openCreateExercise,
        openEditExercise,
        handleDeleteExercise,
        setModuleFormData,
        setLessonFormData,
        showDesignModuleModal,
        designModule,
        loadingDesignModule,
        designModuleError,
        designingModuleId,
        openDesignModule,
        closeDesignModule,
        handleAddUnitsToModule,
        handleRemoveUnitsFromModule,
        handleChangeModuleUnitOrder,
        handleChangeModuleUnitPrerequisite,
        questionPaperDesign,
        filteredQuestions,
        loadingQuestionPaper,
        questionPaperError,
        showDesignQuestionPaperModal,
        designingQuizId,
        designingQuizName,
        openDesignQuestionPaper,
        closeDesignQuestionPaper,
        handleAddFixedQuestions,
        handleRemoveFixedQuestions,
        handleAddRandomQuestionsSet,
        handleRemoveRandomQuestionsSet,
        handleSaveQuestionPaperOptions,
        handleFilterQuestionPaperQuestions

    } = useManageCourseStore();

    const { courseId } = useParams();

    // Dropdown state management
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);

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

    const toggleDropdown = (moduleId) => {
        setOpenDropdownId(openDropdownId === moduleId ? null : moduleId);
    };

    // Toggle handlers for the module form
    const handleToggleActive = () => {
        setModuleFormData({
            ...moduleFormData,
            active: !moduleFormData.active
        });
    };

    // Toggle handler for lesson form
    const handleLessonToggleActive = () => {
        setLessonFormData({
            ...lessonFormData,
            active: !lessonFormData.active
        });
    };

    // Handle lesson form submission
    const handleLessonSubmit = (e) => {
        e.preventDefault();
        if (editingLesson) {
            handleUpdateLesson();
        } else {
            handleCreateLesson();
        }
    };

    const handleExerciseSubmit = (e) => {
        e.preventDefault();
        if (editingExercise) {
            handleUpdateExercise();
        } else {
            handleCreateExercise();
        }
    };



    // Helper to get embed URL
    const getVideoEmbedUrl = (url) => {
        if (!url) return null;
        
        // YouTube
        const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const ytMatch = url.match(youtubeRegex);
        if (ytMatch && ytMatch[1]) {
            return { type: 'iframe', url: `https://www.youtube.com/embed/${ytMatch[1]}` };
        }

        // Vimeo
        const vimeoRegex = /^(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch && vimeoMatch[1]) {
            return { type: 'iframe', url: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
        }

        // Direct Video File (simple check for extension or if it looks like a url)
        if (url.match(/\.(mp4|webm|ogg)$/i) || url.startsWith('http')) {
            return { type: 'video', url: url };
        }

        return null;
    };

    const videoPreview = getVideoEmbedUrl(lessonFormData.video_path);

    const handleClearVideo = () => {
        setLessonFormData({
            ...lessonFormData,
            video_path: ''
        });
    };

     

    const handleRemoveExistingFile = (fileId) => {
        if(!window.confirm("Mark this file for deletion logic? (Will be deleted on Save)")) return;
        
        const updatedFiles = lessonFormData.files.filter(f => f.id !== fileId);
        const filesToDelete = [...(lessonFormData.filesToDelete || []), fileId];
        
        setLessonFormData({
            ...lessonFormData,
            files: updatedFiles,
            filesToDelete: filesToDelete
        });
    };

    const handleClearUploadedVideo = () => {
         // Clears selected file input and marks existing video for removal
         setLessonFormData({
             ...lessonFormData,
             video_file: null,
             newVideoFile: null,
             existing_video_file_url: null,
             clearVideoFile: true 
         });
         
         // Helper to reset file input value visually
         const fileInput = document.getElementById('video-file-upload');
         if(fileInput) fileInput.value = "";
    };


    // --- DESIGN MODULE LOCAL STATE ---
    const [selectedInSelected, setSelectedInSelected] = useState(null); // ID of selected unit (Left side)
    const [selectedInPool, setSelectedInPool] = useState(null); // ValueKey of selected pool item (Right side)
    
    // Local state for immediate UI updates before API refresh
    const [localSelected, setLocalSelected] = useState([]);
    const [localPool, setLocalPool] = useState([]);

    // Sync local state with API data when modal opens or data changes
    useEffect(() => {
        if (designModule) {
            // Sort units by order
            const sortedUnits = [...(designModule.learning_units || [])].sort((a,b) => a.order - b.order);
            setLocalSelected(sortedUnits);
            setLocalPool(designModule.quiz_les_list || []);
            setSelectedInSelected(null);
            setSelectedInPool(null);
        }
    }, [designModule]);

    // HANDLERS FOR DESIGN MODAL
    
    // Add item from Pool -> Module
    const handleAddUnit = async () => {
        if (selectedInPool && designingModuleId) {
            // selectedInPool is the value_key (e.g., "5:lesson")
            await handleAddUnitsToModule(designingModuleId, [selectedInPool], courseId);
            setSelectedInPool(null);
        }
    };

    // Remove item from Module -> Pool
    const handleRemoveUnit = async () => {
        if (selectedInSelected && designingModuleId) {
            // selectedInSelected is the unit.id
            await handleRemoveUnitsFromModule(designingModuleId, [selectedInSelected], courseId);
            setSelectedInSelected(null);
        }
    };

    // Reorder: Move Up
    const moveUp = async () => {
        if (selectedInSelected !== null) {
            const idx = localSelected.findIndex(u => u.id === selectedInSelected);
            if (idx > 0) {
                const newOrderList = [...localSelected];
                // Swap
                [newOrderList[idx - 1], newOrderList[idx]] = [newOrderList[idx], newOrderList[idx - 1]];
                setLocalSelected(newOrderList);
                
                // Construct API payload "unit_id:order"
                const orderedListPayload = newOrderList.map((u, i) => `${u.id}:${i + 1}`);
                await handleChangeModuleUnitOrder(designingModuleId, orderedListPayload, courseId);
            }
        }
    };

    // Reorder: Move Down
    const moveDown = async () => {
        if (selectedInSelected !== null) {
            const idx = localSelected.findIndex(u => u.id === selectedInSelected);
            if (idx < localSelected.length - 1) {
                const newOrderList = [...localSelected];
                // Swap
                [newOrderList[idx], newOrderList[idx + 1]] = [newOrderList[idx + 1], newOrderList[idx]];
                setLocalSelected(newOrderList);

                // Construct API payload "unit_id:order"
                const orderedListPayload = newOrderList.map((u, i) => `${u.id}:${i + 1}`);
                await handleChangeModuleUnitOrder(designingModuleId, orderedListPayload, courseId);
            }
        }
    };

    // Toggle Prerequisite
    const handleTogglePrereq = async (unitId) => {
        if (designingModuleId) {
            await handleChangeModuleUnitPrerequisite(designingModuleId, [unitId], courseId);
        }
    };

    {/* DESIGN QUESTION PAPER MODAL */}

    const [qPaperTab, setQPaperTab] = useState('FIXED');
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [shuffleTestcases, setShuffleTestcases] = useState(false);
    
    // Filtering State
    const [filterMarks, setFilterMarks] = useState('');
    const [filterTags, setFilterTags] = useState('');
    const [filterType, setFilterType] = useState('');
    
    // Checkbox Selections
    const [selectedPoolQs, setSelectedPoolQs] = useState([]);
    const [selectedFixedQs, setSelectedFixedQs] = useState([]);
    const [selectedRandomSets, setSelectedRandomSets] = useState([]);

    // Random Set Creation State
    const [randomSetMarks, setRandomSetMarks] = useState('');
    const [randomSetCount, setRandomSetCount] = useState('');

    const paperId = questionPaperDesign?.question_paper?.id;

    const handleSearchQPaper = () => {
        handleFilterQuestionPaperQuestions(courseId, designingQuizId, paperId, {
            marks: filterMarks,
            tags: filterTags,
            type: filterType
        });
        setSelectedPoolQs([]);
    };

    const handleAddFixed = async () => {
        if (!selectedPoolQs.length) return;
        await handleAddFixedQuestions(courseId, designingQuizId, paperId, selectedPoolQs);
        setSelectedPoolQs([]); 
    };

    const handleRemoveFixed = async () => {
        if (!selectedFixedQs.length) return;
        await handleRemoveFixedQuestions(courseId, designingQuizId, paperId, selectedFixedQs);
        setSelectedFixedQs([]);
    };

    const handleAddRandomSet = async () => {
        if (!selectedPoolQs.length || !randomSetCount) {
            alert('Please select matching pool items and the number of questions to pick.');
            return;
        }

        // Auto-assign marks based on the first selected question in the pool (backend requires a value)
        const firstSelectedQ = availableQuestions.find(q => q.id === selectedPoolQs[0]);
        const autoMarks = firstSelectedQ?.points || 1;

        await handleAddRandomQuestionsSet(courseId, designingQuizId, paperId, selectedPoolQs, autoMarks, randomSetCount);
        
        setSelectedPoolQs([]);
        setRandomSetMarks('');
        setRandomSetCount('');
    };

    const handleRemoveRandomSets = async () => {
        if (!selectedRandomSets.length) return;
        await handleRemoveRandomQuestionsSet(courseId, designingQuizId, paperId, selectedRandomSets);
        setSelectedRandomSets([]);
    };

    const handleSaveQPaperSettings = async (e) => {
        e.preventDefault();
        try {
            await handleSaveQuestionPaperOptions(courseId, designingQuizId, paperId, {
                shuffle_questions: shuffleQuestions,
                shuffle_testcases: shuffleTestcases,
            });
            // Automatically close the modal after successfully saving
            closeDesignQuestionPaper();
        } catch (error) {
            console.error("Failed to save paper settings:", error);
            alert("Failed to save settings. Please try again.");
        }
    };

    const toggleQPaperSelection = (id, list, setList) => {
        if (list.includes(id)) setList(list.filter(item => item !== id));
        else setList([...list, id]);
    };

    const availableQuestions = filteredQuestions?.filtered_questions || [];

    useEffect(() => {
        if (questionPaperDesign?.question_paper) {
            setShuffleQuestions(questionPaperDesign.question_paper.shuffle_questions || false);
            setShuffleTestcases(questionPaperDesign.question_paper.shuffle_testcases || false);
        }
    }, [questionPaperDesign]);


    const [expandedRandomSets, setExpandedRandomSets] = useState([]);



    return (
        <div className="space-y-6">
            <div className="text-cyan-400 text-sm sm:text-base font-medium mb-6 flex items-center gap-2">
                 COURSE MODULES &rarr;
            </div>

            
            {/* MODULE FORM MODAL */}
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
                    <div>
                        <label className="block text-sm font-semibold mb-2">Order</label>
                        <input
                        className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm w-full focus-visible:outline-none"
                        type="number"
                        name="order"
                        placeholder="Order"
                        value={moduleFormData.order}
                        onChange={handleModuleFormChange}
                        />
                    </div>
                    
                    {/* Toggle Switches */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)]">
                            <div className="flex-1">
                                <label className="text-sm font-semibold block">Active</label>
                                <p className="text-xs muted mt-0.5">Make this module visible to students</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleActive}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                                    moduleFormData.active ? 'bg-blue-600' : 'bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        moduleFormData.active ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
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

            {/* LESSON FORM MODAL - Enhanced UI with File Upload */}
            {showLessonForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
                    <div className="card-strong w-full max-w-full sm:max-w-2xl p-4 sm:p-6 relative rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            className="absolute right-4 top-4 text-lg sm:text-xl p-2 rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                            onClick={() => {
                                setShowLessonForm(false);
                                setSelectedModule(null);
                                setEditingLesson(null);
                            }}
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>

                        {/* Header */}
                        <div className="flex flex-row items-center gap-4 mb-4 sm:mt-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <FaVideo className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold mb-1 line-clamp-1">
                                    {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
                                </h2>
                                <p className="text-xs sm:text-sm muted line-clamp-2">
                                    {editingLesson
                                        ? 'Update the details of this lesson.'
                                        : 'Add a new lesson to your module.'}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLessonSubmit} className="space-y-6 mt-2">
                            {/* Lesson Name */}
                            <div className="flex flex-col gap-2">
                                <input
                                    className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base focus-visible:outline-none"
                                    name="name"
                                    placeholder="Lesson Name *"
                                    value={lessonFormData.name}
                                    onChange={handleLessonFormChange}
                                    required
                                />

                                {/* Description */}
                                <textarea
                                    className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm focus-visible:outline-none"
                                    name="description"
                                    placeholder="Description (HTML/Markdown supported)"
                                    value={lessonFormData.description}
                                    onChange={handleLessonFormChange}
                                    rows={4}
                                />
                            </div>

                            {/* --- VIDEO FILE UPLOAD SECTION --- */}
                            <div className="bg-[var(--input-bg)] bg-opacity-50 border border-[var(--border-color)] rounded-xl p-4">
                                <label className="block text-sm font-bold text-cyan-400 mb-2">
                                    Video Source (Select one)
                                </label>
                                
                                {/* Option A: Video File Upload */}
                                <div className="mb-4">
                                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                                        Upload Video File (MP4, OGV, WEBM)
                                    </label>
                                    
                                    {(lessonFormData.existing_video_file_url && !lessonFormData.clearVideoFile) ? (
                                        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                            <div className="bg-green-500/20 p-2 rounded-full">
                                                <FaVideo className="text-green-400 w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-green-400 truncate">
                                                    Current Video Uploaded
                                                </p>
                                                <a href={lessonFormData.existing_video_file_url} target="_blank" rel="noreferrer" className="text-xs text-green-300/70 hover:underline truncate block">
                                                    View current video
                                                </a>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={handleClearUploadedVideo}
                                                className="text-gray-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition"
                                                title="Remove Video"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                id="video-file-upload"
                                                name="video_file"
                                                accept=".mp4,.ogv,.webm"
                                                onChange={handleLessonFormChange}
                                                className="block w-full text-sm text-gray-400
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-lg file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-cyan-600 file:text-white
                                                    hover:file:bg-cyan-700
                                                    cursor-pointer bg-black/20 rounded-lg border border-white/10"
                                            />
                                            {lessonFormData.newVideoFile && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearUploadedVideo}
                                                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg border border-red-500/30 transition"
                                                    title="Clear selection"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 my-2">
                                    <div className="h-px bg-white/10 flex-1"></div>
                                    <span className="text-xs text-gray-500 uppercase font-bold">AND</span>
                                    <div className="h-px bg-white/10 flex-1"></div>
                                </div>

                                {/* Option B: Video Link */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                                        Video Link (YouTube, Vimeo)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="video_path"
                                            value={lessonFormData.video_path || ''}
                                            onChange={handleLessonFormChange}
                                            className="w-full px-4 py-2 pr-10 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm"
                                            placeholder="https://youtube.com/..."
                                        />
                                        {lessonFormData.video_path && (
                                            <button
                                                type="button"
                                                onClick={handleClearVideo}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 p-1"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                 {/* Video Preview (Link) */}
                                 {lessonFormData.video_path && videoPreview && (
                                    <div className="mt-3 relative rounded-lg overflow-hidden bg-black aspect-video border border-white/10">
                                        {videoPreview.type === 'iframe' ? (
                                            <iframe
                                                src={videoPreview.url}
                                                title="Preview"
                                                className="w-full h-full"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <video src={videoPreview.url} controls className="w-full h-full" />
                                        )}
                                    </div>
                                )}
                            </div>


                            {/* --- FILE ATTACHMENTS SECTION --- */}
                            <div className="bg-[var(--input-bg)] bg-opacity-50 border border-[var(--border-color)] rounded-xl p-4">
                                <label className="block text-sm font-bold text-gray-200 mb-2">
                                    Attached Files
                                </label>
                                
                                <div className="space-y-4">
                                     {/* Existing Files List */}
                                    {editingLesson && lessonFormData.files && lessonFormData.files.length > 0 && (
                                        <div className="space-y-2">
                                            {lessonFormData.files.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5 group">
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 truncate"
                                                    >
                                                        <FaFileAlt />
                                                        <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                                                        <FaExternalLinkAlt className="w-3 h-3 opacity-50" />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExistingFile(file.id)}
                                                        className="text-gray-500 hover:text-red-400 p-1.5 transition"
                                                        title="Remove File on Save"
                                                    >
                                                        <FaTrash className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* File Input */}
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="lesson-files-upload"
                                            name="Lesson_files"
                                            multiple
                                            onChange={handleLessonFormChange}
                                            className="hidden"
                                        />
                                        <label 
                                            htmlFor="lesson-files-upload"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition-all"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                                <FaUpload className="w-6 h-6 text-gray-400 mb-2" />
                                                <p className="text-xs text-gray-400">
                                                    <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-1">PDF, DOC, ZIP (Multiple allowed)</p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* New Files Preview */}
                                    {lessonFormData.newFiles && lessonFormData.newFiles.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs font-bold text-green-400">Selected for upload:</p>
                                            {Array.from(lessonFormData.newFiles).map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-300 pl-2">
                                                    <FaCheckCircle className="text-green-500 w-3 h-3" />
                                                    <span className="truncate">{file.name}</span>
                                                    <span className="text-gray-500">({(file.size / 1024).toFixed(0)}KB)</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)]">
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-gray-200">Active Status</span>
                                    <p className="text-xs muted mt-0.5">
                                        Make visible to students
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLessonToggleActive}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                                        lessonFormData.active ? 'bg-cyan-600' : 'bg-gray-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            lessonFormData.active ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    className="px-5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-white hover:bg-white/10 font-medium transition"
                                    onClick={() => {
                                        setShowLessonForm(false);
                                        setSelectedModule(null);
                                        setEditingLesson(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"

                                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02]"
                                >
                                    {editingLesson ? 'Save' : 'Create Lesson'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* QUIZ FORM MODAL */}
            {showQuizForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
                    <div className="card-strong w-full max-w-full sm:max-w-2xl p-4 sm:p-6 relative rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        
                        {/* Close Button */}
                        <button
                            className="absolute right-4 top-4 text-lg sm:text-xl p-2 rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                            onClick={() => {
                                setShowQuizForm(false);
                                setSelectedModuleQuiz(null);
                                setEditingQuiz(null);
                            }}
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>

                        {/* Header */}
                        <div className="flex flex-row items-center gap-4 mb-4 sm:mt-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold mb-1 line-clamp-1">
                                    {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                                </h2>
                                <p className="text-xs sm:text-sm muted line-clamp-2">
                                    {editingQuiz
                                        ? 'Update quiz settings'
                                        : 'Set up a new quiz for this module.'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (editingQuiz) {
                                handleUpdateQuiz();
                            } else {
                                handleCreateQuiz();
                            }
                        }} className="space-y-6 mt-2">
                            
                            {/* Quiz Name & Description */}
                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    name="description"
                                    value={quizFormData.description}
                                    onChange={handleQuizFormChange}
                                    required
                                    className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base focus-visible:outline-none"
                                    placeholder="Quiz Name/Title *"
                                />
                                <textarea
                                    name="instructions"
                                    value={quizFormData.instructions}
                                    onChange={handleQuizFormChange}
                                    rows="3"
                                    className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm focus-visible:outline-none resize-none"
                                    placeholder="Instructions for students (e.g. 'No calculators allowed')"
                                />
                            </div>

                            {/* Settings Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[var(--input-bg)] bg-opacity-50 border border-[var(--border-color)] rounded-xl p-4">
                                
                                {/* Dates Row */}
                                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-white/5 mb-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                            Start Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="start_date_time"
                                            value={quizFormData.start_date_time}
                                            onChange={handleQuizFormChange}
                                            required
                                            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 text-sm [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                            End Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="end_date_time"
                                            value={quizFormData.end_date_time}
                                            onChange={handleQuizFormChange}
                                            required
                                            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 text-sm [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                        Duration (min)
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={quizFormData.duration}
                                        onChange={handleQuizFormChange}
                                        required
                                        min="1"
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                        Attempts Allowed
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="attempts_allowed"
                                            value={quizFormData.attempts_allowed}
                                            onChange={handleQuizFormChange}
                                            min="-1"
                                            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 text-sm"
                                        />
                                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[15px] text-gray-500 pointer-events-none">
                                            -1 = ∞
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                        Pass %
                                    </label>
                                    <input
                                        type="number"
                                        name="pass_criteria"
                                        value={quizFormData.pass_criteria}
                                        onChange={handleQuizFormChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                        Wait time (hrs)
                                    </label>
                                    <input
                                        type="number"
                                        name="time_between_attempts"
                                        value={quizFormData.time_between_attempts}
                                        onChange={handleQuizFormChange}
                                        min="0"
                                        step="0.5"
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 text-sm"
                                    />
                                </div>
                                
                                <div >
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                        Weightage %
                                    </label>
                                    <input
                                        type="number"
                                        name="weightage"
                                        value={quizFormData.weightage}
                                        onChange={handleQuizFormChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={quizFormData.order}
                                        onChange={handleQuizFormChange}
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 text-sm"
                                    />
                                </div>
                                
                            </div>

                            {/* Toggles */}
                            <div className="space-y-3 pt-2">
                                {/* Allow Skip */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)]">
                                    <div className="flex-1">
                                        <span className="text-sm font-semibold text-gray-200">Allow Skipping</span>
                                        <p className="text-xs muted mt-0.5">Students can skip questions and return later</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleQuizFormChange({ target: { name: 'allow_skip', type: 'checkbox', checked: !quizFormData.allow_skip } })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                                            quizFormData.allow_skip ? 'bg-yellow-600' : 'bg-gray-600'
                                        }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quizFormData.allow_skip ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* View Answer Paper */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)]">
                                    <div className="flex-1">
                                        <span className="text-sm font-semibold text-gray-200">View Answer Paper</span>
                                        <p className="text-xs muted mt-0.5">Allow students to see correct answers after submission</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleQuizFormChange({ target: { name: 'view_answerpaper', type: 'checkbox', checked: !quizFormData.view_answerpaper } })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                                            quizFormData.view_answerpaper ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quizFormData.view_answerpaper ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)]">
                                    <div className="flex-1">
                                        <span className="text-sm font-semibold text-gray-200">Active Status</span>
                                        <p className="text-xs muted mt-0.5">Make visible to students immediately</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleQuizFormChange({ target: { name: 'active', type: 'checkbox', checked: !quizFormData.active } })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                                            quizFormData.active ? 'bg-green-600' : 'bg-gray-600'
                                        }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quizFormData.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 justify-between pt-2">
                                {/* Left side - Try buttons (only show when editing) */}
                                {editingQuiz && (
                                    <div className="flex flex-wrap gap-2 sm:mt-3 ">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // TODO: Implement try as student
                                                console.log('Try as student');
                                            }}
                                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs sm:text-sm font-medium hover:bg-cyan-500/20 transition flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Try as Student</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // TODO: Implement try as teacher
                                                console.log('Try as teacher');
                                            }}
                                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs sm:text-sm font-medium hover:bg-amber-500/20 transition flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <span>Try as Teacher</span>
                                        </button>
                                    </div>
                                )}

                                {/* Action Buttons Row */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowQuizForm(false);
                                            setSelectedModuleQuiz(null);
                                            setEditingQuiz(null);
                                        }}
                                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-white hover:bg-white/10 font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02]"
                                    >
                                        {editingQuiz ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EXERCISE FORM MODAL - Added Integration */}
            {showExerciseForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
                    <div className="card-strong w-full max-w-full sm:max-w-xl p-4 sm:p-6 relative rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute right-4 top-4 text-lg sm:text-xl p-2 rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                            onClick={() => {
                                setShowExerciseForm(false);
                                setEditingExercise(null);
                            }}
                        >
                            <FaTimes />
                        </button>

                        <div className="flex flex-row items-center gap-4 mb-6">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                                <FaCheckCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold mb-1">
                                    {editingExercise ? 'Edit Exercise' : 'Add Exercise'}
                                </h2>
                                <p className="text-xs sm:text-sm muted">Set up a simple coding exercise/quiz.</p>
                            </div>
                        </div>

                        <form onSubmit={handleExerciseSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-300">Description:</label>
                                <input
                                    className="input bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base focus-visible:outline-none w-full"
                                    name="description"
                                    placeholder="e.g. NFT Marketplace"
                                    value={exerciseFormData.description}
                                    onChange={handleExerciseFormChange}
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)]">
                                    <div className="flex-1">
                                        <span className="text-sm font-semibold text-gray-200">Allow student to view their answer paper:</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleExerciseFormChange({ target: { name: 'view_answerpaper', type: 'checkbox', checked: !exerciseFormData.view_answerpaper } })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                            exerciseFormData.view_answerpaper ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${exerciseFormData.view_answerpaper ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)]">
                                    <div className="flex-1">
                                        <span className="text-sm font-semibold text-gray-200">Active:</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleExerciseFormChange({ target: { name: 'active', type: 'checkbox', checked: !exerciseFormData.active } })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                            exerciseFormData.active ? 'bg-green-600' : 'bg-gray-600'
                                        }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${exerciseFormData.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    className="px-5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-white hover:bg-white/10 font-medium transition"
                                    onClick={() => setShowExerciseForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center min-w-[120px]"
                                >
                                    {editingExercise ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DESIGN MODULE MODAL */}
            {showDesignModuleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 animate-fade-in">
                    <div className="bg-[#1e1e24] w-full max-w-6xl h-[85vh] flex flex-col relative rounded-xl shadow-2xl overflow-hidden border border-white/10">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Design Module Content</h2>
                                    <p className="text-sm text-gray-400">Add, remove, and reorder lessons and quizzes</p>
                                </div>
                            </div>
                            <button onClick={closeDesignModule} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-[#18181b]">
                            {loadingDesignModule && !designModule ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                    <FaSync className="animate-spin text-3xl text-amber-500" />
                                    <span>Loading module configuration...</span>
                                </div>
                            ) : designModuleError ? (
                                <div className="h-full flex items-center justify-center text-red-400">
                                    <p>{designModuleError}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                    
                                    {/* Left Column: SELECTED UNITS (In Module) */}
                                    <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/10 overflow-hidden shadow-inner">
                                        <div className="p-2.5 sm:p-3 md:p-4 border-b border-white/10 bg-white/5">
                                            <h3 className="font-bold text-sm sm:text-base md:text-lg text-white flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span>
                                                Included Content
                                            </h3>
                                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Items currently in this module</p>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 md:p-3 space-y-1.5 sm:space-y-2 custom-scrollbar">
                                            {localSelected.length > 0 ? (
                                                localSelected.map((unit) => {
                                                    const isSelected = selectedInSelected === unit.id;
                                                    return (
                                                        <div key={unit.id} className="group">
                                                            <div 
                                                                onClick={() => setSelectedInSelected(isSelected ? null : unit.id)}
                                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                                                    isSelected 
                                                                    ? 'bg-blue-600/20 border-blue-500/50' 
                                                                    : 'bg-[#27272a] border-white/5 hover:border-white/10'
                                                                }`}
                                                            >
                                                                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                                                                    unit.type === 'lesson' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-green-500/10 text-green-400'
                                                                }`}>
                                                                    {unit.type === 'lesson' ? <FaBook className="w-3.5 h-3.5" /> : <FaCheckCircle className="w-3.5 h-3.5" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-sm text-gray-200 truncate">{unit.display_name.replace(/\(quiz\)|\(lesson\)/gi, '')}</div>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/30 px-1.5 py-0.5 rounded">{unit.type}</span>
                                                                        {unit.check_prerequisite && <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">Prerequisite</span>}
                                                                    </div>
                                                                </div>
                                                                <input 
                                                                    type="radio" 
                                                                    checked={isSelected}
                                                                    readOnly
                                                                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                                                                />
                                                            </div>

                                                            {/* Context Actions (only visible when selected) */}
                                                            <div className={`transition-all duration-300 overflow-hidden ${isSelected ? 'max-h-20 opacity-100 py-2' : 'max-h-0 opacity-0'}`}>
                                                                <div className="mx-2 p-2 bg-black/30 rounded-lg flex items-center justify-between border border-white/5">
                                                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                                                        <input 
                                                                            type="checkbox"
                                                                            checked={unit.check_prerequisite}
                                                                            onChange={() => handleTogglePrereq(unit.id)}
                                                                            className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                                                                        />
                                                                        <span className="text-xs text-gray-400 font-medium">Check Prerequisite</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                                    <FaBookOpen className="w-8 h-8 mb-2" />
                                                    <p className="text-sm">Module is empty</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Left Actions Footer */}
                                        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between gap-2">
                                            <button 
                                                onClick={handleRemoveUnit}
                                                disabled={!selectedInSelected}
                                                className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex-shrink-0"
                                            >
                                                <FaTrash className="inline mr-1" /> Remove
                                            </button>
                                            <div className="flex gap-1.5 sm:gap-2">
                                                <button 
                                                    onClick={moveUp}
                                                    disabled={!selectedInSelected}
                                                    className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 border border-[var(--border-color)] rounded-lg text-xs sm:text-sm font-medium hover:bg-[var(--input-bg)] transition flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                                >
                                                    <FaArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                    <span className="hidden md:inline">Up</span>
                                                </button>
                                                <button 
                                                    onClick={moveDown}
                                                    disabled={!selectedInSelected}
                                                    className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 border border-[var(--border-color)] rounded-lg text-xs sm:text-sm font-medium hover:bg-[var(--input-bg)] transition flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                                >
                                                    <FaArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                    <span className="hidden md:inline">Down</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: AVAILABLE POOL */}
                                    <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/10 overflow-hidden shadow-inner">
                                        <div className="p-2.5 sm:p-3 md:p-4 border-b border-white/10 bg-white/5">
                                            <h3 className="font-bold text-sm sm:text-base md:text-lg text-white flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                                                Available Items
                                            </h3>
                                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Unassigned lessons and quizzes</p>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 md:p-3 space-y-1.5 sm:space-y-2 custom-scrollbar">
                                            {localPool.length > 0 ? (
                                                localPool.map((item) => {
                                                    const isSelected = selectedInPool === item.value_key;
                                                    return (
                                                        <div 
                                                            key={item.value_key}
                                                            onClick={() => setSelectedInPool(isSelected ? null : item.value_key)}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                                                isSelected 
                                                                ? 'bg-green-600/20 border-green-500/50' 
                                                                : 'bg-[#27272a] border-white/5 hover:border-white/10'
                                                            }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                                                                item.type === 'lesson' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-green-500/10 text-green-400'
                                                            }`}>
                                                                {item.type === 'lesson' ? <FaBook className="w-3.5 h-3.5"/> : <FaCheckCircle className="w-3.5 h-3.5"/>}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-xs sm:text-sm text-gray-300 truncate">{item.display_name.replace(/\(quiz\)|\(lesson\)/gi, '')}</div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[10px] uppercase font-bold text-gray-600 bg-black/30 px-1.5 py-0.5 rounded">{item.type}</span>
                                                                </div>
                                                            </div>
                                                            <input 
                                                                type="radio" 
                                                                checked={isSelected}
                                                                readOnly
                                                                className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500 focus:ring-offset-gray-800 flex-shrink-0"
                                                            />
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 py-8 sm:py-12">
                                                    <FaCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                                                    <p className="text-xs sm:text-sm">No available items</p>
                                                    <p className="text-[10px] sm:text-xs muted mt-1">All items are assigned</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Actions Footer */}
                                        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                                            <button 
                                                onClick={handleAddUnit}
                                                disabled={!selectedInPool}
                                                className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs sm:text-sm font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex-shrink-0"
                                            >
                                                <FaPlus className="inline mr-1" /> Add
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            
            {/* DESIGN QUESTION PAPER MODAL */}
            {showDesignQuestionPaperModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 animate-fade-in">
                    {/* Replaced bg-[#1e1e24] with card-strong for consistent theme and updated sizing */}
                    <div className="card-strong w-full max-w-full sm:max-w-6xl h-[95vh] flex flex-col relative rounded-xl shadow-2xl overflow-hidden border border-[var(--border-color)]">
                        
                        {/* Styled consistent absolute cross button */}
                        <button
                            className="absolute right-4 top-4 z-10 text-lg sm:text-xl p-2 rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                            onClick={closeDesignQuestionPaper}
                        >
                            <FaTimes />
                        </button>

                        {/* Standardized Header */}
                        <div className="flex flex-row items-center gap-4 p-4 sm:p-6 border-b border-[var(--border-color)]">
                            <div className="w-12 h-12 flex-shrink-0 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                <FaList className="w-7 h-7 sm:w-8 sm:h-8" />
                            </div>
                            <div className="flex-1 min-w-0 pr-12">
                                <h2 className="text-xl sm:text-2xl font-bold mb-1 truncate text-[var(--text-primary)]">
                                    Design: {designingQuizName || "Question Paper"}
                                </h2>
                                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                                    Total Built Marks: <span className="font-bold text-amber-500">{questionPaperDesign?.question_paper?.total_marks || 0}</span>
                                </p>
                            </div>
                        </div>

            {/* Tab Bar + Save Settings button on same row */}
            <div className="flex items-center justify-between px-4 pt-3 bg-[#18181b] border-b border-white/10">
                <div className="flex items-center gap-1">
                    {[
                        { id: 'FIXED', label: 'Fixed Questions', icon: <FaCheck className="w-3.5 h-3.5" /> },
                        { id: 'RANDOM', label: 'Random Sets', icon: <FaRandom className="w-3.5 h-3.5" /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setQPaperTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
                                qPaperTab === tab.id
                                ? 'border-amber-500 text-amber-400 bg-black/20'
                                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
                {/* Save settings button — always visible, right aligned in tab row */}
                <form onSubmit={handleSaveQPaperSettings} className="flex items-center pb-2">
                    <button
                        type="submit"
                        disabled={loadingQuestionPaper}
                        className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center min-w-[120px]"
                    >
                        Save 
                    </button>
                </form>
            </div>

            {/* Shuffle Toggles — always visible below tab bar, above body */}
            


            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-[#18181b]">
                {loadingQuestionPaper && !questionPaperDesign ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                        <FaSync className="animate-spin text-3xl text-amber-500" />
                        <span>Loading paper design...</span>
                    </div>
                ) : questionPaperError ? (
                    <div className="h-full flex items-center justify-center text-red-400">
                        <p>{questionPaperError}</p>
                    </div>
                ) : (
                    <>
                    {/* FIXED / RANDOM TABS: Two-column layout */}
                    {(qPaperTab === 'FIXED' || qPaperTab === 'RANDOM') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

                            {/* LEFT: Added questions / Configured sets */}
                            <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/10 overflow-hidden shadow-inner">
                                <div className="p-2.5 sm:p-3 md:p-4 border-b border-white/10 bg-white/5">
                                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-white flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${qPaperTab === 'FIXED' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                                        {qPaperTab === 'FIXED' ? 'Fixed Questions' : 'Random Sets'}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                        {qPaperTab === 'FIXED' ? 'Questions always included in this paper' : 'Sets where N questions are picked randomly'}
                                    </p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 md:p-3 space-y-1.5 sm:space-y-2 custom-scrollbar">

                                    {/* FIXED list */}
                                    {qPaperTab === 'FIXED' && (
                                        questionPaperDesign?.fixed_questions?.length > 0 ? (
                                            questionPaperDesign.fixed_questions.map(q => (
                                                <div
                                                    key={q.id}
                                                    onClick={() => toggleQPaperSelection(q.id, selectedFixedQs, setSelectedFixedQs)}
                                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                                        selectedFixedQs.includes(q.id)
                                                        ? 'bg-red-600/15 border-red-500/50'
                                                        : 'bg-[#27272a] border-white/5 hover:border-white/10'
                                                    }`}
                                                >
                                                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-blue-500/10 text-blue-400">
                                                        <FaCheck className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-gray-200 truncate">{q.summary || 'Untitled Question'}</div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/30 px-1.5 py-0.5 rounded">{q.type}</span>
                                                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{q.points} pts</span>
                                                        </div>
                                                    </div>
                                                    <input type="checkbox" readOnly checked={selectedFixedQs.includes(q.id)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500 focus:ring-offset-0 flex-shrink-0" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 py-8">
                                                <FaCheck className="w-8 h-8 mb-2" />
                                                <p className="text-sm">No fixed questions yet</p>
                                                <p className="text-xs mt-1">Search and add from the right panel</p>
                                            </div>
                                        )
                                    )}

                                    {/* RANDOM list */}
                                    {qPaperTab === 'RANDOM' && (
                                        questionPaperDesign?.random_sets?.length > 0 ? (
                                            questionPaperDesign.random_sets.map(set => (
                                                <div
                                                    key={set.id}
                                                    onClick={() => toggleQPaperSelection(set.id, selectedRandomSets, setSelectedRandomSets)}
                                                    className={`flex flex-col gap-2 p-3 rounded-lg cursor-pointer transition-all border ${
                                                        selectedRandomSets.includes(set.id)
                                                        ? 'bg-red-600/15 border-red-500/50'
                                                        : 'bg-[#27272a] border-white/5 hover:border-white/10'
                                                    }`}
                                                >
                                                    {/* Header Row */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-purple-500/10 text-purple-400">
                                                            <FaRandom className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm text-gray-200">
                                                                Pick <span className="text-amber-400 font-bold">{set.num_questions}</span> from <span className="text-cyan-400 font-bold">{set.questions?.length || 0}</span> questions
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                
                                                                <span className="text-[10px] text-gray-500">Set #{set.id}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Expand/Collapse Dropdown Trigger */}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevents checking the box when opening the dropdown
                                                                setExpandedRandomSets(prev => 
                                                                    prev.includes(set.id) ? prev.filter(id => id !== set.id) : [...prev, set.id]
                                                                );
                                                            }}
                                                            className="p-1.5 hover:bg-white/10 rounded ml-1 text-gray-400 transition"
                                                            title="View Questions"
                                                        >
                                                            <svg className={`w-4 h-4 transition-transform ${expandedRandomSets.includes(set.id) ? 'rotate-180 text-amber-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </button>

                                                        <input type="checkbox" readOnly checked={selectedRandomSets.includes(set.id)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500 focus:ring-offset-0 flex-shrink-0 ml-1" />
                                                    </div>

                                                    {/* Inner Questions List (Revealed cleanly when expanded) */}
                                                    {expandedRandomSets.includes(set.id) && set.questions?.length > 0 && (
                                                        <div 
                                                            className="mt-1 pt-2 border-t border-white/5 space-y-2 max-h-48 overflow-y-auto custom-scrollbar"
                                                            onClick={(e) => e.stopPropagation()} // Stop propagation here too so clicking text doesn't check the set
                                                        >
                                                            {set.questions.map((q, idx) => (
                                                                <div key={q.id || idx} className="flex gap-2 items-start text-xs text-gray-400 bg-black/20 p-2 rounded border border-white/5">
                                                                    <span className="text-gray-500 font-mono mt-0.5">{idx + 1}.</span>
                                                                    <div className="flex-1">
                                                                        <div 
                                                                            className="line-clamp-2 mb-1.5 text-gray-300" 
                                                                            dangerouslySetInnerHTML={{ __html: q.summary || q.description || `Question ID: ${q.id}` }}
                                                                        />
                                                                        {/* Sub-tags showing individual marks underneath each list item */}
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[9px] uppercase font-bold text-gray-500 bg-black/30 px-1 py-0.5 rounded">{q.type || 'Question'}</span>
                                                                            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">{q.points} pts</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 py-8">
                                                <FaRandom className="w-8 h-8 mb-2" />
                                                <p className="text-sm">No random sets yet</p>
                                                <p className="text-xs mt-1">Search and build sets from the right panel</p>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Left Footer: Remove button */}
                                
                                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                                    <button
                                        onClick={qPaperTab === 'FIXED' ? handleRemoveFixed : handleRemoveRandomSets}
                                        disabled={qPaperTab === 'FIXED' ? (!selectedFixedQs.length || loadingQuestionPaper) : (!selectedRandomSets.length || loadingQuestionPaper)}
                                        className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex-shrink-0"
                                    >
                                        <FaTrash className="w-3 h-3 inline mr-1" />
                                        Remove ({qPaperTab === 'FIXED' ? selectedFixedQs.length : selectedRandomSets.length})
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT: Search + Results */}
                            <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/10 overflow-hidden shadow-inner">
                                <div className="p-2.5 sm:p-3 md:p-4 border-b border-white/10 bg-white/5">
                                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-white flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                                        Question Bank
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Filter and select questions to add</p>
                                </div>

                                {/* Filter controls */}
                                <div className="p-2.5 sm:p-3 border-b border-white/10 bg-black/10 flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Marks"
                                        value={filterMarks}
                                        onChange={e => setFilterMarks(e.target.value)}
                                        className="w-20 bg-[#27272a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/60 transition-colors"
                                    />
                                    <select
                                        value={filterType}
                                        onChange={e => setFilterType(e.target.value)}
                                        className="flex-1 bg-[#27272a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-500/60 transition-colors"
                                    >
                                        <option value="">----------</option>
                                        <option value="mcq">Single Correct Choice</option>
                                        <option value="mcc">Multiple Correct Choices</option>
                                        <option value="code">Code</option>
                                        <option value="assignment_upload">Assignment Upload</option>
                                        <option value="integer">Answer in Integer</option>
                                        <option value="string">Answer in String</option>
                                        <option value="float">Answer in Float</option>
                                        <option value="arrange">Arrange in Order</option>
                                    </select>
                                    
                                    <button
                                        onClick={handleSearchQPaper}
                                        disabled={loadingQuestionPaper}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                                    >
                                        {loadingQuestionPaper ? <FaSync className="animate-spin w-3 h-3" /> : <FaSearch className="w-3 h-3" />}
                                        Find
                                    </button>
                                </div>

                                {/* Results */}
                                <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 md:p-3 space-y-1.5 sm:space-y-2 custom-scrollbar">
                                    {availableQuestions.length > 0 ? (
                                        availableQuestions.map(q => (
                                            <div
                                                key={q.id}
                                                onClick={() => toggleQPaperSelection(q.id, selectedPoolQs, setSelectedPoolQs)}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                                    selectedPoolQs.includes(q.id)
                                                    ? 'bg-green-600/20 border-green-500/50'
                                                    : 'bg-[#27272a] border-white/5 hover:border-white/10'
                                                }`}
                                            >
                                                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-green-500/10 text-green-400">
                                                    <FaList className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-xs sm:text-sm text-gray-300 truncate">{q.summary || 'Untitled Question'}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] uppercase font-bold text-gray-600 bg-black/30 px-1.5 py-0.5 rounded">{q.type}</span>
                                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{q.points} pts</span>
                                                    </div>
                                                </div>
                                                <input type="radio" readOnly checked={selectedPoolQs.includes(q.id)} className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500 focus:ring-offset-0 flex-shrink-0" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 py-8 sm:py-12">
                                            <FaSearch className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                                            <p className="text-xs sm:text-sm">No results yet</p>
                                            <p className="text-[10px] sm:text-xs mt-1">Use filters above and click Find</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Footer: Add button(s) */}

                                

                                
                                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                                    {qPaperTab === 'FIXED' && (
                                        
                                        <button
                                            onClick={handleAddFixed}
                                            disabled={!selectedPoolQs.length || loadingQuestionPaper}
                                            className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs sm:text-sm font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex-shrink-0"
                                        >
                                            <FaPlus className="w-3 h-3 inline mr-1" />
                                            Add {selectedPoolQs.length > 0 ? selectedPoolQs.length : ''} to Fixed
                                        </button>
                                    )}
                                    
                                    {qPaperTab === 'RANDOM' && (
                                        <div className="w-full flex items-center justify-between ">
                                            <button
                                                onClick={handleAddRandomSet}
                                                disabled={!selectedPoolQs.length || loadingQuestionPaper || !randomSetCount}
                                                className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs sm:text-sm font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex-shrink-0"
                                            >
                                                <FaRandom className="w-3 h-3 inline mr-1" />
                                                Pick {randomSetCount || 'N'} from {selectedPoolQs.length > 0 ? selectedPoolQs.length : '0'}
                                            </button>
                                            <input
                                                type="number"
                                                placeholder="Pick N"
                                                title="Number of random questions to pick from selected"
                                                value={randomSetCount}
                                                onChange={e => setRandomSetCount(e.target.value)}
                                                className="w-24 bg-[#27272a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-colors flex-shrink-0 text-center"
                                                min="1"
                                                max={selectedPoolQs.length || 1}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </div>

            {/* Shuffle Toggles — always visible below tab bar, above body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 sm:px-6 pb-3 bg-[#18181b] border-b border-white/5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)]">
                    <div className="flex-1 pr-3">
                        <span className="text-sm font-semibold text-gray-200">Shuffle Questions</span>
                        <p className="text-xs muted mt-0.5">Randomize question order for each attempt</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShuffleQuestions(prev => !prev)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                            shuffleQuestions ? 'bg-amber-600' : 'bg-gray-600'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shuffleQuestions ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)]">
                    <div className="flex-1 pr-3">
                        <span className="text-sm font-semibold text-gray-200">Shuffle Test Cases</span>
                        <p className="text-xs muted mt-0.5">Randomize test case order for coding questions</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShuffleTestcases(prev => !prev)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                            shuffleTestcases ? 'bg-amber-600' : 'bg-gray-600'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shuffleTestcases ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
                    </div>
                </div>
            )}

            {/* MODULES LIST */}
            {modules.length > 0 ? (
            modules.map((module) => (
                <div key={module.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 gap-4">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg line-clamp-1">{module.name}</h3>
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                                        module.active
                                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                    }`}
                                >
                                    {module.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {module.description && (
                                <p className="text-xs muted mt-1 line-clamp-2">
                                    {module.description}
                                </p>
                            )}
                            <div className="flex items-center gap-3 text-xs muted mt-2">
                                <div className="flex items-center gap-1.5">
                                    <FaBook className="w-3 h-3" />
                                    <span>{module.units_count} unit{module.units_count !== 1 ? 's' : ''}</span>
                                </div>
                                <span>•</span>
                                <span>Order: {module.order}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => openCreateLesson(module)}
                                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold hover:from-cyan-500/30 hover:to-cyan-600/30 hover:border-cyan-500/50 transition-all duration-200 flex items-center gap-1 sm:gap-1.5 shadow-sm hover:shadow-cyan-500/20"
                            >
                                <FaPlus className="w-3 h-3 hidden sm:inline" />
                                <span className="hidden sm:inline">Add Lesson</span>
                                <span className="inline sm:hidden">Lesson</span>
                            </button>
                            <button
                                onClick={() => openCreateQuiz(module)}
                                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold hover:from-green-500/30 hover:to-green-600/30 hover:border-green-500/50 transition-all duration-200 flex items-center gap-1 sm:gap-1.5 shadow-sm hover:shadow-green-500/20"
                            >
                                <FaPlus className="w-3 h-3 hidden sm:inline" />
                                <span className="hidden sm:inline ">Add Quiz</span>
                                <span className="inline sm:hidden">Quiz</span>
                            </button>
                            <button
                                onClick={() =>  openCreateExercise(module)}
                                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-500/50 transition-all duration-200 flex items-center gap-1 sm:gap-1.5 shadow-sm hover:shadow-purple-500/20"
                            >
                                <FaPlus className="w-3 h-3 hidden sm:inline" />
                                <span className="hidden sm:inline">Add Exercise</span>
                                <span className="inline sm:hidden">Exercise</span>
                            </button>
                            <button
                                onClick={() => {
                                    openDesignModule(module.id);
                                }}
                                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold hover:from-amber-500/30 hover:to-amber-600/30 hover:border-amber-500/50 transition-all duration-200 flex items-center gap-1 sm:gap-1.5 shadow-sm hover:shadow-amber-500/20"
                            >
                                <svg className="w-3 h-3 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                </svg>
                                <span className="hidden sm:inline">Design</span>
                                <span className="inline sm:hidden">Design</span>
                            </button>
                            
                            {/* Three-dot dropdown menu */}
                            <div className="relative" ref={openDropdownId === module.id ? dropdownRef : null}>
                                <button 
                                    onClick={() => toggleDropdown(module.id)}
                                    className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                >
                                    <FaEllipsisV className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                
                                {/* Dropdown Menu */}
                                {openDropdownId === module.id && (
                                    <div className="absolute right-0 mt-2 z-50 w-32 bg-gray-900 border border-[var(--border-color)] rounded-lg shadow-lg py-1 flex flex-col text-sm animate-fade-in">
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-500/10 transition text-left"
                                            onClick={() => {
                                                openEditModule(module);
                                                setOpenDropdownId(null);
                                            }}
                                        >
                                            <FaEdit className="w-4 h-4 text-blue-400" /> 
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 transition text-left"
                                            onClick={() => {
                                                if (window.confirm(`Delete module "${module.name}"?`)) {
                                                    handleDeleteModule(courseId, module.id);
                                                }
                                                setOpenDropdownId(null);
                                            }}
                                        >
                                            <FaTrash className="w-4 h-4 text-red-400" /> 
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
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
                                                    onClick={() => {
                                                        if (window.confirm(`Delete lesson "${unit.name}"?`)) {
                                                            handleDeleteLesson(module.id, unit.lesson_id);
                                                        }
                                                    }}
                                                    className="px-3 py-1 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/20 transition"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : unit.is_exercise ? (
                                            <>
                                                <button
                                                    onClick={() => openDesignQuestionPaper(unit.quiz_id, unit.questionpaper_id || null, unit.name)}
                                                    className="px-3 py-1 border border-purple-500/30 text-purple-400 rounded text-xs hover:bg-purple-500/20 transition"
                                                >
                                                    Questions
                                                </button>
                                                <button
                                                    onClick={() => openEditExercise(module, unit)}
                                                    className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Delete exercise "${unit.name}"?`)) {
                                                            handleDeleteExercise(module.id, unit.quiz_id);
                                                        }
                                                    }}
                                                    className="px-3 py-1 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/20 transition"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => openDesignQuestionPaper(unit.quiz_id, unit.questionpaper_id || null, unit.name)}
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
                                                    onClick={() => {
                                                        if (window.confirm(`Delete quiz "${unit.name}"?`)) {
                                                            handleDeleteQuiz(module.id, unit.quiz_id);
                                                        }
                                                    }}
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