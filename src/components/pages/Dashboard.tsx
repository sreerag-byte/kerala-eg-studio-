// ============================================================
// Kerala EG Studio — Dashboard Page
// Overview, quick actions, recent problems, curriculum progress
// ============================================================

import React from 'react';
import { useAppStore } from '../../store/appStore';
import {
  HelpCircle, Upload, Compass, Library, BookOpen,
  CheckCircle, ArrowRight, Clock, Award, ShieldCheck
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { setCurrentPage, curriculum, savedSolutions, currentSolution } = useAppStore();

  const QUICK_MODULES = [
    { title: 'Projection of Points', desc: 'All 4 quadrants, on HP/VP', topic: 'PROJECTION_OF_POINTS', count: '12 Exercises' },
    { title: 'Projection of Lines', desc: 'Rotating-line method, true length, traces', topic: 'PROJECTION_OF_LINES', count: '18 Exercises' },
    { title: 'Projection of Solids', desc: 'Prisms, pyramids, cylinders & cones', topic: 'PROJECTION_OF_SOLIDS', count: '15 Exercises' },
    { title: 'Sections & True Shape', desc: 'Cutting planes, hatching, auxiliary view', topic: 'SECTIONS_OF_SOLIDS', count: '10 Exercises' },
    { title: 'Development of Surfaces', desc: 'Parallel-line & radial-line methods', topic: 'DEVELOPMENT_OF_SURFACES', count: '8 Exercises' },
    { title: 'Isometric Views', desc: '30° isometric axes, scale 1.0 vs 0.816', topic: 'ISOMETRIC_VIEW', count: '14 Exercises' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Hero card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold mb-3 border border-blue-500/30">
            <ShieldCheck size={12} />
            <span>Aligned with {curriculum?.university || 'KTU'} {curriculum?.scheme || '2024'} Scheme</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Kerala EG Studio
          </h2>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
            Deterministic geometrical construction engine and interactive step-by-step tutor for Kerala Engineering Colleges. Generates accurate first-angle projections, calculations, and examination-standard drawings.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => setCurrentPage('solve')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition"
            >
              <HelpCircle size={15} />
              <span>Solve a Question</span>
            </button>
            <button
              onClick={() => setCurrentPage('workspace')}
              disabled={!currentSolution}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Compass size={15} />
              <span>Open Drawing Canvas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setCurrentPage('solve')}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <HelpCircle size={18} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Enter Problem Statement</h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Type or paste your question to get verified step-by-step constructions and calculations.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-4">
            <span>Start solving</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('solve')}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Upload size={18} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Upload Question Photo</h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Upload textbook questions, handwritten notes, or university exam sheets for AI OCR transcription.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-4">
            <span>Upload image</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('practice')}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <BookOpen size={18} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Practice by Difficulty</h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Access Basic, Medium, and University Exam-level problem sets with complete step solutions.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold mt-4">
            <span>Browse sets</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>

      {/* Modules grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 text-sm">Syllabus Modules (Kerala University / KTU)</h3>
          <button
            onClick={() => setCurrentPage('library')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View all topics
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_MODULES.map((mod, i) => (
            <div
              key={i}
              onClick={() => setCurrentPage('library')}
              className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer transition"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-slate-800 text-xs">{mod.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono">{mod.count}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{mod.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recently saved solutions */}
      {savedSolutions.length > 0 && (
        <div className="pt-2">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">Recently Solved Problems</h3>
          <div className="space-y-2">
            {savedSolutions.slice(0, 3).map((sol) => (
              <div
                key={sol.id}
                onClick={() => {
                  useAppStore.getState().loadSolution(sol.id);
                  setCurrentPage('workspace');
                }}
                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-400 cursor-pointer flex items-center justify-between text-xs transition"
              >
                <div>
                  <span className="font-semibold text-slate-800">{sol.topic.replace(/_/g, ' ')}</span>
                  <p className="text-slate-500 truncate max-w-lg mt-0.5">{sol.questionText}</p>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-[11px]">
                  <span>Open</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
