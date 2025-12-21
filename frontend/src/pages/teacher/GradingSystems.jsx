import React, { useState } from 'react';
import CourseActionButtons from '../../components/teacher/CourseActionButtons';
import GradingSystemsList from '../../components/teacher/GradingSystemsList';
import AddGradingSystem from '../../components/teacher/AddGradingSystem';
import GradingSystemDetail from '../../components/teacher/GradingSystemDetail';
import useGradingSystemStore from '../../store/teacherGradeStore';

export default function GradingSystems() {
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'detail'
  const { selected, select, clearSelected } = useGradingSystemStore();

  const handleAdd = () => setMode('add');
  const handleCancelAdd = () => setMode('list');
  const handleManage = (gs) => { select(gs); setMode('detail'); };
  const handleBack = () => { clearSelected(); setMode('list'); };

  return (
    <div className="flex min-h-screen relative grid-texture">
      <main className="flex-1">
        <CourseActionButtons activeButton="grading" />
        <div className="p-8">
          {mode === 'list' && <GradingSystemsList onAdd={handleAdd} onManage={handleManage} />}
          {mode === 'add' && <AddGradingSystem onCancel={handleCancelAdd} />}
          {mode === 'detail' && selected && <GradingSystemDetail gradingSystem={selected} onBack={handleBack} />}
        </div>
      </main>
    </div>
  );
}