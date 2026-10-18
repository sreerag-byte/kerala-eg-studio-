// ============================================================
// Kerala EG Studio — Solve Question Page
// Handles typed question, photo upload, editable data table review,
// and invokes deterministic geometry solver.
// ============================================================

import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { QuestionInput } from '../input/QuestionInput';
import { ImageUpload } from '../input/ImageUpload';
import { DataEditor } from '../input/DataEditor';
import { solveFromExtractedData } from '../../geometry/solvers';
import type { ExtractedQuestionData } from '../../geometry/types';
import { Type, Camera, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const SolveQuestion: React.FC = () => {
  const {
    setCurrentSolution, setCurrentPage,
    extractedData, setExtractedData, saveSolution, questionText,
  } = useAppStore();

  const [inputMode, setInputMode] = useState<'TYPE' | 'IMAGE'>('TYPE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExtracted = (data: ExtractedQuestionData) => {
    setExtractedData(data);
    setErrorMsg(null);
  };

  const handleConfirmSolve = () => {
    if (!extractedData) return;
    setErrorMsg(null);

    try {
      // Deterministic mathematical solver execution
      const solution = solveFromExtractedData(extractedData);
      setCurrentSolution(solution);

      // Save to recent
      saveSolution(extractedData.rawText, extractedData.topic);

      // Switch to drawing workspace
      setCurrentPage('workspace');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not construct geometry with the provided data.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Solve Engineering Graphics Problem</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step construction with BIS projection lines, annotations, and mathematical validation.
          </p>
        </div>

        {/* Input mode toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => { setInputMode('TYPE'); setExtractedData(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              inputMode === 'TYPE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type size={14} />
            <span>Type Question</span>
          </button>
          <button
            onClick={() => { setInputMode('IMAGE'); setExtractedData(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              inputMode === 'IMAGE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera size={14} />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Input section or review section */}
      {!extractedData ? (
        inputMode === 'TYPE' ? (
          <QuestionInput onExtracted={handleExtracted} />
        ) : (
          <ImageUpload onExtracted={handleExtracted} />
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExtractedData(null)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              <ArrowLeft size={14} />
              <span>Back to problem input</span>
            </button>
          </div>

          <DataEditor
            data={extractedData}
            onChange={setExtractedData}
            onConfirmSolve={handleConfirmSolve}
          />
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          <strong>Solver Error:</strong> {errorMsg}
        </div>
      )}
    </div>
  );
};
