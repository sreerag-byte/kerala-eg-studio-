// ============================================================
// Kerala EG Studio — Practice Questions (Section 12 Exam Mode)
// Categorized by difficulty (Basic, Medium, Exam Advanced) with mark allocation
// and expected construction stage checklists.
// ============================================================

import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { parseQuestionRuleBased } from '../../geometry/solvers/parser';
import { solveFromExtractedData } from '../../geometry/solvers';
import { FileCheck, ArrowRight, Award, CheckSquare, Clock } from 'lucide-react';

interface PracticeItem {
  id: string;
  topic: string;
  difficulty: 'BASIC' | 'MEDIUM' | 'ADVANCED';
  marks: number;
  timeMins: number;
  question: string;
  checklist: string[];
}

const PRACTICE_BANK: PracticeItem[] = [
  {
    id: 'pq_1',
    topic: 'Projection of Points',
    difficulty: 'BASIC',
    marks: 7,
    timeMins: 12,
    question: 'A point P is 30 mm above HP and 40 mm in front of VP. Draw its projections and state the distance between elevation and plan.',
    checklist: ['XY reference line drawn', 'Elevation p′ marked above XY', 'Plan p marked below XY', 'Projector perpendicular to XY', 'Dimensions labeled (30 & 40 mm)'],
  },
  {
    id: 'pq_2',
    topic: 'Projection of Straight Lines',
    difficulty: 'ADVANCED',
    marks: 14,
    timeMins: 25,
    question: 'A line AB has a true length of 80 mm. End A is 20 mm above HP and 25 mm in front of VP. The line is inclined at 30 degrees to HP and 45 degrees to VP. Draw its projections and locate its traces.',
    checklist: [
      'Locate end A in elevation and plan',
      'True length construction with θ = 30° to HP',
      'True length construction with φ = 45° to VP',
      'Locus lines through b′ and b',
      'Elevation a′b′ and Plan ab drawn thick',
      'Traces HT and VT located on reference line',
    ],
  },
  {
    id: 'pq_3',
    topic: 'Projection of Solids',
    difficulty: 'MEDIUM',
    marks: 14,
    timeMins: 20,
    question: 'A square prism of base side 40 mm and axis height 70 mm has its base on HP with one base edge inclined at 30° to VP. Draw its projections.',
    checklist: ['Plan drawn first as tilted square', 'Projectors drawn to elevation', 'Axis line chain-dotted', 'Visible & hidden vertical edges demarcated', 'Height 70 mm dimensioned'],
  },
  {
    id: 'pq_4',
    topic: 'Sections of Solids',
    difficulty: 'ADVANCED',
    marks: 14,
    timeMins: 30,
    question: 'A square prism of side 40 mm and height 70 mm rests on HP. A cutting plane inclined at 45 degrees to HP passes through the axis at 35 mm from base. Draw sectional top view and true shape of section.',
    checklist: [
      'Elevation with cutting plane V-T at 45°',
      'Section points on vertical edges marked',
      'Sectional top view hatched at 45°',
      'Auxiliary reference plane X1Y1 parallel to cutting plane',
      'True shape of section drawn and hatched',
    ],
  },
  {
    id: 'pq_5',
    topic: 'Development of Surfaces',
    difficulty: 'MEDIUM',
    marks: 14,
    timeMins: 22,
    question: 'Develop the lateral surface of a square prism of base side 40 mm and axis height 65 mm resting on its base on HP.',
    checklist: [
      'Front view of prism drawn',
      'Perimeter stretch-out calculated (4 × 40 = 160 mm)',
      'Horizontal projection lines for development',
      'Four lateral panels marked A-B-C-D-A',
      'Fold lines drawn and labeled',
    ],
  },
  {
    id: 'pq_6',
    topic: 'Isometric View',
    difficulty: 'MEDIUM',
    marks: 14,
    timeMins: 25,
    question: 'Draw the isometric view of a rectangular block 60 mm long, 40 mm wide, and 30 mm high resting on its base.',
    checklist: [
      'Isometric axes drawn at 30° to horizontal',
      'Full scale (1:1) measurements laid off',
      'Base rhombus completed',
      'Vertical uprights erected to height 30 mm',
      'Top face completed and visible outlines thickened',
    ],
  },
  {
    id: 'pq_7',
    topic: '3-Stage Solids (Both Inclined)',
    difficulty: 'ADVANCED',
    marks: 14,
    timeMins: 35,
    question: 'A square pyramid of base side 35 mm and axis length 65 mm is resting on one of its base edges on HP. Its axis is inclined at 45 degrees to HP and the resting edge is inclined at 30 degrees to VP. Draw its three stage projections.',
    checklist: [
      'Stage 1: Simple position (Axis perpendicular to HP, base true shape)',
      'Stage 2: Elevation tilted so axis makes 45° to HP',
      'Stage 2: Foreshortened plan projected downward with locus lines',
      'Stage 3: Top view rotated by 30° to VP',
      'Stage 3: Final elevation projected upward with level lines',
    ],
  },
  {
    id: 'pq_8',
    topic: '3-View Orthographic Projection',
    difficulty: 'ADVANCED',
    marks: 14,
    timeMins: 30,
    question: 'Draw the orthographic three views (Front View, Top View, and Side View) of a stepped block of length 60 mm, height 45 mm, and width 40 mm using the 45 degree miter line.',
    checklist: [
      'XY and X1Y1 mutual reference lines drawn',
      '45° miter line in the fourth quadrant',
      'Front View (Elevation) with stepped profile',
      'Top View (Plan) aligned vertically with Front View',
      'Depth transferred via 45° miter line to Side View',
    ],
  },
  {
    id: 'pq_9',
    topic: 'Engineering Curves: Involute',
    difficulty: 'MEDIUM',
    marks: 14,
    timeMins: 25,
    question: 'Draw the involute of a circle of diameter 40 mm. Draw a normal and tangent to the curve at a point on the curve.',
    checklist: [
      'Baseline length equal to circumference πD = 125.7 mm',
      'Circle divided into 12 equal divisions (30° each)',
      'Tangents erected at all 12 division points',
      'Smooth curve drawn through locus points with French curve',
      'Normal and tangent drawn perpendicular at point P',
    ],
  },
];

