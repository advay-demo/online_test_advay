import React from 'react';
import { FaChevronUp, FaChevronDown, FaBook } from 'react-icons/fa';
import useManageCourseStore from '../../store/manageCourseStore';

const CourseDesign = () => {
    const {
        modules, moduleOrder, unitOrders, savingOrder,
        moveModule, saveModuleOrder, moveUnit, saveUnitOrder
    } = useManageCourseStore();

    return (
        <div>
            <div className="text-cyan-400 text-sm font-medium mb-6 flex items-center gap-2">
                DESIGN THE COURSE - Reorder modules and learning units <span>&rarr;</span>
            </div>

            {modules.length === 0 ? (
                <div className="text-center py-12 text-muted">
                    <p>No modules found. Add modules first to reorder them.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Module Reordering */}
                    <div className="card-strong p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Module Order</h3>
                            <button
                                onClick={saveModuleOrder}
                                disabled={savingOrder}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                {savingOrder ? 'Saving...' : 'Save Module Order'}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {moduleOrder.map((moduleId, index) => {
                                const module = modules.find(m => m.id === moduleId);
                                if (!module) return null;
                                return (
                                    <div
                                        key={moduleId}
                                        className="card p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{module.name}</h4>
                                                <p className="text-xs muted">{module.units_count || 0} learning units</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => moveModule(moduleId, 'up')}
                                                disabled={index === 0}
                                                className="px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move up"
                                            >
                                                <FaChevronUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => moveModule(moduleId, 'down')}
                                                disabled={index === moduleOrder.length - 1}
                                                className="px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move down"
                                            >
                                                <FaChevronDown className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Unit Reordering per Module */}
                    {moduleOrder.map((moduleId) => {
                        const module = modules.find(m => m.id === moduleId);
                        if (!module || !module.units || module.units.length === 0) return null;

                        const units = unitOrders[moduleId] || [];
                        return (
                            <div key={moduleId} className="card-strong p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">{module.name} - Learning Units</h3>
                                    <button
                                        onClick={() => saveUnitOrder(moduleId)}
                                        disabled={savingOrder}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        {savingOrder ? 'Saving...' : 'Save Unit Order'}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {units.map((unit, index) => {
                                        const unitData = module.units.find(u => (u.lesson_id || u.quiz_id) === unit.unit_id);
                                        if (!unitData) return null;
                                        const isLesson = !!unitData.lesson_id;
                                        return (
                                            <div
                                                key={unit.unit_id}
                                                className="card p-3 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isLesson
                                                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                                                        : 'bg-green-500/20 border border-green-500/30 text-green-400'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            {isLesson ? (
                                                                <FaBook className="w-4 h-4 text-cyan-400" />
                                                            ) : (
                                                                <span className="text-green-400 font-bold">Q</span>
                                                            )}
                                                            <h4 className="font-semibold">{unitData.name}</h4>
                                                            <span className={`text-xs px-2 py-0.5 rounded ${isLesson
                                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                }`}>
                                                                {isLesson ? 'Lesson' : 'Quiz'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => moveUnit(moduleId, unit.unit_id, 'up')}
                                                        disabled={index === 0}
                                                        className="px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Move up"
                                                    >
                                                        <FaChevronUp className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveUnit(moduleId, unit.unit_id, 'down')}
                                                        disabled={index === units.length - 1}
                                                        className="px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Move down"
                                                    >
                                                        <FaChevronDown className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CourseDesign;