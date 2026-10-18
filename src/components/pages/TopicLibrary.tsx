// ============================================================
// Kerala EG Studio — Topic Library Page
// Detailed browser for all curriculum modules & topics with difficulty tags
// ============================================================

import React from 'react';
import { useAppStore } from '../../store/appStore';
import { CURRICULUM_REGISTRY } from '../../curriculum/registry';
import { BookOpen, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { parseQuestionRuleBased } from '../../geometry/solvers/parser';
import { solveFromExtractedData } from '../../geometry/solvers';

export const TopicLibrary: React.FC = () => {
  const { curriculum, setQuestionText, setExtractedData, setCurrentSolution, setCurrentPage } = useAppStore();

  const currentProf = CURRICULUM_REGISTRY.find((c) => c.id === curriculum?.profileId) || CURRICULUM_REGISTRY[0];

  const handleLaunchTopic = (topicTitle: string, solverTopicId: string) => {
    let samplePrompt = '';
    if (solverTopicId === 'PROJECTION_OF_POINTS') {
      samplePrompt = 'A point A is 25 mm above HP and 30 mm in front of VP. Draw its projections.';
    } else if (solverTopicId === 'PROJECTION_OF_LINES') {
      samplePrompt = 'A line AB has a true length of 80 mm. End A is 20 mm above HP and 25 mm in front of VP. The line is inclined at 30 degrees to HP and 45 degrees to VP. Draw its projections and locate its traces.';
    } else if (solverTopicId === 'PROJECTION_OF_SOLIDS') {
      samplePrompt = 'A square prism of base side 40 mm and height 70 mm rests on HP with axis perpendicular to HP. Draw its projections.';
    } else if (solverTopicId === 'SECTIONS_OF_SOLIDS') {
      samplePrompt = 'A square prism of side 40 mm and height 70 mm rests on HP. A cutting plane inclined at 45 degrees to HP passes through axis at 35 mm from base. Draw sectional top view and true shape.';
    } else if (solverTopicId === 'DEVELOPMENT_OF_SURFACES') {
      samplePrompt = 'Develop the lateral surface of a square prism of base side 40 mm and height 65 mm.';
    } else if (solverTopicId === 'ISOMETRIC_VIEW') {
      samplePrompt = 'Draw the isometric view of a rectangular block 60 mm x 40 mm x 30 mm.';
    }

    if (samplePrompt) {
      setQuestionText(samplePrompt);
      const parsed = parseQuestionRuleBased(samplePrompt);
      setExtractedData(parsed);
      const sol = solveFromExtractedData(parsed);
      setCurrentSolution(sol);
      setCurrentPage('workspace');
    } else {
      setCurrentPage('solve');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold mb-1">
          <ShieldCheck size={12} />
          <span>{currentProf.courseCode}: {currentProf.courseName}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">University Topic Library</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Browse module-wise topics prescribed under the {currentProf.university} syllabus ({currentProf.scheme} Scheme).
        </p>
      </div>

      <div className="space-y-4">
        {currentProf.modules.map((mod) => (
          <div key={mod.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                  Module {mod.number}
                </span>
                <h3 className="font-semibold text-slate-900 text-sm mt-0.5">{mod.title}</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{mod.topics.length} Topics</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {mod.topics.map((t) => (
                <div key={t.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-800 text-xs">{t.title}</h4>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          t.difficulty === 'BASIC'
                            ? 'bg-emerald-50 text-emerald-700'
                            : t.difficulty === 'MEDIUM'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {t.difficulty}
                      </span>
                      {!t.included && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                          Syllabus Exclusion
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{t.description}</p>
                    {t.note && (
                      <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{t.note}</span>
                      </p>
                    )}
                  </div>

                  {t.included && t.solverTopicId !== 'UNSUPPORTED' && (
                    <button
                      onClick={() => handleLaunchTopic(t.title, t.solverTopicId)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition"
                    >
                      <span>Study & Solve</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
