import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlus, FaBookOpen, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import CourseActionButtons from '../../components/teacher/CourseActionButtons';
import useGradingSystemStore from '../../store/teacherGradeStore';
import AddGradingSystem from '../../components/teacher/AddGradingSystem';
import GradingSystemDetail from '../../components/teacher/GradingSystemDetail';

export default function GradingSystems() {
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'detail' | 'edit'
  const { gradingSystems, loadGradingSystems, loading, error, selected, select, clearSelected, deleteGradingSystem } = useGradingSystemStore();

  useEffect(() => {
    loadGradingSystems();
    // eslint-disable-next-line
  }, []);

  const handleAdd = () => setMode('add');
  const handleCancelAdd = () => setMode('list');
  const handleManage = (gs) => { select(gs); setMode('detail'); };
  const handleBack = () => { clearSelected(); setMode('list'); };
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null); // holds gs.id or null

  const filteredGradingSystems = gradingSystems.filter(gs =>
    gs.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Edit handler
  const handleEdit = (gs) => {
    select(gs);
    setMode('edit');
    setActionMenuOpen(null);
  };

  // Delete handler
  const handleDelete = async (gs) => {
    setActionMenuOpen(null);
    if (window.confirm(`Delete grading system "${gs.name}"?`)) {
      await deleteGradingSystem(gs.id);
      clearSelected();
      setMode('list');
    }
  };

  // Click-away handler for action menu
  useEffect(() => {
    if (actionMenuOpen === null) return;
    const handleClick = (e) => {
      if (!e.target.closest('.gs-action-menu')) setActionMenuOpen(null);
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [actionMenuOpen]);

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
          <CourseActionButtons activeButton="grading" />

          {/* Grading System Section */}
          <div className="relative card-strong p-4 sm:p-5 lg:p-6 min-h-[600px]">
            <div className="mb-4 sm:mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-1">Grading System Library</h2>
                <p className="text-xs sm:text-sm muted">Browse and manage all your grading systems</p>
              </div>
              {mode === 'list' && (
                <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search grading systems..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  {/* Add Button */}
                  <button
                    className="bg-blue-600 px-3 sm:px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    onClick={handleAdd}
                  >
                    <FaPlus className="w-4 h-4" />
                    <span className="hidden lg:inline">Add Grading System</span>
                    <span className="lg:hidden">Add</span>
                  </button>
                </div>
              )}
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

            {/* Grading System List */}
            {!loading && !error && mode === 'list' && (
              <div className="space-y-3 sm:space-y-4">
                {filteredGradingSystems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg muted">No grading systems found</p>
                  </div>
                ) : (
                  filteredGradingSystems.map((gs) => (
                    <div
                      key={gs.id}
                      className="card p-4 sm:p-5 hover:bg-white/[0.02] transition-all duration-200 group"
                    >
                      <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 -mt-5 sm:-mt-4 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:border-blue-500/30 transition-all duration-200">
                          <FaBookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base sm:text-lg line-clamp-1 group-hover:text-blue-400 transition-colors duration-200">
                              {gs.name}
                            </h3>
                            {gs.is_default && (
                              <span className="text-[10px] px-2 py-0.5 rounded border border-blue-400 text-blue-400 uppercase font-bold tracking-wider whitespace-nowrap flex-shrink-0 transition-all duration-200">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm muted mb-2 sm:mb-3 line-clamp-2">{gs.description}</p>
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs muted">
                            <div className="flex items-center gap-1.5">
                              <FaBookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                              <span>{gs.grade_ranges?.length || 0} grade ranges</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Used in {gs.courses_count || 0} courses</span>
                            </div>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:self-start relative">
                          <button
                            onClick={() => handleManage(gs)}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-[var(--border-color)] rounded-lg text-xs sm:text-sm font-medium hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-center whitespace-nowrap"
                          >
                            Manage
                          </button>
                          {/* Actions Dropdown */}
                          <div className="relative gs-action-menu">
                            <button
                              className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--input-bg)] active:scale-95 transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                              onClick={() => setActionMenuOpen(actionMenuOpen === gs.id ? null : gs.id)}
                              aria-label="Actions"
                              tabIndex={0}
                            >
                              <FaEllipsisV className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            {actionMenuOpen === gs.id && (
                              <div className="absolute right-0 mt-2 z-50 w-32 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 flex flex-col text-sm animate-fade-in">
                                <button
                                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-500/10 transition"
                                  onClick={() => handleEdit(gs)}
                                >
                                  <FaEdit className="w-4 h-4" /> Edit
                                </button>
                                <button
                                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition"
                                  onClick={() => handleDelete(gs)}
                                >
                                  <FaTrash className="w-4 h-4" /> Delete
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

            {/* Add Grading System Modal */}
            {mode === 'add' && <AddGradingSystem onCancel={handleCancelAdd} />}

            {/* Edit Grading System Modal */}
            {mode === 'edit' && selected && (
              <AddGradingSystem
                onCancel={handleCancelAdd}
                gradingSystem={selected}
                isEdit
              />
            )}

            {/* Grading System Detail Modal */}
            {mode === 'detail' && selected && <GradingSystemDetail gradingSystem={selected} onBack={handleBack} />}
          </div>
        </div>
      </main>
    </div>
  );
}