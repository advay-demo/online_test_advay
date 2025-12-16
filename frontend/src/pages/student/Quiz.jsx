import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaCheck, FaArrowRight } from 'react-icons/fa';
import { AiOutlineWarning } from 'react-icons/ai';
import QuizSidebar from '../../components/layout/QuizSidebar';
import { startQuiz, submitAnswer, quitQuiz } from '../../api/api';

const Quiz = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [answerPaper, setAnswerPaper] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [attemptedQuestions, setAttemptedQuestions] = useState(new Set());
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (courseId && quizId) {
      loadQuiz();
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [courseId, quizId]);

  useEffect(() => {
    if (timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await startQuiz(courseId, quizId);
      setAnswerPaper(data.answerpaper);
      setTimeLeft(data.time_left || 0);
      
      // Initialize answers object
      const initialAnswers = {};
      data.answerpaper.questions.forEach((q) => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
      
      setError(null);
    } catch (err) {
      console.error('Failed to start quiz:', err);
      setError(err.response?.data?.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
    // Auto-submit when time expires
    if (answerPaper) {
      await handleQuit();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitAnswer = async (questionId) => {
    const answer = answers[questionId];
    if (!answer || answer.trim() === '') {
      alert('Please enter an answer');
      return;
    }

    try {
      setSubmitting(true);
      const result = await submitAnswer(answerPaper.id, questionId, [answer]);
      
      // Mark question as attempted
      setAttemptedQuestions((prev) => new Set([...prev, questionId]));
      
      // Show feedback if available
      if (result.success) {
        // Answer is correct
      } else {
        // Answer is incorrect
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuit = async () => {
    if (window.confirm('Are you sure you want to quit the quiz? Your progress will be saved.')) {
      try {
        await quitQuiz(answerPaper.id);
        navigate(`/answerpapers/${answerPaper.id}/submission`);
      } catch (err) {
        console.error('Failed to quit quiz:', err);
        navigate(`/answerpapers/${answerPaper.id}/submission`);
      }
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !answerPaper) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 mb-4">
              {error || 'Quiz not found'}
            </div>
            <Link to="/courses" className="text-indigo-400 hover:text-indigo-300">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = answerPaper.questions[currentQuestionIndex];
  const totalQuestions = answerPaper.questions.length;
  const attemptedCount = attemptedQuestions.size;

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'integer':
      case 'float':
      case 'string':
        return (
          <input
            type={currentQuestion.type === 'integer' ? 'number' : 'text'}
            className="w-full px-4 py-3 text-lg bg-white/5 border border-white/10 rounded-lg"
            placeholder={`Enter ${currentQuestion.type}...`}
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
          />
        );
      
      case 'mcq':
        return (
          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((option, idx) => (
              <label key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-4 h-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'mcc':
        return (
          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((option, idx) => (
              <label key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input
                  type="checkbox"
                  checked={(answers[currentQuestion.id] || []).includes(option)}
                  onChange={(e) => {
                    const current = answers[currentQuestion.id] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((o) => o !== option);
                    handleAnswerChange(currentQuestion.id, updated);
                  }}
                  className="w-4 h-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'code':
        return (
          <textarea
            className="w-full px-4 py-3 text-lg font-mono bg-white/5 border border-white/10 rounded-lg min-h-[300px]"
            placeholder="Write your code here..."
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
          />
        );
      
      default:
        return (
          <textarea
            className="w-full px-4 py-3 text-lg bg-white/5 border border-white/10 rounded-lg min-h-[200px]"
            placeholder="Enter your answer..."
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen relative grid-texture">
      <QuizSidebar
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        attemptedQuestions={Array.from(attemptedQuestions).map((qId) => {
          const index = answerPaper.questions.findIndex((q) => q.id === qId);
          return index >= 0 ? index + 1 : 0;
        }).filter((n) => n > 0)}
        onQuestionClick={handleQuestionClick}
      />

      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="px-8 py-4 flex justify-end items-center border-b border-white/6 bg-gradient-to-b from-white/[0.01] to-transparent">
          <div className="flex items-center gap-4">
            <div className="card px-6 py-2 flex items-center gap-3">
              <FaClock className="w-5 h-5 text-indigo-400" />
              <span className="text-md font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={handleQuit}
              className="bg-red-600 text-white text-md px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition inline-flex items-center"
            >
              Quit Exam
            </button>
          </div>
        </header>

        {/* Question Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl">
            {/* Breadcrumb Navigation */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Quiz</h1>
              <p className="text-gray-400 text-sm mt-1">
                <Link to="/courses" className="hover:text-white transition">Courses</Link> /
                <Link to={`/courses/${courseId}/modules`} className="hover:text-white transition"> Course</Link> /
                <span className="text-white"> Quiz</span>
              </p>
            </div>

            {/* Question Header */}
            {currentQuestion && (
              <>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-4">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </h2>
                  <div className="mb-4">
                    <div
                      className="prose prose-invert max-w-none text-gray-300"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.description || currentQuestion.summary }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 mb-4">
                    {currentQuestion.language && (
                      <div className="text-sm px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <span className="muted">Language:</span>
                        <span className="font-semibold text-blue-400 ml-1">{currentQuestion.language.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="text-sm px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <span className="muted">Type:</span>
                      <span className="font-semibold text-purple-400 ml-1">{currentQuestion.type.toUpperCase()}</span>
                    </div>
                    <div className="text-sm px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                      <span className="muted">Points:</span>
                      <span className="font-semibold text-green-400 ml-1">{currentQuestion.points || 0}</span>
                    </div>
                  </div>

                  <div className="rounded-lg px-4 py-3 text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-300 flex items-center">
                    <AiOutlineWarning className="w-5 h-5 inline-block mr-2" />
                    LAST SUBMITTED ANSWER IS CONSIDERED FOR EVALUATION
                  </div>
                </div>

                {/* Question Body */}
                <div className="card p-8 mb-6">
                  <label className="block text-sm font-semibold mb-4 soft">
                    {currentQuestion.type === 'integer' ? 'Enter Integer:' :
                     currentQuestion.type === 'float' ? 'Enter Float:' :
                     currentQuestion.type === 'string' ? 'Enter String:' :
                     currentQuestion.type === 'code' ? 'Write Your Code:' :
                     currentQuestion.type === 'mcq' ? 'Select One Answer:' :
                     currentQuestion.type === 'mcc' ? 'Select All Correct Answers:' :
                     'Enter Your Answer:'}
                  </label>
                  {renderQuestionInput()}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => handleSubmitAnswer(currentQuestion.id)}
                    disabled={submitting || !answers[currentQuestion.id]}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCheck className="w-5 h-5" />
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                  {currentQuestionIndex < totalQuestions - 1 && (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
                    >
                      Next Question
                      <FaArrowRight className="w-5 h-5" />
                    </button>
                  )}
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                      className="bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition flex items-center gap-2"
                    >
                      Previous Question
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quiz;