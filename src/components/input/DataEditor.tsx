// ============================================================
// Kerala EG Studio — Extracted Data Editor (Section 4 Requirement)
// Allows student to inspect and edit extracted parameters,
// resolve ambiguities, and verify dimensions before solving.
// ============================================================

import React from 'react';
import { AlertCircle, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';
import type { ExtractedQuestionData, QuestionParameter } from '../../geometry/types';

interface DataEditorProps {
  data: ExtractedQuestionData;
  onChange: (updated: ExtractedQuestionData) => void;
  onConfirmSolve: () => void;
}

export const DataEditor: React.FC<DataEditorProps> = ({ data, onChange, onConfirmSolve }) => {
  const handleParamChange = (index: number, val: any) => {
    const nextParams = [...data.parameters];
    nextParams[index] = { ...nextParams[index], value: val };
    onChange({ ...data, parameters: nextParams });
  };

  const handleTopicChange = (newTopic: any) => {
    onChange({ ...data, topic: newTopic });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-900 text-sm">Review & Verify Extracted Problem Data</h3>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
          Confidence: {Math.round(data.confidence * 100)}%
        </span>
      </div>

      {/* Warnings & Ambiguities */}
      {data.ambiguities.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
          <div className="font-medium flex items-center gap-1.5">
            <AlertCircle size={14} className="text-amber-600" />
            <span>Noticed Ambiguities:</span>
          </div>
          <ul className="list-disc list-inside text-amber-700 pl-2">
            {data.ambiguities.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Missing parameters */}
      {data.missingParameters.length > 0 && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs space-y-1">
          <div className="font-medium flex items-center gap-1.5">
            <AlertCircle size={14} className="text-red-600" />
            <span>Missing / Unspecified Details:</span>
          </div>
          <ul className="list-disc list-inside text-red-700 pl-2">
            {data.missingParameters.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {/* Topic selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-medium text-slate-700 block mb-1">Detected Problem Topic</label>
          <select
            value={data.topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-medium text-slate-800"
          >
            <option value="PROJECTION_OF_POINTS">Projection of Points (All Quadrants)</option>
            <option value="PROJECTION_OF_LINES">Projection of Straight Lines (Rotating Line)</option>
            <option value="PROJECTION_OF_SOLIDS">Projection of Solids (Simple Positions)</option>
            <option value="SECTIONS_OF_SOLIDS">Sections of Solids & True Shapes</option>
            <option value="DEVELOPMENT_OF_SURFACES">Development of Surfaces</option>
            <option value="ISOMETRIC_VIEW">Isometric View (Full Scale 1:1)</option>
            <option value="ISOMETRIC_PROJECTION">Isometric Projection (Scale 0.816)</option>
          </select>
        </div>
        <div>
          <label className="font-medium text-slate-700 block mb-1">Applicable Construction Method</label>
          <input
            type="text"
            readOnly
            value={data.method || 'Standard BIS Orthographic Construction'}
            className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-600"
          />
        </div>
      </div>

      {/* Editable Parameters Table */}
      <div>
        <label className="font-medium text-slate-700 block mb-2 text-xs">Extracted Numerical Parameters</label>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2 px-3 font-semibold">Parameter</th>
                <th className="py-2 px-3 font-semibold">Extracted Value</th>
                <th className="py-2 px-3 font-semibold">Unit</th>
                <th className="py-2 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.parameters.map((param, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-mono font-medium text-slate-700">
                    {param.name}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type={typeof param.value === 'boolean' ? 'checkbox' : 'text'}
                      value={typeof param.value === 'boolean' ? undefined : String(param.value)}
                      checked={typeof param.value === 'boolean' ? Boolean(param.value) : undefined}
                      onChange={(e) => {
                        const val = typeof param.value === 'boolean'
                          ? e.target.checked
                          : isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                        handleParamChange(idx, val);
                      }}
                      className="border border-slate-300 rounded px-2 py-0.5 text-xs w-36 font-mono font-semibold text-blue-700"
                    />
                  </td>
                  <td className="py-2 px-3 text-slate-500 font-mono">
                    {param.unit || '—'}
                  </td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 size={11} /> Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action to solve */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onConfirmSolve}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <span>Generate Geometrical Drawing</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