export const PracticeQuestions: React.FC = () => {
  const { setQuestionText, setExtractedData, setCurrentSolution, setCurrentPage } = useAppStore();
  const [filterDifficulty, setFilterDifficulty] = useState<'ALL' | 'BASIC' | 'MEDIUM' | 'ADVANCED'>('ALL');

  const filtered = filterDifficulty === 'ALL'
    ? PRACTICE_BANK
    : PRACTICE_BANK.filter((p) => p.difficulty === filterDifficulty);

  const handleSolvePractice = (item: PracticeItem) => {
    setQuestionText(item.question);
    const parsed = parseQuestionRuleBased(item.question);
    setExtractedData(parsed);
    const sol = solveFromExtractedData(parsed);
    setCurrentSolution(sol);
    setCurrentPage('workspace');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Examination Practice Questions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Module-wise exam problems with university mark allocation and evaluation checklist.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          {(['ALL', 'BASIC', 'MEDIUM', 'ADVANCED'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={`px-3 py-1 rounded-md transition ${
                filterDifficulty === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {d === 'ALL' ? 'All Questions' : d}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">{item.topic}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.difficulty === 'BASIC'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.difficulty === 'MEDIUM'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-sans">{item.question}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                  <Award size={14} className="text-blue-600" />
                  <span>{item.marks} Marks</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                  <Clock size={12} />
                  <span>{item.timeMins} Mins</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Expected Exam Stages Checklist:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600">
                {item.checklist.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px]">
                    <CheckSquare size={13} className="text-emerald-600 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => handleSolvePractice(item)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
              >
                <span>Solve Step-by-Step</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
