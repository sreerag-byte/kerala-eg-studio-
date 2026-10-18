// ============================================================
// Kerala EG Studio — Step-by-Step Learning & Theory Guide
// Visual explanation of projections, reference planes, quadrant systems,
// rotating-line method, BIS line standards, and syllabus terms.
// ============================================================

import React, { useState } from 'react';
import { BookOpen, Compass, Layers, CheckCircle, HelpCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export const StepLearning: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [selectedTopic, setSelectedTopic] = useState<'quadrants' | 'lines' | 'solids' | 'lines_types'>('quadrants');

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step-by-Step Theory & Teaching Guide</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Master the geometrical principles prescribed by Kerala engineering universities before drawing.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        {[
          { id: 'quadrants', label: '1. Quadrants & Points' },
          { id: 'lines', label: '2. Rotating-Line Method' },
          { id: 'solids', label: '3. Projection of Solids' },
          { id: 'lines_types', label: '4. BIS Line Conventions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTopic(tab.id as any)}
            className={`pb-2.5 transition border-b-2 ${
              selectedTopic === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {selectedTopic === 'quadrants' && (
        <div className="space-y-4 text-xs leading-relaxed text-slate-700">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">The Four Quadrants & First-Angle Projection</h3>
            <p>
              Space is divided into four quadrants by two principal planes of projection: the <strong>Horizontal Plane (HP)</strong> and the <strong>Vertical Plane (VP)</strong>. Their line of intersection is known as the <strong>Reference Line (XY)</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                <span className="font-bold text-blue-900 block mb-1">1st Quadrant (Standard in India / BIS)</span>
                <p className="text-blue-800">Point is <strong>Above HP</strong> and <strong>In Front of VP</strong>.</p>
                <p className="text-slate-600 mt-1 font-mono text-[11px]">Elevation (a′): Above XY | Plan (a): Below XY</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">2nd Quadrant</span>
                <p className="text-slate-700">Point is <strong>Above HP</strong> and <strong>Behind VP</strong>.</p>
                <p className="text-slate-600 mt-1 font-mono text-[11px]">Elevation (a′): Above XY | Plan (a): Above XY (Overlaps)</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">3rd Quadrant (USA Standard)</span>
                <p className="text-slate-700">Point is <strong>Below HP</strong> and <strong>Behind VP</strong>.</p>
                <p className="text-slate-600 mt-1 font-mono text-[11px]">Elevation (a′): Below XY | Plan (a): Above XY</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">4th Quadrant</span>
                <p className="text-slate-700">Point is <strong>Below HP</strong> and <strong>In Front of VP</strong>.</p>
                <p className="text-slate-600 mt-1 font-mono text-[11px]">Elevation (a′): Below XY | Plan (a): Below XY (Overlaps)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTopic === 'lines' && (
        <div className="space-y-4 text-xs leading-relaxed text-slate-700">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Rotating-Line (Rabatment) Method</h3>
            <p>
              When a straight line AB is inclined to both reference planes at true angles θ (to HP) and φ (to VP):
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Neither the front view nor the top view shows the true length of the line.</li>
              <li>The apparent length in top view (plan) is <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">l = L · cos(θ)</code>.</li>
              <li>The apparent length in front view (elevation) is <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">l′ = L · cos(φ)</code>.</li>
              <li><strong>Fundamental Constraint:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">cos²(θ) + cos²(φ) ≤ 1</code>. If this sum exceeds 1, no real straight line can exist.</li>
            </ul>
          </div>
        </div>
      )}

      {selectedTopic === 'solids' && (
        <div className="space-y-4 text-xs leading-relaxed text-slate-700">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Projection of Regular Solids</h3>
            <p>
              For prisms, pyramids, cylinders, and cones in simple position (axis perpendicular to HP and base on HP):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">Prisms</span>
                <p>Plan shows the true shape of the base polygon (regular polygon). Elevation shows a rectangle whose height equals the axis length.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">Pyramids</span>
                <p>Plan shows the base polygon with slant edges meeting at the center (apex o). Elevation is a triangle of true height H.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTopic === 'lines_types' && (
        <div className="space-y-4 text-xs leading-relaxed text-slate-700">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">BIS SP 46 Line Weight Standards</h3>
            <table className="w-full text-left border border-slate-200 rounded overflow-hidden">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-2">Line Type</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Typical Thickness</th>
                  <th className="p-2">Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-mono font-bold text-slate-800">Continuous Thick</td>
                  <td className="p-2">Solid thick line</td>
                  <td className="p-2 font-mono">0.7 mm</td>
                  <td className="p-2">Visible outlines and edges</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono font-medium text-slate-600">Continuous Thin</td>
                  <td className="p-2">Light continuous</td>
                  <td className="p-2 font-mono">0.35 mm</td>
                  <td className="p-2">Dimension lines, projectors, hatching</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono font-medium text-slate-600">Dashed Thin</td>
                  <td className="p-2">Dashed lines (4mm dash, 1mm space)</td>
                  <td className="p-2 font-mono">0.35 mm</td>
                  <td className="p-2">Hidden outlines and edges</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono font-medium text-blue-600">Chain Thin</td>
                  <td className="p-2">Long-dash, dot, long-dash</td>
                  <td className="p-2 font-mono">0.35 mm</td>
                  <td className="p-2">Center lines, axes of symmetry</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono font-medium text-red-600">Chain Thick Ends</td>
                  <td className="p-2">Chain line with thick end strokes</td>
                  <td className="p-2 font-mono">0.7 mm ends</td>
                  <td className="p-2">Cutting plane lines (V-T / H-T)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
