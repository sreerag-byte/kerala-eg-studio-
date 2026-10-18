// ============================================================
// Kerala EG Studio — Three-Panel Drawing Workspace (Section 3)
// Left: Problem & Parameters
// Center: SVG Drawing Canvas + Step Controls
// Right: Step Instructions & Calculations & Validation
// ============================================================

import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { StepControls } from '../steps/StepControls';
import { StepPanel } from '../steps/StepPanel';
import { Sliders, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export const ThreePanel: React.FC = () => {
  const { currentSolution, canvasState, setScale, setPan, questionText } = useAppStore();
  const [activeMobileTab, setActiveMobileTab] = useState<'canvas' | 'info' | 'steps'>('canvas');

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      {/* Mobile tabs switch */}
      <div className="md:hidden flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setActiveMobileTab('info')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            activeMobileTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
          }`}
        >
          Problem Info
        </button>
        <button
          onClick={() => setActiveMobileTab('canvas')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            activeMobileTab === 'canvas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
          }`}
        >
          Drawing Canvas
        </button>
        <button
          onClick={() => setActiveMobileTab('steps')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            activeMobileTab === 'steps' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
          }`}
        >
          Construction Steps
        </button>
      </div>

      {/* LEFT PANEL: Problem statement & parameters */}
      <aside
        className={`panel-left h-full overflow-y-auto scrollbar-thin p-4 ${
          activeMobileTab === 'info' ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
              <FileText size={14} className="text-blue-600" />
              <span>Problem Statement</span>
            </div>
            <p className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 leading-relaxed text-[11px]">
              {questionText || (currentSolution ? `${currentSolution.topic.replace(/_/g, ' ')} Problem` : 'No active problem selected.')}
            </p>
          </div>

          {currentSolution && (
            <>
              <div>
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1.5">
                  <Sliders size={14} className="text-blue-600" />
                  <span>Geometrical Parameters</span>
                </div>
                <div className="space-y-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  {Object.entries(currentSolution.finalValues).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-[11px] py-0.5 border-b border-slate-100 last:border-0">
                      <span className="text-slate-500 truncate mr-2">{k}</span>
                      <span className="font-mono font-medium text-slate-800 shrink-0">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-medium">BIS Projection Standard</span>
                <div className="p-2 rounded bg-blue-50/50 border border-blue-100 text-[11px] text-blue-900 leading-normal">
                  <strong>First-Angle Projection</strong> (IS 962 / SP 46).
                  Elevation above XY, Plan below XY for Quadrant 1.
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* CENTER PANEL: Technical Drawing Canvas & Step Player */}
      <main
        className={`panel-center h-full relative ${
          activeMobileTab === 'canvas' ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="flex-1 min-h-0 relative">
          <DrawingCanvas
            canvasState={canvasState}
            onScaleChange={setScale}
            onPanChange={setPan}
          />
        </div>
        <StepControls />
      </main>

      {/* RIGHT PANEL: Construction Steps & Teaching Mode */}
      <aside
        className={`panel-right h-full ${
          activeMobileTab === 'steps' ? 'block' : 'hidden md:flex'
        }`}
      >
        <StepPanel />
      </aside>
    </div>
  );
};
