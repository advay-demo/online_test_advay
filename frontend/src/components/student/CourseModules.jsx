import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useManageCourseStore from '../../store/student/manageCourseStore';
import { 
    FaClipboardList, 
    FaCheckCircle, 
    FaLock,
    FaPlay,
    FaClock,
    FaDesktop,
    FaArrowRight,
    FaBook,
    FaCalendarAlt
} from 'react-icons/fa';

const CourseModules = () => {
    const { modules, modulesLoading, modulesError } = useManageCourseStore();
    const { courseId } = useParams();
    const navigate = useNavigate();

    const handleUnitClick = (module, unit) => {
        if (unit.type === 'quiz') {
            navigate(`/courses/${courseId}/quizzes/${unit.quiz?.id}`);
        } else if (unit.type === 'lesson') {
            navigate(`/lessons/${unit.lesson?.id}`);
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
            <div className="text-cyan-400 text-sm sm:text-base font-medium mb-6 flex items-center gap-2">
                 COURSE MODULES &rarr;
            </div>


            {!modules.length && (
                <div className="text-center py-12 text-muted">
                    <p>No modules available for this course yet.</p>
                </div>
            )}

            {modules.map((module) => (
                <div key={module.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    {/* Header Section */}
                    <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg">{module.name}</h3>
                                {module.progress >= 100 && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                                        Completed
                                    </span>
                                )}
                            </div>
                            
                            {module.description && (
                                 <p className="text-xs muted mt-1 line-clamp-2">
                                    {module.description}
                                </p>
                            )}
                            <p className="text-xs muted mt-1 hidden sm:inline ">
                                {module.units ? module.units.length : 0} learning unit{(!module.units || module.units.length !== 1) ? 's' : ''}
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3 sm:gap-4 w-full sm:w-auto min-w-[200px]">
                            
                            
                            <div className="w-full sm:max-w-[14rem]">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Progress</span>
                                    <span className={`text-xs font-bold ${module.progress >= 100 ? 'text-green-400' : 'text-blue-400'}`}>
                                        {Math.round(module.progress || 0)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                                            module.progress >= 100 
                                                ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                                                : 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                                        }`}
                                        style={{ width: `${module.progress || 0}%` }}
                                    >
                                        {/* Shine effect */}
                                        <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                   
                    {/* Units List */}
                    <div className="p-2 space-y-2">
                        {module.units && module.units.length > 0 ? (
                            module.units.map((unit) => {
                                // Fix: Resolve correct name based on unit type
                                const unitName = unit.type === 'lesson' 
                                    ? unit.lesson?.name 
                                    : (unit.quiz?.description || unit.quiz?.name || `Quiz ${unit.order}`);
                                
                                const isLocked = unit.check_prerequisite && unit.status === 'locked';
                                const isCompleted = unit.status === 'completed' || unit.status === 'passed';

                                return (
                                    <div
                                        key={unit.id}
                                        
                                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10 ${!isLocked ? 'hover:bg-white/10 cursor-pointer' : 'opacity-60'} transition group gap-2`}
                                    >
                                    <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${unit.type === 'lesson'
                                                ? 'bg-cyan-500/10 text-cyan-400'
                                                : 'bg-green-500/10 text-green-400'
                                                }`}>
                                                {/* Use icons consistent with student view */}
                                                {unit.type === 'lesson' ? <FaBook className="w-4 h-4" /> : <FaCalendarAlt className="w-4 h-4" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-sm truncate pr-2">
                                                    {unitName}
                                                </div>
                                                <div className="text-xs muted flex items-center gap-3 mt-0.5">
                                                    <span className="uppercase">{unit.type}</span>
                                                    <span>Order: {unit.order}</span>
                                                    {isLocked && <span className="flex items-center gap-1 text-gray-500"><FaLock className="w-3 h-3"/> Locked</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                                            {!isLocked && unit.type === 'quiz' && unit.quiz?.view_answerpaper && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className="px-3 py-1 border border-blue-500/30 text-blue-400 rounded text-xs bg-blue-500/10 hover:bg-blue-500/20 transition flex items-center gap-2"
                                                >
                                                    <FaClipboardList className="w-3 h-3" /> Answer Paper
                                                </button>
                                            )}
                                            {!isLocked && !isCompleted && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUnitClick(module, unit);
                                                    }}
                                                    className="px-3 py-1 border border-white/10 rounded text-xs hover:bg-white/10 transition flex items-center gap-2"
                                                >
                                                    Start <FaPlay className="w-2 h-2" />
                                                </button>
                                            )}
                                            {isCompleted && (
                                                <span className="px-3 py-1 border border-green-500/30 text-green-400 rounded text-xs bg-green-500/10 transition flex items-center gap-2">
                                                    <FaCheckCircle className="w-3 h-3" /> Completed
                                                </span>
                                            )}
                                             {isLocked && (
                                                <span className="px-3 py-1 border border-gray-500/30 text-gray-400 rounded text-xs bg-gray-500/10 transition flex items-center gap-2">
                                                    <FaLock className="w-3 h-3" /> Locked
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })  
                             
                        ) : (
                            <div className="p-4 text-center text-muted text-sm">
                                No learning units yet.
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseModules;