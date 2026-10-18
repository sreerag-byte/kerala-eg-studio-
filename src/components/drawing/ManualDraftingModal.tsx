// ============================================================
// Kerala EG Studio — Manual Drafting & Pencil Guide Modal
// Comprehensive guide for drawing manually on technical sheets
// compliant with BIS SP 46:2003 & Kerala Engineering Syllabi
// ============================================================

import React from 'react';
import { X, PenTool, CheckCircle2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

interface ManualDraftingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualDraftingModal: React.FC<ManualDraftingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400">
              <PenTool size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Manual Drafting & Hand-Drawing Guide
              </h2>
              <p className="text-xs text-blue-200">
                BIS SP 46:2003 / IS 962 Drawing Sheet Rules for Kerala Engineering Colleges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed scrollbar-thin">
          {/* Section 1: Pencil Grades */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
              Pencil Grade Selection & Sharpening
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">4H / 3H Pencil</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">Light</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mb-1.5">
                  <strong>Conical needle point</strong>. For construction lines, locus lines, and inter-view projectors.
                </p>
                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                  Keep line weight &lt; 0.2 mm. Never press hard!
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">2H Pencil</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">Medium</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mb-1.5">
                  <strong>Chisel edge</strong>. For XY reference line, centerlines, section hatching, and dimension lines.
                </p>
                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                  Line weight ~0.35 mm. Produces crisp uniform strokes.
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">H / HB Pencil</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Dark</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mb-1.5">
                  <strong>Smooth rounded point</strong>. For visible object outlines, final solids, and lettering.
                </p>
                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                  Line weight ~0.7 mm. Draw only at the final step!
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Mini-Drafter Setup */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-2.5 flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
              Mini-Drafter Setup & Alignment
            </h3>
            <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
              <li><strong>Clamp position:</strong> Clamp the drafter firmly at the top-left edge of your drawing board.</li>
              <li><strong>Zero alignment:</strong> Align the horizontal blade along the top edge of your drawing sheet (or pre-drawn horizontal reference line), set the protractor head index to <strong>0°</strong>, and tighten the central clamping knob.</li>
              <li><strong>Perpendicular projection:</strong> The horizontal blade draws horizontal locus and reference lines; the vertical blade automatically draws exact 90° vertical projectors down between Elevation (FV) and Plan (TV) without using a separate setsquare!</li>
            </ul>
          </div>

          {/* Section 3: Drawing Sequence */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-2.5 flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
              Step-by-Step Drawing Sheet Workflow
            </h3>
            <ol className="space-y-2 text-[11px] text-slate-600 list-decimal list-inside">
              <li>
                <strong>Draw Sheet Margins:</strong> 20 mm on the left edge (for binding) and 10 mm on the top, right, and bottom edges with 2H pencil.
              </li>
              <li>
                <strong>Establish Reference Line (XY):</strong> Draw a clean horizontal line with 2H pencil. Mark <strong>X</strong> on the left and <strong>Y</strong> on the right in 5 mm capital letters.
              </li>
              <li>
                <strong>Construct the Simple Position / Base View First:</strong> In solids and planes, ALWAYS draw the view that shows the true shape first (e.g. base polygon in Top View or Front View) with <strong>4H pencil</strong>.
              </li>
              <li>
                <strong>Project Corresponding Points:</strong> Use vertical drafter blade to project corners to the second view with light <strong>4H pencil</strong>.
              </li>
              <li>
                <strong>Perform Rotations / Tilts:</strong> Measure tilt angles with the drafter head protractor or arc radius with compass.
              </li>
              <li>
                <strong>Final Darkening:</strong> Only when both views are geometrically verified, go over visible object edges with <strong>HB pencil</strong> to make the final solution stand out boldly over the light 4H construction projectors.
              </li>
              <li>
                <strong>Dimensioning & Annotations:</strong> Add dimensions with 3:1 closed filled arrowheads and place dimensions above the dimension line according to the <em>Aligned System</em>.
              </li>
            </ol>
          </div>

          {/* Golden Rules */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1 text-xs text-blue-950">
              <Sparkles size={13} className="text-blue-600" />
              Kerala University & KTU Valuation Secrets:
            </div>
            <p>• <strong>Do NOT erase construction lines and projectors!</strong> Evaluators check the correctness of projectors, arc transfers, and locus lines for step marks.</p>
            <p>• Keep hands and drafter blades clean to prevent graphite smearing on the ivory cartridge sheet.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
          >
            Got It, Back to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
