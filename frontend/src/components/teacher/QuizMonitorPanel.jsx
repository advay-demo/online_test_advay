import React, { useEffect, useState, useRef } from "react";
import { FaChevronLeft, FaUser, FaListOl, FaCalendar, FaDownload, FaUpload, FaFileCsv, FaTimes } from "react-icons/fa";
import useMonitorStore from "../../store/quizMonitorStore";
import QuizStatisticsPanel from "./QuizStatisticsPanel";


const formatTimeLeft = secs => {
  if (secs < 0) secs = 0;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const QuizMonitorPanel = ({ quiz, course, onBack }) => {
  const {
    loading,
    error,
    result,
    monitorQuiz,
    downloadCSV,
    extendTime,
    allowSpecial,
    reset,
  } = useMonitorStore();

  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [timeExtension, setTimeExtension] = useState({});
  const attempts = result?.attempt_numbers?.map(num => ({ attempt_number: num, id: num })) || [];

  const [showStatistics, setShowStatistics] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsAttempt, setStatsAttempt] = useState(null);
  const fetchQuizStatistics = useMonitorStore(state => state.fetchQuizStatistics);

  // --- Time left state ---
  const [timeLeft, setTimeLeft] = useState({});
  const timerRef = useRef();

  useEffect(() => {
    // Clear timer on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (quiz && course) {
      monitorQuiz(quiz.id, course.course_id);
    }
  }, [quiz, course, monitorQuiz]);

  useEffect(() => {
    if (attempts.length > 0 && !selectedAttempt) {
      const first = attempts.find(a => a.attempt_number === 1) || attempts[0];
      setSelectedAttempt(first);
    }
  }, [attempts, selectedAttempt]);

  useEffect(() => {
    if (quiz && course && selectedAttempt) {
      monitorQuiz(quiz.id, course.course_id, selectedAttempt.attempt_number);
    }
  }, [quiz, course, selectedAttempt, monitorQuiz]);

  // --- Countdown logic ---
  useEffect(() => {
    if (!result?.papers) return;
    const calcTimeLeft = () => {
      const now = new Date();
      const newTimeLeft = {};
      result.papers.forEach(paper => {
        let end = new Date(paper.end_time);
        if (isNaN(end.getTime())) {
          end = new Date(paper.end_time.replace(/\.\d+/, ""));
        }
        const diff = Math.abs(Math.floor((end - now) / 1000));
        console.log("Paper ID:", paper.id, "end_time:", paper.end_time, "Parsed end:", end, "Now:", now, "Diff:", diff);
        newTimeLeft[paper.id] = diff;
      });
      setTimeLeft(newTimeLeft);
    };
    calcTimeLeft();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(calcTimeLeft, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [result?.papers]);

  const [marksCSV, setMarksCSV] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleUploadCSV = async () => {
    if (!marksCSV) return;
    setUploading(true);
    setUploadError(null);
    try {
      await useMonitorStore.getState().uploadCSV(
        course.course_id,
        result?.questionpaper_id || quiz.id,
        marksCSV
      );
      setMarksCSV(null);
      monitorQuiz(quiz.id, course.course_id, selectedAttempt.attempt_number);
    } catch (err) {
      setUploadError("Failed to upload CSV. Please check the file and try again.");
    }
    setUploading(false);
  };

  const handleDownloadCSV = () => {
    downloadCSV(course.course_id, quiz.id, selectedAttempt?.attempt_number || 1);
  };

  const handleExtendTime = async (paperId) => {
    const extraTime = timeExtension[paperId];
    if (!extraTime) return;
    await extendTime(paperId, extraTime);
    setTimeExtension(prev => ({ ...prev, [paperId]: "" }));
    monitorQuiz(quiz.id, course.course_id, selectedAttempt.attempt_number);
  };

  const handleAllowSpecial = async (userId) => {
    try {
      const res = await allowSpecial(userId, course.course_id, quiz.id);
      alert(res?.message || "Special attempt allowed successfully.");
      monitorQuiz(quiz.id, course.course_id, selectedAttempt.attempt_number);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to allow special attempt."
      );
    }
  };

  
  const handleShowStatistics = async () => {
    if (!quiz || !course || !selectedAttempt) return;
    setStatsLoading(true);
    await fetchQuizStatistics(result?.questionpaper_id || quiz.id, course.course_id, selectedAttempt.attempt_number);
    setStatsData(useMonitorStore.getState().result);
    setStatsAttempt(selectedAttempt);
    setShowStatistics(true);
    setStatsLoading(false);
  };

  const handleBackToMonitor = () => {
    setShowStatistics(false);
    setStatsData(null);
    setStatsAttempt(null);
    // Re-fetch monitor data for the selected attempt
    if (quiz && course && selectedAttempt) {
      monitorQuiz(quiz.id, course.course_id, selectedAttempt.attempt_number);
    }
};

  // Handler to change attempt in statistics panel
  const handleStatsAttemptChange = async (attempt) => {
    setStatsLoading(true);
    setStatsAttempt(attempt);
    await fetchQuizStatistics(result?.questionpaper_id || quiz.id, course.course_id, attempt.attempt_number);
    setStatsData(useMonitorStore.getState().result);
    setStatsLoading(false);
  };


  return (
  <div className="space-y-4">
    {/* Main Card */}
    <div className="card-strong p-4 sm:p-5 lg:p-6 min-h-[600px]">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--border-subtle)] transition flex-shrink-0"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold line-clamp-2">{quiz.description || quiz.name}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${
                quiz.is_exercise 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              } uppercase font-bold tracking-wider whitespace-nowrap`}>
                {quiz.is_exercise ? 'Exercise' : 'Quiz'}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs muted">
              <div className="flex items-center gap-1.5">
                <FaUser className="w-3 h-3" />
                <span>{course.course_name || course.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaListOl className="w-3 h-3" />
                <span>{quiz.module_name}</span>
              </div>
              {quiz.start_date && (
                <div className="flex items-center gap-1.5">
                  <FaCalendar className="w-3 h-3" />
                  <span>{new Date(quiz.start_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm muted">Monitor quiz progress, download statistics, and view live data.</p>
      </div>

      {/* Details and Actions */}
      {showStatistics ? (
          <QuizStatisticsPanel
            statsData={statsData}
            onBack={handleBackToMonitor}
            attempts={attempts}
            currentAttempt={statsAttempt?.attempt_number}
            onAttemptChange={handleStatsAttemptChange}
            loading={statsLoading}
          />
      ) : (
        <>
          {result && result.stats && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              {/* Details Card */}
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 mb-3 text-blue-300">
                  Stats :
                </h3>
                <div className="card p-4 bg-black/20 border border-white/10 rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-muted text-center mb-2">Total Papers</div>
                      <div className="font-bold text-white text-center">{result.stats.total_papers}</div>
                    </div>
                    <div>
                      <div className="text-muted text-center mb-2">Completed</div>
                      <div className="font-bold text-green-400 text-center">{result.stats.completed_papers}</div>
                    </div>
                    <div>
                      <div className="text-muted text-center mb-2">In Progress</div>
                      <div className="font-bold text-yellow-400 text-center">{result.stats.inprogress_papers}</div>
                    </div>
                    <div>
                      <div className="text-muted text-center mb-2">Questions</div>
                      <div className="font-bold text-blue-400 text-center">{result.stats.questions_count}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex flex-row gap-2 md:flex-col md:gap-3 mt-2 md:mt-0">
                <button
                  className="w-1/2 lg:w-full text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold bg-blue-500/80 active:scale-95 transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0 hover:bg-blue-600 flex items-center gap-2"
                  onClick={handleDownloadCSV}
                >
                  <FaDownload className="w-4 h-4" />
                  Download CSV
                </button>
                <button
                  className="w-1/2 lg:w-full text-center text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold bg-green-500/80 active:scale-95 transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0 hover:bg-green-600 flex items-center gap-2"
                  onClick={handleShowStatistics}
                  disabled={!selectedAttempt}
                >
                  <FaListOl className="w-4 h-4" />
                  {`Statistics (# ${selectedAttempt?.attempt_number || ""})`}
                </button>
              </div>
            </div>
          )}

          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl p-5 border border-purple-500/20 mb-6">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FaFileCsv className="text-green-400 w-5 h-5" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-200 block">Upload Marks CSV</label>
                  <p className="text-xs text-gray-400">Upload a CSV file to update marks for this quiz</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    id="marks-csv-upload"
                    className="hidden"
                    onChange={e => setMarksCSV(e.target.files[0])}
                  />
                  <label
                    htmlFor="marks-csv-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-purple-500/30 rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-200"
                  >
                    <FaUpload className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">{marksCSV ? marksCSV.name : "Choose CSV file"}</span>
                  </label>
                  {marksCSV && (
                    <button
                      type="button"
                      className="ml-1 px-2 py-1 rounded bg-red-500/70 text-white text-xs hover:bg-red-600 transition"
                      onClick={() => setMarksCSV(null)}
                      title="Remove selected file"
                    >
                      Remove
                    </button>
                  )}
                  {uploadError && <span className="text-red-400 text-xs ml-2">{uploadError}</span>}
                </div>
                <button
                  className="px-4 py-2 rounded-lg bg-green-500/80 text-white font-semibold hover:bg-green-600 transition disabled:opacity-60"
                  onClick={handleUploadCSV}
                  disabled={!marksCSV || uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>

          {attempts.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 my-6">
              <div className="flex bg-black/20 p-1 rounded-lg overflow-x-auto scrollbar-hide">
                {[...attempts]
                  .sort((a, b) => a.attempt_number - b.attempt_number)
                  .map((attempt) => (
                    <button
                      key={attempt.id}
                      onClick={() => setSelectedAttempt(attempt)}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap
                        ${selectedAttempt?.id === attempt.id
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-muted hover:text-white hover:bg-white/5'
                        }`}
                      style={{ transition: 'all 0.15s' }}
                    >
                      Attempt {attempt.attempt_number}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-sm text-muted">Loading monitoring data...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
                {error}
              </div>
            )}

            {/* User Table */}
            {result && result.papers && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-blue-300 flex items-center gap-2">
                  <FaUser className="w-4 h-4 text-blue-400" />
                  Attempted Users
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-black/20 rounded-lg border border-white/5 text-xs">
                    <thead>
                      <tr className="bg-blue-950/80 text-blue-300">
                        <th className="px-3 py-2">SR NO.</th>
                        <th className="px-3 py-2">NAME</th>
                        <th className="px-3 py-2">ROLL NO</th>
                        <th className="px-3 py-2">MARKS</th>
                        <th className="px-3 py-2">QUESTIONS ATTEMPTED</th>
                        <th className="px-3 py-2">TIME LEFT</th>
                        <th className="px-3 py-2">STATUS</th>
                        <th className="px-3 py-2">TIME EXTENSION</th>
                        <th className="px-3 py-2">SPECIAL ATTEMPT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.papers.map((paper, idx) => (
                        <tr key={paper.id} className="border-b border-white/10">
                          <td className="px-3 py-2 text-center">{idx + 1}</td>
                          <td className="px-3 py-2 items-center text-center">
                            {paper.user.first_name} {paper.user.last_name}
                          </td>
                          <td className="px-3 py-2 text-center">{paper.user.roll_number}</td>
                          <td className="px-3 py-2 text-center">{paper.marks_obtained}</td>
                          <td className="px-3 py-2 text-center">{paper.questions_attempted_count} out of {result.stats.questions_count}</td>
                          <td className="px-3 py-2 text-center">
                            {timeLeft[paper.id] > 0
                              ? formatTimeLeft(timeLeft[paper.id])
                              : <span className="text-red-400 font-bold">EXPIRED</span>
                            }
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-1 rounded font-semibold text-xs ${paper.status === "completed" ? " text-green-300" : " text-yellow-300"}`}>
                              {paper.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center gap-1 text-center justify-center">
                              <input
                                type="text"
                                className="w-20 px-2 py-1 rounded bg-black/30 border border-blue-500/20 text-green-400 font-semibold focus:outline-none focus:border-blue-400 transition"
                                value={timeExtension[paper.id] || ""}
                                onChange={e => setTimeExtension(prev => ({ ...prev, [paper.id]: e.target.value }))}
                                placeholder="Time"
                              />
                              <button
                                className="px-2 py-1 rounded bg-green-500/80 text-white font-semibold hover:bg-green-600"
                                onClick={() => handleExtendTime(paper.id)}
                              >+</button>
                            </div>
                          </td>
                          <td className="px-3 py-2 justify-center text-center">
                            <button
                              className="px-3 py-1 rounded bg-green-500/80 text-white font-semibold hover:bg-green-600"
                              onClick={() => handleAllowSpecial(paper.user.id)}
                            >
                              Allow
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  </div>
);};

export default QuizMonitorPanel;