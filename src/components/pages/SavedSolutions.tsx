// ============================================================
// Kerala EG Studio — Saved Solutions Page (Section 14)
// Local persistent storage of user-solved questions & drawings
// ============================================================

import React from 'react';
import { useAppStore } from '../../store/appStore';
import { BookmarkCheck, Trash2, ArrowRight, Clock, HelpCircle } from 'lucide-react';

export const SavedSolutions: React.FC = () => {
  const { savedSolutions, loadSolution, deleteSolution, setCurrentPage } = useAppStore();

  const handleOpen = (id: string) => {
    loadSolution(id);
    setCurrentPage('workspace');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Saved Solutions & Drawings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your solved technical drawings and step constructions saved in local storage.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">{savedSolutions.length} Saved</span>
      </div>

      {savedSolutions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <BookmarkCheck size={36} className="text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-800 text-sm">No Saved Solutions Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-normal">
            When you solve a problem, it will automatically be saved here so you can review and replay the steps anytime.
          </p>
          <button
            onClick={() => setCurrentPage('solve')}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <HelpCircle size={14} />
            <span>Solve your first question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSolutions.map((sol) => (
            <div
              key={sol.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-800">
                    {sol.topic.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(sol.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate">{sol.questionText}</p>
                <div className="text-[11px] text-slate-400 mt-1">
                  Method: {sol.solution.method} • {sol.solution.steps.length} Steps
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => deleteSolution(sol.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete from saved"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => handleOpen(sol.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
                >
                  <span>Replay Drawing</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
