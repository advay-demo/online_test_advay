import React from "react";
import { FaChevronLeft, FaListOl } from "react-icons/fa";

const QuizStatisticsPanel = ({
  statsData,
  onBack,
  attempts,
  currentAttempt,
  onAttemptChange,
  loading,
}) => {
  if (!statsData) return null;
  const { quiz, total_attempts_count, statistics, message } = statsData;

  return (
    <div className="card-strong p-4 sm:p-5 lg:p-6 min-h-[600px]">
      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <button
          onClick={onBack}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--border-subtle)] transition flex-shrink-0"
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold line-clamp-2">Attempt {currentAttempt}</h2>
            <span className="text-[10px] px-2 py-0.5 rounded border bg-green-500/20 text-green-400 border-green-500/30 uppercase font-bold tracking-wider whitespace-nowrap">
              Statistics
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs muted">
            
            <div className="flex items-center gap-1.5">
              <span>Total Participants: {total_attempts_count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attempt Tabs */}
      {attempts && attempts.length > 0 && (
        <div className="flex bg-black/20 p-1 rounded-lg overflow-x-auto scrollbar-hide mb-6">
          {[...attempts]
            .sort((a, b) => a.attempt_number - b.attempt_number)
            .map((attempt) => (
              <button
                key={attempt.id}
                onClick={() => onAttemptChange(attempt)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${currentAttempt === attempt.attempt_number
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                style={{ transition: 'all 0.15s' }}
                disabled={loading}
              >
                Attempt {attempt.attempt_number}
              </button>
            ))}
        </div>
      )}

      {/* Statistics Table or Message */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-blue-400 font-semibold text-base">Loading statistics...</div>
        ) : message ? (
          <div className="text-center py-8 text-yellow-400 font-semibold text-base">{message}</div>
        ) : (
          <table className="min-w-full bg-black/20 rounded-lg border border-white/5 text-xs">
            <thead>
              <tr className="bg-blue-950/80 text-blue-300">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Question</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Points</th>
                <th className="px-3 py-2">Total Attempts</th>
                <th className="px-3 py-2">Correct Attempts</th>
                <th className="px-3 py-2">% Correct</th>
              </tr>
            </thead>
            <tbody>
              {statistics && statistics.length > 0 ? (
                statistics.map((q, idx) => (
                  <tr key={q.question.id} className="border-b border-white/10">
                    <td className="px-3 py-2 text-center">{idx + 1}</td>
                    <td className="px-3 py-2">{q.question.summary}</td>
                    <td className="px-3 py-2 text-center">{q.question.type}</td>
                    <td className="px-3 py-2 text-center">{q.question.points}</td>
                    <td className="px-3 py-2 text-center">{q.total_attempts}</td>
                    <td className="px-3 py-2 text-center">{q.correct_attempts}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={q.correct_percentage > 0 ? "text-green-400" : "text-red-400"}>
                        {q.correct_percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">No statistics available for this attempt.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default QuizStatisticsPanel;