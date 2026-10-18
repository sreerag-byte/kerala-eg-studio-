// ============================================================
// Kerala EG Studio — Image Upload & OCR component (Section 4)
// Accepts JPG, JPEG, PNG photographs of textbook/exam questions.
// Includes rotation, preview, and multimodal Gemini extraction.
// ============================================================

import React, { useState, useRef } from 'react';
import { Upload, Camera, RotateCw, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { extractFromImage } from '../../ai/gemini';
import { useAppStore } from '../../store/appStore';
import type { ExtractedQuestionData } from '../../geometry/types';
import { parseQuestionRuleBased } from '../../geometry/solvers/parser';

interface ImageUploadProps {
  onExtracted: (data: ExtractedQuestionData) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onExtracted }) => {
  const { apiKey } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Raw, setBase64Raw] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Remove data:*/*;base64, prefix for API
      const base64Clean = result.split(',')[1];
      setBase64Raw(base64Clean);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleExtract = async () => {
    if (!base64Raw) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (apiKey) {
        // Use Gemini multimodal OCR
        const result = await extractFromImage(base64Raw, mimeType);
        onExtracted(result);
      } else {
        // Fallback when no API key is provided
        setErrorMsg('Gemini API key is not configured in Settings. Using sample OCR text fallback.');
        const sampleText = 'A line AB has a true length of 80 mm. End A is 20 mm above HP and 25 mm in front of VP. The line is inclined at 30 degrees to HP and 45 degrees to VP. Draw its projections and locate its traces.';
        const parsed = parseQuestionRuleBased(sampleText);
        onExtracted(parsed);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to interpret image with AI. Please try typing the question.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-900 text-sm">Upload Question Photo or Scan</h3>
        </div>
        <span className="text-[11px] text-slate-500">JPG, PNG, JPEG</span>
      </div>

      {!imagePreview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20"
        >
          <Upload size={32} className="text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">Click or drag photo of question here</p>
          <p className="text-[11px] text-slate-400 mt-1 text-center">
            Upload handwritten problems, exam papers, or textbook diagrams
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900/5 max-h-64 flex items-center justify-center">
            <img
              src={imagePreview}
              alt="Question preview"
              className="max-h-64 object-contain transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="absolute top-2 right-2 flex gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
              <button
                onClick={handleRotate}
                className="p-1 rounded hover:bg-slate-100 text-slate-700"
                title="Rotate 90°"
              >
                <RotateCw size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setImagePreview(null);
                setBase64Raw(null);
              }}
              className="text-slate-500 hover:text-slate-800"
            >
              Choose different image
            </button>
            <button
              onClick={handleExtract}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium shadow-xs transition"
            >
              <Sparkles size={14} />
              <span>{isProcessing ? 'Interpreting Question...' : 'Extract Data & Solve'}</span>
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
