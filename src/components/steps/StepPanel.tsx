// ============================================================
// Kerala EG Studio — Step Panel (Right panel)
// Shows current step explanation, calculations, teaching tips,
// and Hands-On Manual Hand-Drawing & Pencil Guidance (BIS SP 46)
// ============================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, BookOpen, CheckCircle, AlertTriangle, PenTool } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { ConstructionStep, CalculationEntry, ManualDraftingGuide } from '../../geometry/types';

const CalculationCard: React.FC<{ calc: CalculationEntry }> = ({ calc }) => (
  <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-2 text-xs">
    <div className="text-slate-500 font-medium mb-1">{calc.label}</div>
    <div className="font-mono text-slate-700 mb-0.5">{calc.formula}</div>
    <div className="font-mono text-slate-600 mb-0.5 text-slate-500">{calc.substitution}</div>
    <div className="font-mono font-semibold text-blue-700">= {calc.result}</div>
  </div>
);

function inferManualGuide(step: ConstructionStep): ManualDraftingGuide {
  const text = (step.title + ' ' + step.explanation + ' ' + step.whatToDraw).toLowerCase();

  if (text.includes('xy') || text.includes('reference') || text.includes('ground line') || text.includes('axis of reference')) {
    return {
      pencilGrade: '2H',
      instrument: 'Mini-Drafter (Horizontal blade locked at 0°)',
      bisStandardLine: 'Type B — Continuous Thin Line (0.35 mm)',
      technique: 'Align the mini-drafter horizontal blade parallel to your board top. Draw the reference line XY in a single firm stroke with a chisel-pointed 2H pencil. Mark letters X and Y in 5 mm height.',
    };
  }

  if (text.includes('projector') || text.includes('project') || text.includes('locus') || text.includes('perpendicular') || text.includes('drop')) {
    return {
      pencilGrade: '4H',
      instrument: 'Mini-Drafter (Vertical blade for 90° drop)',
      bisStandardLine: 'Type B — Continuous Thin Line (0.18 mm)',
      technique: 'Use the vertical blade of the mini-drafter to drop thin alignment projectors between Elevation (FV) and Plan (TV). Use feather-light pressure with a 4H needle point so they do not overpower the final views.',
    };
  }

  if (text.includes('arc') || text.includes('compass') || text.includes('rotate') || text.includes('true length') || text.includes('swing')) {
    return {
      pencilGrade: '4H',
      instrument: 'Engineering Compass / Divider with 4H lead',
      bisStandardLine: 'Type B — Construction Arc (0.18 mm)',
      technique: 'Set the compass needle firmly at the pivot center. Ensure the compass pencil point is sharpened with a chisel edge 1 mm shorter than the needle point. Swing the arc in one continuous stroke.',
    };
  }

  if (text.includes('dimension') || text.includes('angle') || text.includes('true angle') || text.includes('trace')) {
    return {
      pencilGrade: '2H',
      instrument: 'Mini-Drafter & Protractor head',
      bisStandardLine: 'Type B — Dimension Line with 3:1 Arrowheads',
      technique: 'Leave a 1 mm gap from object vertices for extension lines. Draw 3:1 ratio closed filled arrowheads. Write numerical values directly above the dimension line according to the aligned dimension system.',
    };
  }

  if (text.includes('outline') || text.includes('visible') || text.includes('elevation') || text.includes('plan') || text.includes('final') || text.includes('solid')) {
    return {
      pencilGrade: 'HB',
      instrument: 'Mini-Drafter & Setsquares',
      bisStandardLine: 'Type A — Continuous Thick Visible Line (0.7 mm)',
      technique: 'Once points are verified by intersection of projectors and loci, darken all visible solid edges with an HB pencil to make the actual views stand out boldly against the faint 4H construction work.',
    };
  }

  return {
    pencilGrade: '2H',
    instrument: 'Mini-Drafter',
    bisStandardLine: 'Type B — Standard Technical Line',
    technique: 'Keep your mini-drafter blades clean and use light uniform strokes to prevent graphite smudging on the sheet.',
  };
}

const ManualDraftingCard: React.FC<{ step: ConstructionStep }> = ({ step }) => {
  const guide = step.manualDrafting || inferManualGuide(step);

  const badgeColor =
    guide.pencilGrade === 'HB'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
      : guide.pencilGrade === '2H'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-sky-100 text-sky-900 border-sky-300';

  return (
    <div className="bg-amber-50/60 border border-amber-200/90 rounded-xl p-3 mb-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px]">
          <PenTool size={13} className="text-amber-800" />
          <span>Manual Hand-Drawing Technique</span>
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
          Pencil: {guide.pencilGrade}
        </span>
      </div>
      <div className="space-y-1.5 text-[11px] text-amber-950/90">
        <div><strong className="text-amber-900">Instrument:</strong> {guide.instrument}</div>
        <div><strong className="text-amber-900">BIS Line:</strong> {guide.bisStandardLine}</div>
        <div className="text-slate-700 bg-white/90 p-2 rounded-lg border border-amber-200/60 mt-1 leading-relaxed">
          {guide.technique}
        </div>
      </div>
    </div>
  );
};

