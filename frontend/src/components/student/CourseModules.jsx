/* filepath: /home/bhotto/projects04/online_test/frontend/src/components/student/CourseModules.jsx */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useManageCourseStore from '../../store/student/manageCourseStore';
import { 
    FaClipboardList, 
    FaCheckCircle, 
    FaLock,
    FaPlay,
    FaBook,
    FaCalendarAlt,
    FaChevronDown,
    FaChevronUp,
    FaLayerGroup,
    FaClock,
    FaStar,
    FaSpinner
} from 'react-icons/fa';

const CourseModules = () => {
    const { modules, modulesLoading, modulesError } = useManageCourseStore();
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    // State to track expanded module
    const [expandedModuleId, setExpandedModuleId] = useState(null);

    const handleUnitClick = (module, unit) => {
        if (unit.type === 'quiz') {
            navigate(`/courses/${courseId}/quizzes/${unit.quiz?.id}`);
        } else if (unit.type === 'lesson') {
            navigate(`/lessons/${unit.lesson?.id}`);
        }
    };

    const toggleModule = (moduleId) => {
        if (expandedModuleId === moduleId) {
            setExpandedModuleId(null);
        } else {
            setExpandedModuleId(moduleId);
        }
    };

    if (modulesLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-muted text-sm">Loading modules...</p>
            </div>
        );
    }

    if (modulesError) {
        return (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center">
                <p>{modulesError}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="text-cyan-400 text-sm sm:text-base font-bold flex items-center gap-2 tracking-wider">
                    COURSE MODULES &rarr;
                </div>
                {modules.length > 0 && (
                    <span className="text-xs font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                        Total: <span className="text-white">{modules.length}</span>
                    </span>
                )}
            </div>

            {!modules.length && (
                <div className="text-center py-12 text-muted bg-white/5 rounded-xl border border-white/10">
                    <p>No modules available for this course yet.</p>
                </div>
            )}

            <div className="space-y-5">
                {modules.map((module, index) => {
                    const isExpanded = expandedModuleId === module.id;
                    const isCompleted = module.progress >= 100;

                    return (
                        <div 
                            key={module.id} 
                            className={`
                                relative rounded-xl border-l-[4px] transition-all duration-300 overflow-hidden bg-[#0a0a0bef]
                                ${isExpanded ? 'border-l-blue-500 border-y border-r border-blue-500/20 shadow-lg shadow-blue-900/10' : 'border-l-white/10 border-y border-r border-white/5 hover:border-white/10'}
                            `}
                            style={{ borderLeftColor: isExpanded ? undefined : 'rgba(255,255,255,0.1)' }} 
                        >
                            {/* Module Row Header */}
                            <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                                
                                {/* Info Section */}
                                <div className="flex-1 min-w-0 flex items-start sm:items-center gap-4">
                                    {/* Icon Box */}
                                    <div className={`p-3 rounded-xl shrink-0 ${isExpanded ? 'bg-blue-600 shadow-lg shadow-blue-900/50 text-white' : 'bg-gray-800/50 text-gray-500'}`}>
                                        <FaLayerGroup className="w-5 h-5" />
                                    </div>

                                    {/* Text Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-300">
                                                Module {index + 1}
                                            </span>
                                            {isCompleted && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                    <FaCheckCircle size={10} /> DONE
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`font-bold text-base sm:text-lg truncate group-hover:text-white transition-colors ${isExpanded ? 'text-white' : 'text-gray-200'}`}>
                                            {module.name}
                                        </h3>
                                        {module.description && (
                                             <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-md hidden sm:block">
                                                {module.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Divider for Mobile */}
                                <div className="h-px w-full bg-white/5 md:hidden"></div>

                                {/* Right: Stats & Action */}
                                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                    
                                    {/* Progress */}
                                    <div className="flex flex-col items-end min-w-[120px]">
                                        <div className="flex items-center justify-between w-full mb-1.5">
                                            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Storage</span>
                                            <div className="flex items-center gap-1.5">
                                                 {isExpanded && !isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>}
                                                <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                                    {Math.round(module.progress || 0)}%
                                                </span>
                                            </div>
                                        </div>
                                        {/* Progress Bar Container */}
                                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5 relative">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                                                style={{ width: `${module.progress || 0}%` }}
                                            >
                                                {/* Shine effect */}
                                                <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Units Badge Desktop */}
                                    <div className="hidden lg:flex flex-col items-center justify-center px-4 py-1 rounded-lg bg-black/20 border border-white/5 min-w-[70px]">
                                        <div className="text-sm font-bold text-white">{module.units ? module.units.length : 0}</div>
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest">Units</div>
                                    </div>

                                    {/* Toggle CTA */}
                                    <button
                                        onClick={() => toggleModule(module.id)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                            isExpanded 
                                            ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30' 
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Dropdown Content */}
                            {isExpanded && (
                                <div className="border-t border-white/10 bg-black/20 animate-fadeIn relative">
                                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent opacity-20"></div>
                                    
                                    {(!module.units || module.units.length === 0) ? (
                                        <div className="p-8 text-center text-gray-500 text-sm italic">
                                            No learning units available in this module.
                                        </div>
                                    ) : (
                                        <>
                                            {/* --- DESKTOP TABLE VIEW (MD+) --- */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="text-xs uppercase text-gray-500 bg-black/20 font-semibold border-b border-white/5">
                                                        <tr>
                                                            <th className="pl-8 pr-4 py-4 w-[140px]">Status</th>
                                                            <th className="px-4 py-4">Unit Details</th>
                                                            <th className="px-4 py-4">Type</th>
                                                            <th className="px-4 py-4 text-right pr-8">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {module.units.map((unit) => {
                                                            const unitName = unit.type === 'lesson' ? unit.lesson?.name : (unit.quiz?.description || unit.quiz?.name || `Quiz ${unit.order}`);
                                                            const isLocked = unit.check_prerequisite && unit.status === 'locked';
                                                            const isUnitCompleted = unit.status === 'completed' || unit.status === 'passed';
                                                            const isInProgress = unit.status === 'inprogress';
                                                            
                                                            return (
                                                                <tr key={unit.id} className="hover:bg-white/[0.02] transition-colors group">
                                                                    <td className="pl-8 pr-4 py-4 whitespace-nowrap align-middle">
                                                                        {isLocked ? (
                                                                             <div className="flex items-center gap-2 text-gray-400 bg-gray-800/40 px-2.5 py-1 rounded-md border border-gray-700/50 w-fit">
                                                                                <FaLock size={10} /> <span className="text-[10px] font-bold uppercase">Locked</span>
                                                                             </div>
                                                                        ) : isUnitCompleted ? (
                                                                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 w-fit shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                                                <FaCheckCircle size={10} /> <span className="text-[10px] font-bold uppercase">Completed </span>
                                                                            </div>
                                                                        ) : isInProgress ? (
                                                                            <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 w-fit shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                                                                                <FaSpinner className="animate-spin" size={10} /> <span className="text-[10px] font-bold uppercase">In Progress</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 w-fit shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div> 
                                                                                <span className="text-[10px] font-bold uppercase">Not Attempted</span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    
                                                                    <td className="px-4 py-4 align-middle">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-gray-200 font-medium group-hover:text-white transition-colors">{unitName}</span>
                                                                            <span className="text-[11px] text-gray-500 font-mono mt-0.5">ORDER #{unit.order}</span>
                                                                        </div>
                                                                    </td>

                                                                    <td className="px-4 py-4 align-middle">
                                                                        {unit.type === 'lesson' ? (
                                                                            <div className="flex items-center gap-2 text-cyan-300 text-xs bg-cyan-950/30 px-3 py-1.5 rounded-full w-fit border border-cyan-500/20">
                                                                                <FaBook className="text-cyan-400" size={12}/>
                                                                                <span className="capitalize font-medium">Lesson</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2 text-purple-300 text-xs bg-purple-950/30 px-3 py-1.5 rounded-full w-fit border border-purple-500/20">
                                                                                <FaStar className="text-purple-400" size={12}/>
                                                                                <span className="capitalize font-medium">Quiz</span>
                                                                            </div>
                                                                        )}
                                                                    </td>

                                                                    <td className="px-4 py-4 text-right pr-8 align-middle">
                                                                        <DesktopActionButtons 
                                                                            unit={unit} 
                                                                            module={module} 
                                                                            isLocked={isLocked} 
                                                                            isUnitCompleted={isUnitCompleted}
                                                                            isInProgress={isInProgress}
                                                                            handleUnitClick={handleUnitClick} 
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* --- MOBILE CARD VIEW (< MD) --- */}
                                            <div className="md:hidden space-y-4 p-4">
                                                {module.units.map((unit) => {
                                                    const unitName = unit.type === 'lesson' ? unit.lesson?.name : (unit.quiz?.description || unit.quiz?.name || `Quiz ${unit.order}`);
                                                    const isLocked = unit.check_prerequisite && unit.status === 'locked';
                                                    const isUnitCompleted = unit.status === 'completed' || unit.status === 'passed';
                                                    const isInProgress = unit.status === 'inprogress';

                                                    return (
                                                        <div key={unit.id} className="bg-white/5 rounded-lg p-4 border border-white/5 relative overflow-hidden">
                                                            {/* Status Strip on Left */}
                                                            <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                                                                isLocked ? 'bg-gray-700' : 
                                                                isUnitCompleted ? 'bg-emerald-500' : 
                                                                isInProgress ? 'bg-amber-500' : 
                                                                'bg-blue-500'
                                                            }`}></div>
                                                            
                                                            <div className="flex justify-between items-start gap-3 mb-3">
                                                                <div className="flex-1">
                                                                     <div className="flex items-center gap-2 mb-1">
                                                                        {unit.type === 'lesson' ? (
                                                                            <span className="text-[10px] uppercase font-bold px-1.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-500/20">
                                                                                Lesson
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px] uppercase font-bold px-1.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/20">
                                                                                Quiz
                                                                            </span>
                                                                        )}
                                                                        
                                                                        {!isLocked && !isUnitCompleted && isInProgress && (
                                                                             <FaSpinner className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                                                                        )}
                                                                        {!isLocked && !isUnitCompleted && !isInProgress && (
                                                                             <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_5px_#3b82f6]"></div> 
                                                                        )}
                                                                     </div>
                                                                     <h4 className="text-sm font-bold text-gray-100 line-clamp-2 leading-tight">{unitName}</h4>
                                                                </div>
                                                                
                                                                {/* Mobile Status Badge */}
                                                                <div>
                                                                    {isLocked ? (
                                                                        <FaLock className="text-gray-600" size={14} />
                                                                    ) : isUnitCompleted ? (
                                                                        <FaCheckCircle className="text-emerald-500" size={16} />
                                                                    ) : isInProgress ? (
                                                                        <FaSpinner className="text-amber-500 animate-spin" size={16} />
                                                                    ) : (
                                                                        <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-500"></div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                                <div className="text-[10px] text-gray-500">
                                                                    Unit Order: {unit.order}
                                                                </div>
                                                                <DesktopActionButtons 
                                                                    unit={unit} 
                                                                    module={module} 
                                                                    isLocked={isLocked} 
                                                                    isUnitCompleted={isUnitCompleted}
                                                                    isInProgress={isInProgress}
                                                                    handleUnitClick={handleUnitClick} 
                                                                    isMobile={true}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Helper Component for consistent buttons across Mobile/Desktop
const DesktopActionButtons = ({ unit, module, isLocked, isUnitCompleted, isInProgress, handleUnitClick, isMobile }) => {
    return (
        <div className="flex items-center gap-2 justify-end">
            {!isLocked && unit.type === 'quiz' && unit.quiz?.view_answerpaper && (
                 <button
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    className="px-3 py-1.5 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20 flex items-center gap-2 text-xs font-medium"
                >
                    <FaClipboardList className="w-3 h-3" /> {isMobile ? "Ans." : "Answer Paper"}
                </button>
            )}
            
            {!isLocked && !isUnitCompleted && isInProgress && (
                <button
                    onClick={() => handleUnitClick(module, unit)}
                    className="px-4 py-1.5 rounded-lg text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/20 bg-amber-600 hover:bg-amber-500 hover:shadow-amber-500/40 flex items-center gap-1.5"
                >
                    Resume <FaPlay size={10} />
                </button>
            )}
            
            {!isLocked && !isUnitCompleted && !isInProgress && (
                <button
                    onClick={() => handleUnitClick(module, unit)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/40"
                >
                    Start <FaPlay size={10} />
                </button>
            )}
            
            {isUnitCompleted && (
                <button
                        onClick={() => handleUnitClick(module, unit)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs px-4 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition"
                >
                    Retry <FaPlay size={10} />
                </button>
            )}
            
            {isLocked && (
                <span className="text-gray-600 px-2 py-1 text-xs italic flex items-center gap-1">
                    Wait <FaClock size={10}/>
                </span>
            )}
        </div>
    );
};

export default CourseModules;