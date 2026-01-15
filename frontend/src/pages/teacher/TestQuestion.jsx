import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaCheck, FaTimes, FaCode, FaPlay, FaDownload, FaArrowLeft, FaLightbulb, FaFileAlt, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { AiOutlineWarning } from 'react-icons/ai';
import { BiSkipNext } from 'react-icons/bi';
import { MdTimer } from 'react-icons/md';
import useQuizStore from '../../store/quiz_QuestionStore';
import { useAuthStore } from '../../store/authStore';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import QuestionActionButtons from '../../components/teacher/QuestionActionButtons';
import Header from '../../components/layout/Header';

const TestQuestion = () => {
    const { questionpaperId, moduleId, courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    const {
        currentQuestion,
        paper,
        loading,
        error,
        answerResult,
        timeLeft,
        attemptNum,
        startQuiz,
        submitAnswer,
        skipQuestion,
        completeQuiz,
        quitQuiz,
        updateTimeLeft,
        clearError,
        resetQuiz
    } = useQuizStore();

    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const timerIntervalRef = useRef(null);
    const initializingRef = useRef(false);

    // Initialize quiz on mount - only once
useEffect(() => {
    let cancelled = false;

    const init = async () => {
        if (cancelled || initializingRef.current) {
            return;
        }
        
        if (questionpaperId && moduleId && courseId) {
            initializingRef.current = true;
            clearError();
            
            try {
                console.log('Starting test quiz with params:', { questionpaperId, moduleId, courseId });
                const quizData = await startQuiz(questionpaperId, moduleId, courseId, null);
                console.log('Quiz started:', quizData);
            } catch (err) {
                console.error('Failed to initialize test quiz:', err);
                if (!cancelled) {
                    initializingRef.current = false;
                }
            }
        }
    };

    init();

    return () => {
        cancelled = true;
    };
}, [questionpaperId, moduleId, courseId, startQuiz, clearError]);

// Initialize answer when currentQuestion changes
useEffect(() => {
    if (currentQuestion) {
        if (currentQuestion.type === 'code' && currentQuestion.snippet) {
            setUserAnswer(currentQuestion.snippet);
        } else if (currentQuestion.type === 'mcc') {
            setUserAnswer([]);
        } else {
            setUserAnswer('');
        }
    }
}, [currentQuestion]);

// Timer effect
useEffect(() => {
    if (timeLeft > 0) {
        timerIntervalRef.current = setInterval(() => {
            updateTimeLeft(timeLeft - 1);
            if (timeLeft <= 1) {
                handleAutoComplete();
            }
        }, 1000);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }
}, [timeLeft, updateTimeLeft]);

    const handleAutoComplete = async () => {
        try {
            await completeQuiz();
            resetQuiz();
            navigate('/teacher/questions');
        } catch (err) {
            console.error('Auto-complete failed:', err);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getTimerStatus = () => {
        if (timeLeft < 300) return { color: 'red', bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', animate: true };
        if (timeLeft < 600) return { color: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-400', animate: false };
        return { color: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', animate: false };
    };

    const handleAnswerChange = (value) => {
        setUserAnswer(value);
        setShowResult(false);
    };

    const formatAnswerData = (questionType, answer) => {
        switch (questionType?.toLowerCase()) {
            case 'code':
                return { answer: answer };
            case 'mcq':
                return { answer: answer };
            case 'mcc':
                return { answer: Array.isArray(answer) ? answer : [answer] };
            case 'integer':
                return { answer: parseInt(answer) };
            case 'float':
                return { answer: parseFloat(answer) };
            case 'string':
            default:
                return { answer: answer };
        }
    };

    const handleSubmitAnswer = async () => {
        if (!currentQuestion) return;

        if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
            alert('Please provide an answer before submitting.');
            return;
        }

        setSubmitting(true);
        setShowResult(false);

        try {
            const answerData = formatAnswerData(currentQuestion.type, userAnswer);
            console.log('Submitting answer:', answerData);
            
            const result = await submitAnswer(currentQuestion.id, answerData);
            console.log('Submit result:', result);
            
            setShowResult(true);
            
            // Reset answer for next question if there is one
            const nextQ = result.next_question || result.current_question;
            if (nextQ) {
                if (nextQ.type === 'code' && nextQ.snippet) {
                    setUserAnswer(nextQ.snippet);
                } else if (nextQ.type === 'mcc') {
                    setUserAnswer([]);
                } else {
                    setUserAnswer('');
                }
            }
        } catch (err) {
            console.error('Failed to submit answer:', err);
            alert(err.message || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    

    const handleCompleteTest = async () => {
        if (window.confirm('Are you sure you want to complete this test?')) {
            try {
                await completeQuiz();
                alert('Test completed successfully!');
                resetQuiz();
                navigate('/teacher/questions');
            } catch (err) {
                console.error('Failed to complete test:', err);
                alert(err.message || 'Failed to complete test');
            }
        }
    };

    const handleQuitTest = async () => {
        if (window.confirm('Are you sure you want to quit this test? Your progress will be saved.')) {
            try {
                await quitQuiz('User quit test');
                resetQuiz();
                navigate('/teacher/questions');
            } catch (err) {
                console.error('Failed to quit test:', err);
                alert(err.message || 'Failed to quit test');
            }
        }
    };

    
    // Extract options from test_cases for MCQ/MCC/arrage questions
    const getQuestionOptions = () => {
        if (!currentQuestion || !currentQuestion.test_cases) return [];
        
        const questionType = currentQuestion.type?.toLowerCase();
        
        if (questionType === 'mcq' || questionType === 'mcc') {
            return currentQuestion.test_cases.map(tc => {
                // Handle if options is a JSON string
                try {
                    return typeof tc.options === 'string' ? JSON.parse(tc.options) : tc.options;
                } catch {
                    return tc.options;
                }
            }).flat();
        }
        
        
        if (questionType === 'arrange') {
            return currentQuestion.test_cases.map(tc => tc.options);
        }
        
        return [];
    };

    const [draggableOptions, setDraggableOptions] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);

    //  useEffect for arrange type initialization
    useEffect(() => {
        if (currentQuestion?.type === 'arrange') {
            const options = getQuestionOptions();
            setDraggableOptions(options);
            // Initialize userAnswer with sequential order (1,2,3,...)
            if (!userAnswer || userAnswer === '') {
                const initialOrder = options.map((_, idx) => idx + 1).join(',');
                setUserAnswer(initialOrder);
            } else {
                // If userAnswer exists, reconstruct draggableOptions from it
                const indices = userAnswer.split(',').map(n => parseInt(n.trim()) - 1);
                if (indices.length === options.length && 
                    indices.every(idx => !isNaN(idx) && idx >= 0 && idx < options.length)) {
                    const reordered = indices.map(idx => options[idx]);
                    if (reordered.every(item => item !== undefined)) {
                        setDraggableOptions(reordered);
                    }
                }
            }
        }
    }, [currentQuestion]);


    // Drag and drop handlers for arrange questions
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    //  handleDrop function
    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newOptions = [...draggableOptions];
        const draggedItem = newOptions[draggedIndex];
        
        // Remove the dragged item
        newOptions.splice(draggedIndex, 1);
        
        // Insert at the drop position
        newOptions.splice(dropIndex, 0, draggedItem);
        
        setDraggableOptions(newOptions);
        setDraggedIndex(null);
        
        // Update userAnswer with the original indices of items in new order
        const originalOptions = getQuestionOptions();
        const newOrder = newOptions.map(option => {
            const originalIndex = originalOptions.findIndex(opt => opt === option);
            return originalIndex + 1; // 1-based index
        }).join(',');
        
        handleAnswerChange(newOrder);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };


    

   const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const questionType = currentQuestion.type?.toLowerCase();
    const options = getQuestionOptions();

    switch (questionType) {
       case 'integer':
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                                <FaLightbulb className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Input Type</span>
                                <span className="text-sm font-bold text-yellow-400">Whole Number (No Decimals)</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono">
                            INTEGER
                        </span>
                    </div>

                    {/* Input Field */}
                    <div className="relative">
                        <input
                            type="number"
                            step="1"
                            className="w-full px-5 py-4 rounded-lg text-base bg-[var(--input-bg)] border-2 border-[var(--border-color)] focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder:text-gray-500"
                            placeholder="e.g., 42"
                            value={userAnswer}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                        />
                    </div>
                </div>
            );

        case 'float':
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                                <FaLightbulb className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Input Type</span>
                                <span className="text-sm font-bold text-yellow-400">Decimal Number (Floating Point)</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono">
                            FLOAT
                        </span>
                    </div>

                    {/* Input Field */}
                    <div className="relative">
                        <input
                            type="number"
                            step="any"
                            className="w-full px-5 py-4 rounded-lg text-base bg-[var(--input-bg)] border-2 border-[var(--border-color)] focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder:text-gray-500"
                            placeholder="e.g., 3.14159"
                            value={userAnswer}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                        />
                    </div>
                </div>
            );

        case 'string':
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                                <FaLightbulb className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Input Type</span>
                                <span className="text-sm font-bold text-yellow-400">Text Answer (Case Sensitive)</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono">
                            STRING
                        </span>
                    </div>

                    {/* Input Field */}
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full px-5 py-4 rounded-lg text-base bg-[var(--input-bg)] border-2 border-[var(--border-color)] focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder:text-gray-500"
                            placeholder="Type your answer here..."
                            value={userAnswer}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                        />
                    </div>
                </div>
            );
        
        
        case 'mcq':
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                                <FaCheckCircle className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Question Type</span>
                                <span className="text-sm font-bold text-purple-400">Single Correct Choice</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold">
                            {options.length} OPTIONS
                        </span>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {options.map((option, idx) => {
                            const isSelected = userAnswer === option;
                            return (
                                <label
                                    key={idx}
                                    className={`group flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                                        isSelected
                                            ? 'bg-purple-500/10 border-2 border-purple-500/50'
                                            : 'bg-black/20 border-2 border-white/5 hover:bg-black/30 hover:border-purple-500/30'
                                    }`}
                                >
                                    {/* Radio Button */}
                                    <div className="relative flex-shrink-0 mt-0.5">
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion.id}`}
                                            value={option}
                                            checked={isSelected}
                                            onChange={(e) => handleAnswerChange(e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                                            isSelected 
                                                ? 'border-purple-500 bg-purple-500' 
                                                : 'border-gray-500 group-hover:border-purple-400'
                                        }`}>
                                            {isSelected && (
                                                <div className="w-full h-full rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Option Text */}
                                    <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                                        <span className={`text-sm sm:text-base leading-relaxed ${
                                            isSelected ? 'text-white font-medium' : 'text-gray-300'
                                        }`}>
                                            {option}
                                        </span>
                                        {isSelected && (
                                            <FaCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            );

        case 'mcc':
            
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                                <FaCheckCircle className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Question Type</span>
                                <span className="text-sm font-bold text-purple-400">Multiple Correct Choices</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold">
                            {(Array.isArray(userAnswer) ? userAnswer : []).length}/{options.length} SELECTED
                        </span>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {options.map((option, idx) => {
                            const isChecked = (Array.isArray(userAnswer) ? userAnswer : []).includes(option);
                            return (
                                <label
                                    key={idx}
                                    className={`group flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                                        isChecked
                                            ? 'bg-purple-500/10 border-2 border-purple-500/50'
                                            : 'bg-black/20 border-2 border-white/5 hover:bg-black/30 hover:border-purple-500/30'
                                    }`}
                                >
                                    {/* Checkbox */}
                                    <div className="relative flex-shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                const current = Array.isArray(userAnswer) ? userAnswer : [];
                                                const updated = e.target.checked
                                                    ? [...current, option]
                                                    : current.filter((o) => o !== option);
                                                handleAnswerChange(updated);
                                            }}
                                            className="peer sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 transition-all ${
                                            isChecked 
                                                ? 'border-purple-500 bg-purple-500' 
                                                : 'border-gray-500 group-hover:border-purple-400'
                                        }`}>
                                            {isChecked && (
                                                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {/* Option Text */}
                                    <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                                        <span className={`text-sm sm:text-base leading-relaxed ${
                                            isChecked ? 'text-white font-medium' : 'text-gray-300'
                                        }`}>
                                            {option}
                                        </span>
                                        {isChecked && (
                                            <FaCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            );

        case 'arrange':
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                </svg>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Question Type</span>
                                <span className="text-sm font-bold text-cyan-400">Arrange in Correct Order</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
                            {draggableOptions.length} ITEMS
                        </span>
                    </div>

                    {/* Instructions */}
                    <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <FaLightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-300">
                            Drag items to reorder them. The order will be saved as comma-separated numbers representing the original position of each item.
                        </p>
                    </div>

                    {/* Draggable Items */}
                    <div className="space-y-3">
                        {draggableOptions.map((option, idx) => {
                            // Find the original index of this option
                            const originalIndex = options.findIndex(opt => opt === option);
                            
                            return (
                                <div
                                    key={`${originalIndex}-${idx}`}
                                    className={`group flex items-center gap-4 p-4 rounded-lg bg-cyan-500/5 border-2 transition-all cursor-move ${
                                        draggedIndex === idx 
                                            ? 'border-cyan-400 opacity-50 scale-95' 
                                            : 'border-cyan-500/20 hover:border-cyan-500/40'
                                    }`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                                            <span className="text-sm font-bold text-cyan-400">{idx + 1}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                                            <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                                            <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <pre className="text-sm leading-relaxed text-gray-200 font-mono whitespace-pre-wrap break-all">
                                            {option}
                                        </pre>
                                        <span className="text-xs text-gray-500 mt-1 block">
                                            Original position: {originalIndex + 1}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Current Order Display */}
                    <div className="relative">
                        <label className="text-xs text-gray-400 mb-2 block flex items-center gap-2">
                            <span>Current Order (Original Positions)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">Read-only</span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-5 py-4 rounded-lg text-base font-mono bg-[var(--input-bg)] border-2 border-[var(--border-color)] text-gray-400 cursor-not-allowed"
                            value={userAnswer}
                            readOnly
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            This shows the original position numbers in your current arrangement. Drag items above to change the order.
                        </p>
                    </div>
                </div>
            );

        case 'assignment_upload':
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                                <FaDownload className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Question Type</span>
                                <span className="text-sm font-bold text-orange-400">Assignment Upload</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold">
                            FILE UPLOAD
                        </span>
                    </div>

                    {/* Upload Area */}
                    {!userAnswer || (typeof userAnswer === 'object' && !userAnswer.name) ? (
                        <div className="relative border-2 border-dashed border-gray-600 hover:border-orange-500/50 rounded-lg p-12 bg-black/20 hover:bg-black/30 transition-all group">
                            <input
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        handleAnswerChange(file);
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".pdf,.doc,.docx,.zip,.txt,.py,.java,.cpp,.c"
                            />
                            <div className="text-center pointer-events-none">
                                <div className="w-16 h-16 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/20 group-hover:scale-105 transition-all">
                                    <FaDownload className="w-7 h-7 text-orange-400" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-300 mb-2">
                                    Drop your file here or click to browse
                                </h3>
                                <p className="text-sm text-gray-500 mb-5">
                                    Maximum file size: 10MB
                                </p>
                                
                                {/* Supported formats */}
                                <div className="inline-flex flex-wrap gap-2 justify-center max-w-md">
                                    <span className="text-xs text-gray-500">Supported:</span>
                                    {['.pdf', '.doc', '.docx', '.zip', '.txt', '.py', '.java', '.cpp', '.c'].map((ext) => (
                                        <span key={ext} className="text-xs px-2 py-1 rounded bg-gray-700/50 border border-gray-600 text-gray-400 font-mono">
                                            {ext}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* File Preview */
                        <div className="border border-green-500/30 rounded-lg p-5 bg-green-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
                                        <FaFileAlt className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-green-300 truncate mb-1">
                                            {userAnswer.name}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>{(userAnswer.size / 1024).toFixed(2)} KB</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <FaCheckCircle className="w-3 h-3 text-green-400" />
                                                Ready to submit
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnswerChange('');
                                    }}
                                    className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center transition-all flex-shrink-0 ml-3"
                                    title="Remove file"
                                >
                                    <FaTimes className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <FaLightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-300/90">
                            <p className="font-medium mb-1">Upload Guidelines:</p>
                            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                                <li>Make sure your file is properly named</li>
                                <li>Compress multiple files into a single .zip archive</li>
                                <li>Double-check your submission before uploading</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );

        
        case 'upload':
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                                <FaDownload className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Question Type</span>
                                <span className="text-sm font-bold text-orange-400">Assignment Upload</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold">
                            FILE UPLOAD
                        </span>
                    </div>

                    {/* Upload Area */}
                    {!userAnswer || (typeof userAnswer === 'object' && !userAnswer.name) ? (
                        <div className="relative border-2 border-dashed border-gray-600 hover:border-orange-500/50 rounded-lg p-12 bg-black/20 hover:bg-black/30 transition-all group">
                            <input
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        handleAnswerChange(file);
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".pdf,.doc,.docx,.zip,.txt,.py,.java,.cpp,.c"
                            />
                            <div className="text-center pointer-events-none">
                                <div className="w-16 h-16 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/20 group-hover:scale-105 transition-all">
                                    <FaDownload className="w-7 h-7 text-orange-400" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-300 mb-2">
                                    Drop your file here or click to browse
                                </h3>
                                <p className="text-sm text-gray-500 mb-5">
                                    Maximum file size: 10MB
                                </p>
                                
                                {/* Supported formats */}
                                <div className="inline-flex flex-wrap gap-2 justify-center max-w-md">
                                    <span className="text-xs text-gray-500">Supported:</span>
                                    {['.pdf', '.doc', '.docx', '.zip', '.txt', '.py', '.java', '.cpp', '.c'].map((ext) => (
                                        <span key={ext} className="text-xs px-2 py-1 rounded bg-gray-700/50 border border-gray-600 text-gray-400 font-mono">
                                            {ext}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* File Preview */
                        <div className="border border-green-500/30 rounded-lg p-5 bg-green-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
                                        <FaFileAlt className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-green-300 truncate mb-1">
                                            {userAnswer.name}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>{(userAnswer.size / 1024).toFixed(2)} KB</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <FaCheckCircle className="w-3 h-3 text-green-400" />
                                                Ready to submit
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnswerChange('');
                                    }}
                                    className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center transition-all flex-shrink-0 ml-3"
                                    title="Remove file"
                                >
                                    <FaTimes className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <FaLightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-300/90">
                            <p className="font-medium mb-1">Upload Guidelines:</p>
                            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                                <li>Make sure your file is properly named</li>
                                <li>Compress multiple files into a single .zip archive</li>
                                <li>Double-check your submission before uploading</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
            

        case 'code':
            return (
                <div className="space-y-5">
                    {/* Language Header */}
                    <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                                <FaCode className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Language</span>
                                <span className="text-sm font-bold text-blue-400 uppercase">{currentQuestion.language || 'Python'}</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
                            CODE EDITOR
                        </span>
                    </div>

                    {/* Two Column Layout: Test Cases + Code Editor */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Test Cases Column */}
                        {currentQuestion.test_cases && currentQuestion.test_cases.some(tc => !tc.hidden) && (
                            <div className="lg:max-h-[650px] lg:overflow-y-auto">
                                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-5 ">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaCheckCircle className="w-4 h-4 text-green-400" />
                                        <h4 className="text-sm font-bold text-green-400">
                                            Test Cases ({currentQuestion.test_cases.filter(tc => !tc.hidden).length})
                                        </h4>
                                    </div>
                                    <div className="space-y-3">
                                        {currentQuestion.test_cases.filter(tc => !tc.hidden).map((tc, idx) => (
                                            <div key={tc.id} className="bg-black/20 border border-white/5 rounded-lg p-4 hover:border-green-500/30 transition-colors">
                                                <div className="text-xs font-semibold text-gray-400 mb-3">
                                                    Test Case #{idx + 1}
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                                            Input
                                                        </div>
                                                        <div className="bg-black/40 border border-cyan-500/20 rounded p-3">
                                                            <pre className="text-xs text-cyan-400 font-mono whitespace-pre-wrap break-all">
                                                                {tc.expected_input || 'None'}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                            Expected Output
                                                        </div>
                                                        <div className="bg-black/40 border border-blue-500/20 rounded p-3">
                                                            <pre className="text-xs text-blue-400 font-mono whitespace-pre-wrap break-all">
                                                                {tc.expected_output}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Code Editor Column */}
                        <div className={currentQuestion.test_cases && currentQuestion.test_cases.some(tc => !tc.hidden) ? '' : 'lg:col-span-2'}>
                            <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--input-bg)] h-full flex flex-col">
                                {/* Editor Header */}
                                <div className="flex items-center justify-between px-4 py-2.5 bg-black/20 border-b border-[var(--border-color)]">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-2">
                                            solution.{currentQuestion.language === 'python' ? 'py' : currentQuestion.language === 'java' ? 'java' : currentQuestion.language === 'cpp' ? 'cpp' : 'txt'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 font-mono">
                                            {(userAnswer || '').split('\n').length} lines
                                        </span>
                                        <span className="text-xs text-gray-600">|</span>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {(userAnswer || '').length} chars
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Editor Content */}
                                <div className="relative flex-1">
                                    <textarea
                                        className="w-full h-full px-4 py-4 text-sm font-mono min-h-[600px] resize-none bg-transparent border-0 focus:outline-none focus:ring-0"
                                        placeholder="// Write your code here..."
                                        value={userAnswer}
                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                        spellCheck={false}
                                        style={{ 
                                            lineHeight: '1.6',
                                            tabSize: 4
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
       
            
            default:
            return (
                <div className="space-y-4">
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-500/10 to-slate-500/5 rounded-xl p-4 border border-gray-500/30">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-500/10 rounded-full blur-2xl"></div>
                        <div className="relative flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                                <FaLightbulb className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <span className="text-xs text-gray-400/80 block font-medium">Input Type</span>
                                <span className="text-sm font-bold text-gray-300">Detailed Answer</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative group">
                        <textarea
                            className="w-full px-5 py-4 rounded-xl text-base min-h-[250px] resize-y bg-[var(--input-bg)] border-2 border-[var(--border-color)] focus:border-gray-500/50 focus:ring-4 focus:ring-gray-500/10 transition-all placeholder:text-gray-500"
                            placeholder="Type your detailed answer here..."
                            value={userAnswer}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            style={{ lineHeight: '1.8' }}
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                            {(userAnswer || '').length} characters
                        </div>
                    </div>
                </div>
            );
    }
};

    // Loading state
    if (loading && !currentQuestion) {
        return (
            <div className="flex min-h-screen relative grid-texture">
                <TeacherSidebar />
                <main className="flex-1">
                    <Header isAuth />
                    <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
                        <div className="text-center">
                            <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
                            </div>
                            <p className="text-base muted">Initializing test mode...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Error state
    if (error && !currentQuestion) {
        return (
            <div className="flex min-h-screen relative grid-texture">
                <TeacherSidebar />
                <main className="flex-1">
                    <Header isAuth />
                    <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-16 h-16 bg-red-500/10 rounded-xl border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                                <FaTimes className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Failed to Load Test</h3>
                            <p className="text-sm muted mb-6">{error}</p>
                            <button
                                onClick={() => {
                                    clearError();
                                    resetQuiz();
                                    navigate('/teacher/questions');
                                }}
                                className="btn-grad text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                            >
                                <FaArrowLeft className="w-4 h-4" />
                                Back to Questions
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const timerStatus = getTimerStatus();

    return (
        <div className="flex min-h-screen relative grid-texture">
            <TeacherSidebar />
            <main className="flex-1 w-full lg:w-auto">
                <Header isAuth />
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6 lg:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Questions</h1>
                        <p className="text-sm muted">Create and manage your questions</p>
                    </div>
                    {/* Action buttons */}
                    <QuestionActionButtons activeButton="library" />

                    {/* Main card */}
                    <div className="card-strong rounded-xl sm:rounded-2xl overflow-hidden">
                        {/* Card header with timer and controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)] gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <button
                                    onClick={() => {
                                        resetQuiz();
                                        navigate('/teacher/questions');
                                    }}
                                    className="w-10 h-10 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--border-subtle)] hover:border-purple-500/30 active:scale-95 transition-all flex-shrink-0"
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
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg sm:text-xl font-bold mb-1">Test Mode</h2>
                                    <p className="text-xs sm:text-sm muted line-clamp-1">
                                        Preview and test this question
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-shrink-0">
                                {timeLeft !== null && (
                                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${timerStatus.bg} ${timerStatus.border}`}>
                                        <MdTimer className={`w-5 h-5 ${timerStatus.text} ${timerStatus.animate ? 'animate-pulse' : ''}`} />
                                        <span className={`text-base sm:text-lg font-mono font-bold ${timerStatus.text} ${timerStatus.animate ? 'animate-pulse' : ''}`}>
                                            {formatTime(timeLeft)}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={handleQuitTest}
                                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold active:scale-95 transition-all text-sm whitespace-nowrap inline-flex items-center gap-2"
                                >
                                    <FaTimes className="w-4 h-4" />
                                    <span className="hidden sm:inline">Quit Test</span>
                                    <span className="sm:hidden">Quit</span>
                                </button>
                            </div>
                        </div>

                        {currentQuestion ? (
                            <div className="p-4 sm:p-6 lg:p-8">
                                {/* Question header */}
                                <div className="mb-6">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h3 className="text-xl sm:text-2xl font-bold flex-1 leading-tight">
                                            {currentQuestion.summary}
                                        </h3>
                                        <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex-shrink-0">
                                            <div className="text-xs text-cyan-300 font-semibold mb-0.5">MARKS</div>
                                            <div className="text-2xl font-bold text-cyan-400">{currentQuestion.points || 1.0}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {currentQuestion.language && (
                                            <span className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 inline-flex items-center gap-1.5">
                                                <FaCode className="w-3 h-3 text-blue-400" />
                                                <span className="font-semibold text-blue-400">{currentQuestion.language.toUpperCase()}</span>
                                            </span>
                                        )}
                                        <span className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                            <span className="font-semibold text-purple-400">Type: {currentQuestion.type?.toUpperCase()}</span>
                                        </span>
                                        <span className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                                            <span className="font-semibold text-green-400">{currentQuestion.points || 1} Points</span>
                                        </span>
                                        {paper?.is_trial_mode && (
                                            <span className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
                                                <span className="font-semibold text-orange-400">TRIAL MODE</span>
                                            </span>
                                        )}
                                    </div>

                                    {answerResult && (
                                        <div className="mb-4 p-4 bg-orange-500/5 border-l-4 border-orange-500 rounded-r-lg flex items-start gap-3">
                                            <AiOutlineWarning className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-orange-400 mb-1">Important Notice</p>
                                                <p className="text-xs text-orange-300/90">Last submitted answer is considered for evaluation</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Question description */}
                                {currentQuestion.description && (
                                    <div className="mb-6 p-5 bg-[var(--input-bg)] rounded-lg border border-[var(--border-subtle)]">
                                        <div
                                            className="prose prose-invert max-w-none text-sm sm:text-base"
                                            dangerouslySetInnerHTML={{ __html: currentQuestion.description }}
                                        />
                                    </div>
                                )}

                                {/* Available files */}
                                {currentQuestion.files && currentQuestion.files.length > 0 && (
                                    <div className="mb-6 bg-cyan-500/5 rounded-lg p-5 border border-cyan-500/20">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                                <FaExternalLinkAlt className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-cyan-400">Attached Files</h3>
                                                <p className="text-xs text-cyan-300/70">{currentQuestion.files.length} file{currentQuestion.files.length !== 1 ? 's' : ''} available</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {currentQuestion.files.map((file) => (
                                                <a
                                                    key={file.id}
                                                    href={file.url.startsWith('http') 
                                                        ? file.url 
                                                        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${file.url}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center justify-between p-3 bg-black/20 hover:bg-black/30 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                                            <FaFileAlt className="w-4 h-4 text-cyan-400" />
                                                        </div>
                                                        <span className="text-sm font-medium text-cyan-300 group-hover:text-cyan-200">{file.name}</span>
                                                    </div>
                                                    <FaExternalLinkAlt className="w-3.5 h-3.5 text-cyan-400 opacity-50 group-hover:opacity-100" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Answer input */}
                                <div className="mb-6">
                                    <label className="block text-base sm:text-lg font-bold mb-4">
                                        {currentQuestion.type === 'code' ? 'Write Your Program' :
                                            currentQuestion.type === 'mcq' ? 'Select One Answer' :
                                                currentQuestion.type === 'mcc' ? 'Select All Correct Answers' :
                                                    currentQuestion.type === 'arrange' ? 'Arrange in Correct Order' :
                                                        'Enter Your Answer'}
                                    </label>
                                    {renderQuestionInput()}
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border-color)]">
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={submitting || loading}
                                        className="flex-1 sm:flex-initial px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck className="w-4 h-4" />
                                                Check Answer
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={handleCompleteTest}
                                        className="px-6 py-3 btn-grad text-white rounded-lg font-semibold active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                                    >
                                        <FaPlay className="w-4 h-4" />
                                        Complete Test
                                    </button>
                                </div>

                                {/* Result display */}
                                {showResult && answerResult && (
                                    <div className={`mt-6 rounded-lg p-6 border ${
                                        answerResult.success 
                                            ? 'bg-green-500/5 border-green-500/30' 
                                            : 'bg-red-500/5 border-red-500/30'
                                    }`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                answerResult.success 
                                                    ? 'bg-green-500/20 border border-green-500/40' 
                                                    : 'bg-red-500/20 border border-red-500/40'
                                            }`}>
                                                {answerResult.success ? (
                                                    <FaCheckCircle className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <FaTimes className="w-6 h-6 text-red-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-lg font-bold mb-2 ${
                                                    answerResult.success ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {answerResult.success ? 'Correct Answer! 🎉' : 'Incorrect Answer'}
                                                </h3>
                                                {answerResult.error_message && (
                                                    <div className="p-3 bg-black/20 rounded-lg border border-white/10 mt-3">
                                                        <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">{answerResult.error_message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center mx-auto mb-4">
                                    <AiOutlineWarning className="w-8 h-8 muted" />
                                </div>
                                <p className="text-base muted mb-6">No question available</p>
                                <button
                                    onClick={() => {
                                        resetQuiz();
                                        navigate('/teacher/questions');
                                    }}
                                    className="btn-grad text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                                >
                                    <FaArrowLeft className="w-4 h-4" />
                                    Back to Questions
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TestQuestion;