const TeachingExpander: React.FC<{ step: ConstructionStep }> = ({ step }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-blue-100 rounded mt-3">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5"><HelpCircle size={13} /> Teaching Mode Details</span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && (
        <div className="p-3 space-y-3 text-xs">
          <div>
            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px]">1</span>
              What to Draw
            </div>
            <p className="text-slate-600 leading-relaxed">{step.whatToDraw}</p>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-[9px]">2</span>
              How to Draw It
            </div>
            <p className="text-slate-600 leading-relaxed">{step.howToDraw}</p>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <span className="w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px]">3</span>
              Why This Step Is Needed
            </div>
            <p className="text-slate-600 leading-relaxed">{step.whyNeeded}</p>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <span className="w-4 h-4 bg-purple-500 text-white rounded-full flex items-center justify-center text-[9px]">4</span>
              What to Check
            </div>
            <p className="text-slate-600 leading-relaxed">{step.whatToCheck}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const StepPanel: React.FC = () => {
  const { canvasState, currentSolution, teachingMode, toggleTeachingMode } = useAppStore();
  const { currentStep, totalSteps } = canvasState;

  if (!currentSolution) {
    return (
      <div className="panel-right h-full flex flex-col items-center justify-center p-6 text-center">
        <BookOpen className="text-slate-300 mb-3" size={32} />
        <p className="text-sm text-slate-400">Solve a question to see construction steps here.</p>
      </div>
    );
  }

  const step: ConstructionStep | undefined = currentSolution.steps[currentStep - 1];

  return (
    <div className="panel-right h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Step Instructions</h3>
          <p className="text-xs text-slate-500 mt-0.5">{currentSolution.method}</p>
        </div>
        <button
          onClick={toggleTeachingMode}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${teachingMode ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
        >
          <BookOpen size={12} />
          {teachingMode ? 'Teaching On' : 'Teaching Off'}
        </button>
      </div>

      {/* Step list - compact */}
      <div className="px-3 py-2 border-b border-slate-100 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {currentSolution.steps.map((s) => (
            <button
              key={s.stepNumber}
              onClick={() => useAppStore.getState().setCurrentStep(s.stepNumber)}
              className={`w-7 h-7 text-xs rounded-full font-medium transition-colors ${
                s.stepNumber === currentStep
                  ? 'bg-blue-600 text-white'
                  : s.stepNumber < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-500'
              }`}
              title={s.title}
            >
              {s.stepNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {step ? (
          <div>
            <div className="flex items-start gap-2 mb-3">
              <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {step.stepNumber}
              </span>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">{step.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">of {totalSteps} steps</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">{step.explanation}</p>

            {/* Manual Hand-Drawing & Pencil Technique Card */}
            <ManualDraftingCard step={step} />

            {/* Calculations */}
            {step.calculations.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Calculations</h5>
                {step.calculations.map((c, i) => <CalculationCard key={i} calc={c} />)}
              </div>
            )}

            {/* Teaching mode expansion */}
            {teachingMode && <TeachingExpander step={step} />}
          </div>
        ) : currentStep === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">Press Next Step or Play to begin the construction.</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="text-green-500 mx-auto mb-2" size={28} />
            <p className="text-sm font-semibold text-slate-700">Construction Complete</p>
            <p className="text-xs text-slate-500 mt-1">All {totalSteps} steps have been shown.</p>
          </div>
        )}
      </div>

      {/* Validation */}
      {currentSolution.validation && (
        <div className="border-t border-slate-200 px-4 py-3">
          <div className={`flex items-center gap-2 text-xs rounded px-3 py-2 border ${
            currentSolution.validation.passed ? 'validation-pass' : 'validation-fail'
          }`}>
            {currentSolution.validation.passed
              ? <CheckCircle size={14} />
              : <AlertTriangle size={14} />
            }
            <span className="font-medium">
              Geometric Validation: {currentSolution.validation.passed ? 'PASSED' : 'ISSUES FOUND'}
            </span>
          </div>
          {!currentSolution.validation.passed && (
            <div className="mt-2 space-y-1">
              {currentSolution.validation.checks.filter(c => !c.passed).map((c, i) => (
                <div key={i} className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                  {c.name}: Expected {c.expected}, got {c.actual}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Final values */}
      {currentStep === totalSteps && currentSolution.finalValues && (
        <div className="border-t border-slate-200 px-4 py-3 bg-slate-50">
          <h5 className="text-xs font-semibold text-slate-700 mb-2">Final Results</h5>
          <div className="space-y-1">
            {Object.entries(currentSolution.finalValues).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-500">{k}</span>
                <span className="font-mono font-medium text-slate-800">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
