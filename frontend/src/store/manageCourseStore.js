import { create } from 'zustand';
import {
    getTeacherCourse, getCourseModules, createModule, updateModule, deleteModule,
    createLesson, updateLesson, deleteLesson, createQuiz, updateQuiz, deleteQuiz,
    getCourseEnrollments, approveEnrollment, rejectEnrollment, removeEnrollment,
    reorderCourseModules, reorderModuleUnits, getCourseAnalytics, getTeacherLesson,
    getTeacherQuiz, getCourseDesign, addModulesToCourse, changeCourseModuleOrder, removeModulesFromCourse,
    changeCourseModulePrerequisiteCompletion, changeCourseModulePrerequisitePassing
} from '../api/api';

const initialModuleForm = {
    name: '',
    description: '',
    order: 1,
    check_prerequisite: false,
    active: true,
};
const initialLessonForm = {
    name: '',
    description: '',
    video_path: '',
    active: true,
    order: 1,
};
const initialQuizForm = {
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
};

const useManageCourseStore = create((set, get) => ({
    // State
    activeTab: 'Modules',
    course: null,
    modules: [],
    loading: true,
    error: null,
    
    analytics: null,
    loadingAnalytics: false,
    showQuizQuestionManager: false,
    selectedQuizId: null,
    moduleOrder: [],
    unitOrders: {},
    savingOrder: false,
    showModuleForm: false,
    editingModule: null,
    showLessonForm: false,
    showQuizForm: false,
    selectedModule: null,
    editingLesson: null,
    editingQuiz: null,
    moduleFormData: { ...initialModuleForm },
    lessonFormData: { ...initialLessonForm },
    quizFormData: { ...initialQuizForm },

    // Actions
    setActiveTab: (tab) => set({ activeTab: tab }),
    setShowQuizQuestionManager: (val) => set({ showQuizQuestionManager: val }),
    setSelectedQuizId: (id) => set({ selectedQuizId: id }),

    // Load course data
    loadCourseData: async (courseId) => {
        set({ loading: true, error: null });
        try {
            const courseData = await getTeacherCourse(courseId);
            if (!courseData) throw new Error('Course data not found');
            if (courseData.error) throw new Error(courseData.error);
            set({ course: courseData });
            if (courseData.modules && Array.isArray(courseData.modules)) {
                set({ modules: courseData.modules });
            } else {
                const modulesData = await getCourseModules(courseId);
                set({ modules: Array.isArray(modulesData) ? modulesData : [] });
            }
        } catch (err) {
            set({ error: err.message, course: null });
        } finally {
            set({ loading: false });
        }
    },

    // Analytics tab ============================================================
    loadAnalytics: async (courseId) => {
        set({ loadingAnalytics: true });
        try {
            const data = await getCourseAnalytics(courseId);
            set({ analytics: data });
        } catch (err) {
            set({ analytics: null });
        } finally {
            set({ loadingAnalytics: false });
        }
    },

    //============================================================


    // Enrollments tab ============================================================

    enrollments: { enrolled: [], pending_requests: [], rejected: [] },
    loadingEnrollments: false,
    enrollmentsError: null,

    // Load all enrollments for a course
    loadEnrollments: async (courseId) => {
        set({ loadingEnrollments: true, enrollmentsError: null });
        try {
            const data = await getCourseEnrollments(courseId);
            set({
                enrollments: {
                    enrolled: data.enrolled || [],
                    pending_requests: data.pending_requests || [],
                    rejected: data.rejected || []
                }
            });
        } catch (err) {
            set({ enrollmentsError: err?.response?.data?.error || 'Failed to load enrollments' });
        } finally {
            set({ loadingEnrollments: false });
        }
    },

    // Approve enrollments (single or bulk)
    approveEnrollments: async (courseId, userIds, wasRejected = false) => {
        set({ loadingEnrollments: true, enrollmentsError: null });
        try {
            await approveEnrollment(courseId, userIds, wasRejected);
            await get().loadEnrollments(courseId);
        } catch (err) {
            set({ enrollmentsError: err?.response?.data?.error || 'Failed to approve enrollment' });
        } finally {
            set({ loadingEnrollments: false });
        }
    },

    // Reject enrollments (single or bulk)
    rejectEnrollments: async (courseId, userIds, wasEnrolled = false) => {
        set({ loadingEnrollments: true, enrollmentsError: null });
        try {
            await rejectEnrollment(courseId, userIds, wasEnrolled);
            await get().loadEnrollments(courseId);
        } catch (err) {
            set({ enrollmentsError: err?.response?.data?.error || 'Failed to reject enrollment' });
        } finally {
            set({ loadingEnrollments: false });
        }
    },

    // Remove enrollments (single or bulk)
    removeEnrollments: async (courseId, userIds) => {
        set({ loadingEnrollments: true, enrollmentsError: null });
        try {
            await removeEnrollment(courseId, userIds);
            await get().loadEnrollments(courseId);
        } catch (err) {
            set({ enrollmentsError: err?.response?.data?.error || 'Failed to remove enrollment' });
        } finally {
            set({ loadingEnrollments: false });
        }
    },


    //============================================================



    // DESIGN COURSE TAB ============================================================

    designCourse: null,
    loadingDesignCourse: false,
    designCourseError: null,

    loadDesignCourse: async (courseId) => {
        set({ loadingDesignCourse: true, designCourseError: null });
        try {
            const data = await getCourseDesign(courseId);
            set({ designCourse: data });
        } catch (err) {
            set({ designCourseError: err.message, designCourse: null });
        } finally {
            set({ loadingDesignCourse: false });
        }
    },

    handleAddModulesToCourse: async (courseId, moduleList) => {
        set({ loadingDesignCourse: true });
        try {
            await addModulesToCourse(courseId, moduleList);
            await get().loadDesignCourse(courseId);
            await get().loadCourseData(courseId); // keep modules in sync
        } catch (err) {
            set({ designCourseError: err.message });
        } finally {
            set({ loadingDesignCourse: false });
        }
    },

    handleChangeCourseModuleOrder: async (courseId, orderedList) => {
        set({ loadingDesignCourse: true });
        try {
            await changeCourseModuleOrder(courseId, orderedList);
            await get().loadDesignCourse(courseId);
            await get().loadCourseData(courseId);
        } catch (err) {
            set({ designCourseError: err.message });
        } finally {
            set({ loadingDesignCourse: false });
        }
    },

    handleRemoveModulesFromCourse: async (courseId, deleteList) => {
        set({ loadingDesignCourse: true });
        try {
            await removeModulesFromCourse(courseId, deleteList);
            await get().loadDesignCourse(courseId);
            await get().loadCourseData(courseId);
        } catch (err) {
            set({ designCourseError: err.message });
        } finally {
            set({ loadingDesignCourse: false });
        }
    },

    handleChangeCourseModulePrerequisiteCompletion: async (courseId, checkPrereqList) => {
        set({ loadingDesignCourse: true });
        try {
            await changeCourseModulePrerequisiteCompletion(courseId, checkPrereqList);
            await get().loadDesignCourse(courseId);
        } catch (err) {
            set({ designCourseError: err.message });
        } finally {
            set({ loadingDesignCourse: false });
        }
    },

    handleChangeCourseModulePrerequisitePassing: async (courseId, checkPrereqPassesList) => {
        set({ loadingDesignCourse: true });
        try {
            await changeCourseModulePrerequisitePassing(courseId, checkPrereqPassesList);
            await get().loadDesignCourse(courseId);
        } catch (err) {
            set({ designCourseError: err.message });
        } finally {
            set({ loadingDesignCourse: false });
        }
    },

    //============================================================






    // Module tab ============================================================

    initializeOrdering: () => {
        const modules = get().modules;
        const orderedModules = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));
        set({ moduleOrder: orderedModules.map(m => m.id) });
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
        set({ unitOrders: orders });
    },
    moveModule: (moduleId, direction) => {
        const moduleOrder = [...get().moduleOrder];
        const currentIndex = moduleOrder.indexOf(moduleId);
        if (currentIndex === -1) return;
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= moduleOrder.length) return;
        [moduleOrder[currentIndex], moduleOrder[newIndex]] = [moduleOrder[newIndex], moduleOrder[currentIndex]];
        set({ moduleOrder });
    },
    saveModuleOrder: async (courseId) => {
        set({ savingOrder: true });
        try {
            const moduleOrder = get().moduleOrder;
            const moduleOrders = moduleOrder.map((moduleId, index) => ({
                module_id: moduleId,
                order: index + 1
            }));
            await reorderCourseModules(courseId, moduleOrders);
            await get().loadCourseData(courseId);
        } finally {
            set({ savingOrder: false });
        }
    },
    moveUnit: (moduleId, unitId, direction) => {
        const unitOrders = { ...get().unitOrders };
        const units = unitOrders[moduleId] || [];
        const currentIndex = units.findIndex(u => u.unit_id === unitId);
        if (currentIndex === -1) return;
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= units.length) return;
        [units[currentIndex], units[newIndex]] = [units[newIndex], units[currentIndex]];
        unitOrders[moduleId] = units;
        set({ unitOrders });
    },
    saveUnitOrder: async (moduleId) => {
        set({ savingOrder: true });
        try {
            const units = get().unitOrders[moduleId] || [];
            const unitOrdersData = units.map((unit, index) => ({
                unit_id: unit.unit_id,
                order: index + 1
            }));
            await reorderModuleUnits(moduleId, unitOrdersData);
            await get().loadCourseData(get().course.id);
        } finally {
            set({ savingOrder: false });
        }
    },

    // Module CRUD
    setShowModuleForm: (val) => set({ showModuleForm: val }),
    setEditingModule: (mod) => set({ editingModule: mod }),
    setModuleFormData: (data) => set({ moduleFormData: data }),
    handleModuleFormChange: (e) => {
        const { name, value, type, checked } = e.target;
        set(state => ({
            moduleFormData: {
                ...state.moduleFormData,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    },
    handleCreateModule: async (courseId) => {
        await createModule(courseId, get().moduleFormData);
        set({ showModuleForm: false, moduleFormData: { ...initialModuleForm } });
        await get().loadCourseData(courseId);
    },
    handleUpdateModule: async (courseId) => {
        await updateModule(courseId, get().editingModule.id, get().moduleFormData);
        set({ showModuleForm: false, editingModule: null, moduleFormData: { ...initialModuleForm } });
        await get().loadCourseData(courseId);
    },
    handleDeleteModule: async (courseId, moduleId) => {
        await deleteModule(courseId, moduleId);
        await get().loadCourseData(courseId);
    },
    openEditModule: (module) => {
        set({
            editingModule: module,
            moduleFormData: {
                name: module.name,
                description: module.description,
                order: module.order,
                check_prerequisite: module.check_prerequisite,
                active: module.active,
            },
            showModuleForm: true
        });
    },
    openCreateModule: (modules) => {
        set({
            editingModule: null,
            moduleFormData: { ...initialModuleForm, order: modules.length + 1 },
            showModuleForm: true
        });
    },

    // 

    // Lesson CRUD
    setShowLessonForm: (val) => set({ showLessonForm: val }),
    setSelectedModule: (mod) => set({ selectedModule: mod }),
    setEditingLesson: (lesson) => set({ editingLesson: lesson }),
    setLessonFormData: (data) => set({ lessonFormData: data }),
    handleLessonFormChange: (e) => {
        const { name, value, type, checked } = e.target;
        set(state => ({
            lessonFormData: {
                ...state.lessonFormData,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    },
    openCreateLesson: (module) => {
        const lastUnit = module.units && module.units.length > 0
            ? Math.max(...module.units.map(u => u.order))
            : 0;
        set({
            selectedModule: module,
            editingLesson: null,
            lessonFormData: { ...initialLessonForm, order: lastUnit + 1 },
            showLessonForm: true
        });
    },
    openEditLesson: async (module, unit) => {
        set({ selectedModule: module, editingLesson: unit });
        try {
            const lessonData = await getTeacherLesson(module.id, unit.lesson_id);
            set({
                lessonFormData: {
                    name: lessonData.name || '',
                    description: lessonData.description || '',
                    video_path: lessonData.video_path || '',
                    active: lessonData.active !== undefined ? lessonData.active : true,
                    order: lessonData.order || unit.order,
                },
                showLessonForm: true
            });
        } catch {
            set({
                lessonFormData: {
                    name: unit.name || '',
                    description: '',
                    video_path: '',
                    active: true,
                    order: unit.order,
                },
                showLessonForm: true
            });
        }
    },
    handleCreateLesson: async (moduleId) => {
        await createLesson(moduleId, get().lessonFormData);
        set({ showLessonForm: false, selectedModule: null, lessonFormData: { ...initialLessonForm } });
        await get().loadCourseData(get().course.id);
    },
    handleDeleteLesson: async (moduleId, lessonId) => {
        await deleteLesson(moduleId, lessonId);
        await get().loadCourseData(get().course.id);
    },

    // Quiz CRUD
    setShowQuizForm: (val) => set({ showQuizForm: val }),
    setEditingQuiz: (quiz) => set({ editingQuiz: quiz }),
    setQuizFormData: (data) => set({ quizFormData: data }),
    handleQuizFormChange: (e) => {
        const { name, value, type, checked } = e.target;
        set(state => ({
            quizFormData: {
                ...state.quizFormData,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
            }
        }));
    },
    openCreateQuiz: (module) => {
        const lastUnit = module.units && module.units.length > 0
            ? Math.max(...module.units.map(u => u.order))
            : 0;
        set({
            selectedModule: module,
            editingQuiz: null,
            quizFormData: { ...initialQuizForm, order: lastUnit + 1 },
            showQuizForm: true
        });
    },
    openEditQuiz: async (module, unit) => {
        set({ selectedModule: module, editingQuiz: unit });
        try {
            const quizData = await getTeacherQuiz(module.id, unit.quiz_id);
            set({
                quizFormData: {
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
                },
                showQuizForm: true
            });
        } catch {
            set({
                quizFormData: {
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
                },
                showQuizForm: true
            });
        }
    },
    handleCreateQuiz: async (moduleId) => {
        await createQuiz(moduleId, get().quizFormData);
        set({ showQuizForm: false, selectedModule: null, quizFormData: { ...initialQuizForm } });
        await get().loadCourseData(get().course.id);
    },
    handleDeleteQuiz: async (moduleId, quizId) => {
        await deleteQuiz(moduleId, quizId);
        await get().loadCourseData(get().course.id);
    },







    // Quiz Question Manager
    openQuizQuestionManager: (quizId) => set({ selectedQuizId: quizId, showQuizQuestionManager: true }),
    handleQuizQuestionsUpdate: () => get().loadCourseData(get().course.id),
}));

export default useManageCourseStore;