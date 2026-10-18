// ============================================================
// Kerala EG Studio — My Progress Page (Section 14)
// Tracks student module completion, solved count, and exam readiness.
// ============================================================

import React from 'react';
import { useAppStore } from '../../store/appStore';
import { TrendingUp, CheckCircle2, Award, Clock, ArrowRight } from 'lucide-react';

export const MyProgress: React.FC = () => {
  const { savedSolutions, curriculum, setCurrentPage } = useAppStore();

  const MODULES = [
    { id: 'PROJECTION_OF_POINTS', title: 'Projection of Points', total: 10 },
    { id: 'PROJECTION_OF_LINES', title: 'Projection of Lines', total: 15 },
    { id: 'PROJECTION_OF_SOLIDS', title: 'Projection of Solids', total: 12 },
    { id: 'SECTIONS_OF_SOLIDS', title: 'Sections of Solids', total: 10 },
    { id: 'DEVELOPMENT_OF_SURFACES', title: 'Development of Surfaces', total: 8 },
    { id: 'ISOMETRIC_VIEW', title: 'Isometric Views', total: 12 },
  ];

  const getSolvedCount = (topicId: string) => {
    return savedSolutions.filter((s) => s.topic === topicId || (topicId === 'ISOMETRIC_VIEW' && s.topic === 'ISOMETRIC_PROJECTION')).length;
  };

  const totalSolved = savedSolutions.length;
  const targetExercises = 67;
  const overallPct = Math.min(100, Math.round((totalSolved / targetExercises) * 100));

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Learning & Examination Progress</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {curriculum?.university || 'KTU'} {curriculum?.courseCode || 'EST120'} syllabus coverage overview.
        </p>
      </div>

      {/* Progress metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Problems Solved</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalSolved}</div>
          <span className="text-[11px] text-emerald-600 mt-1 block">In local learning session</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Syllabus Completion</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{overallPct}%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Based on prescribed exercises</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Exam Readiness Score</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {totalSolved > 5 ? 'High (85%)' : totalSolved > 2 ? 'Moderate (50%)' : 'Beginner (20%)'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">KTU Semester Exam scale</span>
        </div>
      </div>

      {/* Module Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Module-Wise Progress</h3>
        <div className="space-y-3">
          {MODULES.map((m) => {
            const count = getSolvedCount(m.id);
            const pct = Math.min(100, Math.round((count / m.total) * 100));
            return (
              <div key={m.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">{m.title}</span>
                  <span className="font-mono text-slate-500">{count} / {m.total} completed ({pct}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(5, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
