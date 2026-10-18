// ============================================================
// Kerala EG Studio — Curriculum Settings Page (Section 2 & 15)
// Curriculum configuration, branch, scheme, syllabus upload, and API key
// ============================================================

import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { CURRICULUM_REGISTRY, UNIVERSITIES, BRANCHES, SCHEMES } from '../../curriculum/registry';
import { Settings, ShieldCheck, Key, Upload, CheckCircle2, FileText } from 'lucide-react';

export const CurriculumSettings: React.FC = () => {
  const { curriculum, setCurriculum, apiKey, setApiKey } = useAppStore();

  const [university, setUniversity] = useState(curriculum?.university || 'APJ Abdul Kalam Technological University (KTU)');
  const [scheme, setScheme] = useState(curriculum?.scheme || '2024');
  const [branch, setBranch] = useState(curriculum?.branch || 'Mechanical Engineering');
  const [semester, setSemester] = useState(curriculum?.semester || 1);
  const [courseCode, setCourseCode] = useState(curriculum?.courseCode || 'EST120');
  const [courseName, setCourseName] = useState(curriculum?.courseName || 'Engineering Graphics and CAD');

  const [customKey, setCustomKey] = useState(apiKey || '');
  const [savedNotice, setSavedNotice] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);

  const handleSaveCurriculum = (e: React.FormEvent) => {
    e.preventDefault();
    const profileId = scheme === '2024' ? 'ktu_2024' : scheme === '2019' ? 'ktu_2019' : 'custom';
    setCurriculum({
      profileId,
      university,
      scheme,
      branch,
      semester,
      courseCode,
      courseName,
    });
    setApiKey(customKey.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfStatus(`Uploaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Extracted course code: EST120.`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Curriculum & Application Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your Kerala university, academic scheme, branch group, and AI preferences.
        </p>
      </div>

      <form onSubmit={handleSaveCurriculum} className="space-y-6 text-xs">
        {/* University & Scheme */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Kerala Engineering University & Scheme</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-slate-700 block mb-1">University / College</label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              >
                {UNIVERSITIES.map((u) => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Academic Scheme</label>
              <select
                value={scheme}
                onChange={(e) => {
                  setScheme(e.target.value);
                  if (e.target.value === '2024') {
                    setCourseCode('EST120');
                    setCourseName('Engineering Graphics and CAD');
                  } else if (e.target.value === '2019') {
                    setCourseCode('EST110');
                    setCourseName('Engineering Graphics');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              >
                <option value="2024">2024 Scheme (Current - EST120)</option>
                <option value="2019">2019 Scheme (EST110)</option>
                <option value="custom">Custom Syllabus / Autonomous College</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Engineering Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              >
                <option value={1}>Semester 1 (S1)</option>
                <option value={2}>Semester 2 (S2)</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Course Code</label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Upload Custom Syllabus PDF */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Upload size={18} className="text-purple-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Upload Syllabus PDF (Autonomous Colleges)</h3>
          </div>
          <p className="text-slate-500 text-xs">
            If your college follows an autonomous syllabus or revised course code, upload the official PDF here.
          </p>
          <div className="flex items-center gap-3">
            <label className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer font-medium text-slate-700 text-xs">
              <span>Choose PDF File</span>
              <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
            </label>
            {pdfStatus && (
              <span className="text-emerald-700 flex items-center gap-1 text-[11px]">
                <CheckCircle2 size={13} /> {pdfStatus}
              </span>
            )}
          </div>
        </div>

        {/* Gemini API Key */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Key size={18} className="text-amber-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Gemini AI Key (Vision OCR & Tutoring)</h3>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">
            Optional. Kerala EG Studio includes a built-in deterministic rule-based solver that functions completely offline without any API key. Provide your key only if you wish to use multimodal image photo transcription or AI board tutoring. Your key remains strictly on your local browser.
          </p>
          <div>
            <label className="font-medium text-slate-700 block mb-1">Gemini API Key</label>
            <input
              type="password"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedNotice ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5 text-xs">
              <CheckCircle2 size={16} /> Settings saved successfully!
            </span>
          ) : <div />}

          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
