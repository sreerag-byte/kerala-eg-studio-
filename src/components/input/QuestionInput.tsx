// ============================================================
// Kerala EG Studio — Question Input (Section 4)
// Allows student to type custom problem or pick from verified Kerala syllabus presets.
// ============================================================

import React, { useState } from 'react';
import { Type, Sparkles, BookOpen, Send, HelpCircle } from 'lucide-react';
import { parseQuestionRuleBased } from '../../geometry/solvers/parser';
import { extractFromText } from '../../ai/gemini';
import { useAppStore } from '../../store/appStore';
import type { ExtractedQuestionData } from '../../geometry/types';

interface QuestionInputProps {
  onExtracted: (data: ExtractedQuestionData) => void;
}

const PRESET_QUESTIONS = [
  {
    topic: 'Points (Q1)',
    label: 'Point A 20mm above HP, 25mm in front of VP',
    text: 'A point A is 20 mm above HP and 25 mm in front of VP. Draw its projections.',
  },
  {
    topic: 'Points (Q2)',
    label: 'Point B 30mm above HP, 35mm behind VP',
    text: 'A point B is 30 mm above HP and 35 mm behind VP. Draw its projections and state the quadrant.',
  },
  {
    topic: 'Points (Q3)',
    label: 'Point C 25mm below HP, 40mm behind VP',
    text: 'A point C is 25 mm below HP and 40 mm behind VP. Draw its projections.',
  },
  {
    topic: 'Lines (Both Inclined)',
    label: 'Line AB 80mm long, θ=30°, φ=45° (KTU Classic)',
    text: 'A line AB has a true length of 80 mm. End A is 20 mm above HP and 25 mm in front of VP. The line is inclined at 30 degrees to HP and 45 degrees to VP. Draw its projections and locate its traces.',
  },
  {
    topic: 'Solids (Simple Position)',
    label: 'Square Prism 40mm side, 70mm height',
    text: 'A square prism of base side 40 mm and axis height 70 mm has its axis perpendicular to HP and base resting on HP. Draw its projections.',
  },
  {
    topic: 'Sections & True Shape',
    label: 'Section of Prism by 45° Cutting Plane',
    text: 'A square prism of base side 40 mm and height 70 mm rests on HP. A cutting plane inclined at 45 degrees to HP passes through the axis at 35 mm from the base. Draw sectional top view and true shape of section.',
  },
  {
    topic: 'Development of Surfaces',
    label: 'Development of Square Prism 40mm x 65mm',
    text: 'Develop the lateral surface of a square prism of base side 40 mm and axis length 65 mm resting on its base on HP.',
  },
  {
    topic: 'Isometric View',
    label: 'Isometric View of Rectangular Block 60x40x30mm',
    text: 'Draw the isometric view of a rectangular block 60 mm long, 40 mm wide, and 30 mm high resting on its base.',
  },
  {
    topic: '3-Stage Solid (14M)',
    label: 'Square Pyramid Inclined to both HP & VP',
    text: 'A square pyramid of base side 35 mm and axis length 65 mm is resting on one of its base edges on HP. Its axis is inclined at 45 degrees to HP and the resting edge is inclined at 30 degrees to VP. Draw its three stage projections.',
  },
  {
    topic: '3-Stage Solid (14M)',
    label: 'Hexagonal Prism Inclined to HP & VP',
    text: 'A hexagonal prism of base side 30 mm and axis height 65 mm rests on HP on an edge of its base. The axis is inclined at 45 degrees to HP and 30 degrees to VP. Draw its 3-stage projections.',
  },
  {
    topic: '3-View Orthographic (14M)',
    label: 'Stepped Block (FV, TV & Side View with 45° Miter)',
    text: 'Draw the orthographic three views (Front View, Top View, and Side View) of a stepped block of length 60 mm, height 45 mm, and width 40 mm using the 45 degree miter line.',
  },
  {
    topic: 'Curves: Involute',
    label: 'Involute of Circle Ø40mm with Normal & Tangent',
    text: 'Draw the involute of a circle of diameter 40 mm. Draw a normal and tangent to the curve at a point on the curve.',
  },
  {
    topic: 'Curves: Cycloid',
    label: 'Cycloid of Rolling Circle Ø50mm',
    text: 'A circle of 50 mm diameter rolls on a straight line for one complete revolution without slipping. Draw the cycloid curve and construct normal and tangent.',
  },
];

export const QuestionInput: React.FC<QuestionInputProps> = ({ onExtracted }) => {
  const { questionText, setQuestionText, apiKey } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSolve = async () => {
    if (!questionText.trim()) return;
    setIsProcessing(true);

    try {
      if (apiKey) {
        // Use Gemini API
        const data = await extractFromText(questionText);
        onExtracted(data);
      } else {
        // Deterministic rule-based parser
        const data = parseQuestionRuleBased(questionText);
        onExtracted(data);
      }
    } catch {
      // Fallback to rule-based parser if API call fails
      const data = parseQuestionRuleBased(questionText);
      onExtracted(data);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPreset = (text: string) => {
    setQuestionText(text);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-900 text-sm">Enter Question Statement</h3>
        </div>
        <span className="text-[11px] text-slate-500">Natural language problem input</span>
      </div>

      <div>
        <textarea
          rows={4}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="e.g. A line AB has a true length of 80 mm. End A is 20 mm above HP and 25 mm in front of VP. The line is inclined at 30 degrees to HP and 45 degrees to VP. Draw its projections..."
          className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans leading-relaxed"
        />
      </div>

      {/* Preset buttons */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2">
          <BookOpen size={12} />
          <span>Curated Kerala / KTU Syllabus Presets:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset.text)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition"
              title={preset.text}
            >
              <span className="font-semibold text-slate-500 mr-1">[{preset.topic}]</span>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSolve}
          disabled={!questionText.trim() || isProcessing}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition"
        >
          <Sparkles size={14} />
          <span>{isProcessing ? 'Analyzing Problem...' : 'Analyze & Extract Data'}</span>
        </button>
      </div>
    </div>
  );
};
