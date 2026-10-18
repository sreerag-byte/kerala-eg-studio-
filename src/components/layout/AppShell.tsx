// ============================================================
// Kerala EG Studio — App Shell Layout
// ============================================================

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../store/appStore';
import { Download, Sparkles, BookOpen, Layers } from 'lucide-react';
import { ExportDialog } from '../export/ExportDialog';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { curriculum, setCurrentPage, teachingMode, toggleTeachingMode, currentSolution } = useAppStore();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('curriculum')}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition"
              title="Click to change curriculum"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-slate-900">
                {curriculum ? `${curriculum.university.split(' ')[0]} - ${curriculum.scheme}` : 'Select Syllabus'}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">{curriculum ? curriculum.courseCode : 'EST120 / EST110'}</span>
            </button>

            {currentSolution && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 border-l border-slate-200 pl-3">
                <span className="font-semibold text-slate-700">{currentSolution.topic.replace(/_/g, ' ')}</span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-600 truncate max-w-[260px]">{currentSolution.method}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTeachingMode}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                teachingMode ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <BookOpen size={13} />
              <span>{teachingMode ? 'Teaching Mode' : 'Exam Mode'}</span>
            </button>

            <button
              onClick={() => setExportOpen(true)}
              disabled={!currentSolution}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium shadow-xs transition"
            >
              <Download size={13} />
              <span>Export Drawing</span>
            </button>
          </div>
        </header>

        {/* Main content viewport */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {children}
        </main>
      </div>

      <ExportDialog isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
};
