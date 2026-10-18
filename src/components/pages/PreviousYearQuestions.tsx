// ============================================================
// Kerala EG Studio — Previous-Year Questions (PYQs)
// Past KTU B.Tech examination questions with year and session
// ============================================================

import React from 'react';
import { useAppStore } from '../../store/appStore';
import { parseQuestionRuleBased } from '../../geometry/solvers/parser';
import { solveFromExtractedData } from '../../geometry/solvers';
import { History, Award, ArrowRight, FileText } from 'lucide-react';

interface PYQItem {
  id: string;
  year: string;
  exam: string;
  course: string;
  module: number;
  marks: number;
  question: string;
}

const KTU_PYQS: PYQItem[] = [
  {
    id: 'pyq_2024_1',
    year: 'December 2024',
    exam: 'KTU S1 Regular Examination (2024 Scheme)',
    course: 'EST120 Engineering Graphics & CAD',
    module: 2,
    marks: 14,
    question: 'A line AB has a true length of 80 mm. End A is 20 mm above HP and 25 mm in front of VP. The line is inclined at 30 degrees to HP and 45 degrees to VP. Draw its projections and locate its traces.',
  },
  {
    id: 'pyq_2024_2',
    year: 'December 2024',
    exam: 'KTU S1 Regular Examination (2024 Scheme)',
    course: 'EST120 Engineering Graphics & CAD',
    module: 2,
    marks: 7,
    question: 'A point A is 20 mm above HP and 25 mm in front of VP. Draw its projections and state the quadrant.',
  },
  {
    id: 'pyq_2023_1',
    year: 'May 2023',
    exam: 'KTU S1/S2 Supplementary Examination (2019 Scheme)',
    course: 'EST110 Engineering Graphics',
    module: 4,
    marks: 14,
    question: 'A square prism of base side 40 mm and height 70 mm rests on HP. A cutting plane inclined at 45 degrees to HP passes through the axis at 35 mm from the base. Draw sectional top view and true shape of section.',
  },
  {
    id: 'pyq_2023_2',
    year: 'January 2023',
    exam: 'KTU S1 Regular Examination (2019 Scheme)',
    course: 'EST110 Engineering Graphics',
    module: 5,
    marks: 14,
    question: 'Develop the lateral surface of a square prism of base side 40 mm and axis height 65 mm resting on its base on HP.',
  },
  {
    id: 'pyq_2022_1',
    year: 'July 2022',
    exam: 'KTU S1/S2 Examination (2019 Scheme)',
    course: 'EST110 Engineering Graphics',
    module: 5,
    marks: 14,
    question: 'Draw the isometric view of a rectangular block 60 mm long, 40 mm wide, and 30 mm high resting on its base.',
  },
  {
    id: 'pyq_2021_1',
    year: 'December 2021',
    exam: 'KTU S1 Regular Examination (2019 Scheme)',
    course: 'EST110 Engineering Graphics',
    module: 3,
    marks: 14,
    question: 'A square prism of base side 40 mm and axis height 70 mm has its axis perpendicular to HP and base resting on HP. Draw its projections.',
  },
];

export const PreviousYearQuestions: React.FC = () => {
  const { setQuestionText, setExtractedData, setCurrentSolution, setCurrentPage } = useAppStore();

  const handleSolvePYQ = (pyq: PYQItem) => {
    setQuestionText(pyq.question);
    const parsed = parseQuestionRuleBased(pyq.question);
    setExtractedData(parsed);
    const sol = solveFromExtractedData(parsed);
    setCurrentSolution(sol);
    setCurrentPage('workspace');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Previous-Year University Questions (PYQ)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Solved past exam questions from KTU and University of Kerala B.Tech semester exams.
        </p>
      </div>

      <div className="space-y-3">
        {KTU_PYQS.map((pyq) => (
          <div key={pyq.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                    {pyq.year}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">| {pyq.exam}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  {pyq.course} • Module {pyq.module}
                </div>
                <p className="text-xs text-slate-800 font-sans mt-2 leading-relaxed">
                  {pyq.question}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1 font-bold text-blue-600 text-xs">
                  <Award size={13} /> {pyq.marks} Marks
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => handleSolvePYQ(pyq)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition"
              >
                <span>Solve This Exam Question</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
