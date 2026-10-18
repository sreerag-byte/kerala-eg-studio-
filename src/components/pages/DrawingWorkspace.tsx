// ============================================================
// Kerala EG Studio — Drawing Workspace Page
// Live interactive technical drawing studio
// ============================================================

import React from 'react';
import { ThreePanel } from '../layout/ThreePanel';
import { useAppStore } from '../../store/appStore';
import { Compass, HelpCircle } from 'lucide-react';

export const DrawingWorkspace: React.FC = () => {
  const { currentSolution, setCurrentPage } = useAppStore();

  if (!currentSolution) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <Compass size={32} />
        </div>
        <h3 className="font-semibold text-slate-900 text-base">No Drawing in Session</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-normal">
          Select or enter an Engineering Graphics problem statement to watch the live mathematical construction.
        </p>
        <button
          onClick={() => setCurrentPage('solve')}
          className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <HelpCircle size={14} />
          <span>Solve a Question</span>
        </button>
      </div>
    );
  }

  return <ThreePanel />;
};
