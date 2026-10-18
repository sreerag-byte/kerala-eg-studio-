// ============================================================
// Kerala EG Studio — Export Dialog
// Supports: SVG, PDF (jsPDF), High-Res PNG, and DXF
// With examination title block customization (A4 / A3, portrait / landscape)
// ============================================================

import React, { useState } from 'react';
import { X, Download, FileCode, FileText, Image, FileBox } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const { currentSolution, curriculum } = useAppStore();

  const [format, setFormat] = useState<'SVG' | 'PDF' | 'PNG' | 'DXF'>('SVG');
  const [includeTitleBlock, setIncludeTitleBlock] = useState(true);
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4');
  const [studentName, setStudentName] = useState('STUDENT');
  const [regNo, setRegNo] = useState('TVE24CS001');
  const [drawingTitle, setDrawingTitle] = useState(
    currentSolution ? currentSolution.topic.replace(/_/g, ' ') : 'ENGINEERING GRAPHICS EXERCISE'
  );

  if (!isOpen || !currentSolution) return null;

  const handleExport = () => {
    const filename = `Kerala_EG_${currentSolution.topic}_${Date.now()}`;

    // Get the SVG element from DOM
    const svgEl = document.querySelector('.drawing-canvas-container svg') as SVGSVGElement | null;
    if (!svgEl) {
      alert('Could not locate drawing canvas for export.');
      return;
    }

    // 1. Export SVG
    if (format === 'SVG') {
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgEl);

      // Add title block if requested
      if (includeTitleBlock) {
        const titleBlockSvg = `
          <g id="title-block" transform="translate(450, 500)">
            <rect width="320" height="80" fill="#ffffff" stroke="#1a1a1a" stroke-width="1.2"/>
            <line x1="0" y1="25" x2="320" y2="25" stroke="#1a1a1a" stroke-width="0.7"/>
            <line x1="0" y1="50" x2="320" y2="50" stroke="#1a1a1a" stroke-width="0.7"/>
            <line x1="160" y1="25" x2="160" y2="80" stroke="#1a1a1a" stroke-width="0.7"/>
            <text x="10" y="18" font-family="Arial" font-size="12" font-weight="bold" fill="#1a1a1a">${drawingTitle}</text>
            <text x="10" y="42" font-family="Arial" font-size="9" fill="#333">NAME: ${studentName}</text>
            <text x="170" y="42" font-family="Arial" font-size="9" fill="#333">REG NO: ${regNo}</text>
            <text x="10" y="68" font-family="Arial" font-size="9" fill="#333">COURSE: ${curriculum?.courseCode || 'EST120'}</text>
            <text x="170" y="68" font-family="Arial" font-size="9" fill="#333">SCALE: 1:1 (BIS SP 46)</text>
          </g>
        `;
        source = source.replace('</svg>', `${titleBlockSvg}</svg>`);
      }

      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(blob, `${filename}.svg`);
      onClose();
      return;
    }

    // 2. Export PDF
    if (format === 'PDF') {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: paperSize === 'A4' ? 'a4' : 'a3',
      });

      // Title header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(drawingTitle, 15, 15);
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Kerala Engineering Colleges Examination Drawing | ${curriculum?.university || 'KTU'}`, 15, 22);

      // Render drawing objects as vector lines into jsPDF
      const scale = 0.55;
      const offX = 140;
      const offY = 100;

      for (const obj of currentSolution.drawingObjects) {
        if (!obj.visible) continue;
        if (obj.geometry.kind === 'LINE') {
          const l = obj.geometry;
          doc.setLineWidth(obj.lineStyle === 'VISIBLE' ? 0.5 : 0.2);
          if (obj.lineStyle === 'HIDDEN') doc.setLineDashPattern([2, 1], 0);
          else doc.setLineDashPattern([], 0);
          doc.line(
            offX + l.start.x * scale, offY + l.start.y * scale,
            offX + l.end.x * scale, offY + l.end.y * scale
          );
        } else if (obj.geometry.kind === 'POINT_MARKER') {
          const p = obj.geometry.position;
          doc.circle(offX + p.x * scale, offY + p.y * scale, 0.7, 'F');
        }
      }

      // Title block
      if (includeTitleBlock) {
        const tbX = 180;
        const tbY = 160;
        doc.rect(tbX, tbY, 95, 30);
        doc.line(tbX, tbY + 10, tbX + 95, tbY + 10);
        doc.line(tbX, tbY + 20, tbX + 95, tbY + 20);
        doc.line(tbX + 48, tbY + 10, tbX + 48, tbY + 30);

        doc.setFontSize(9);
        doc.setFont('Helvetica', 'bold');
        doc.text(drawingTitle, tbX + 4, tbY + 7);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`NAME: ${studentName}`, tbX + 4, tbY + 16);
        doc.text(`REG: ${regNo}`, tbX + 52, tbY + 16);
        doc.text(`COURSE: ${curriculum?.courseCode || 'EST120'}`, tbX + 4, tbY + 26);
        doc.text('SCALE: 1:1 (BIS SP 46)', tbX + 52, tbY + 26);
      }

      doc.save(`${filename}.pdf`);
      onClose();
      return;
    }

    // 3. Export PNG
    if (format === 'PNG') {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new window.Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) saveAs(blob, `${filename}.png`);
          URL.revokeObjectURL(url);
          onClose();
        }, 'image/png');
      };
      img.src = url;
      return;
    }

    // 4. Export DXF (Standard AutoCAD Release 12 ASCII DXF)
    if (format === 'DXF') {
      let dxf = `0\nSECTION\n2\nENTITIES\n`;

      for (const obj of currentSolution.drawingObjects) {
        if (!obj.visible) continue;
        if (obj.geometry.kind === 'LINE') {
          const l = obj.geometry;
          dxf += `0\nLINE\n8\n${obj.lineStyle}\n10\n${l.start.x}\n20\n${-l.start.y}\n30\n0.0\n11\n${l.end.x}\n21\n${-l.end.y}\n31\n0.0\n`;
        } else if (obj.geometry.kind === 'CIRCLE') {
          const c = obj.geometry;
          dxf += `0\nCIRCLE\n8\n${obj.lineStyle}\n10\n${c.center.x}\n20\n${-c.center.y}\n30\n0.0\n40\n${c.radius}\n`;
        }
      }

      dxf += `0\nENDSEC\n0\nEOF\n`;
      const blob = new Blob([dxf], { type: 'application/dxf;charset=utf-8' });
      saveAs(blob, `${filename}.dxf`);
      onClose();
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Export Engineering Drawing</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Format selection */}
          <div>
            <label className="font-medium text-slate-700 block mb-2">Select Export Format</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'SVG', label: 'SVG', icon: FileCode, desc: 'Vector' },
                { id: 'PDF', label: 'PDF', icon: FileText, desc: 'Print' },
                { id: 'PNG', label: 'PNG', icon: Image, desc: 'Hi-Res' },
                { id: 'DXF', label: 'DXF', icon: FileBox, desc: 'CAD' },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const active = format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as any)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon size={18} className="mb-1" />
                    <span className="text-xs">{fmt.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{fmt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title block toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={includeTitleBlock}
                onChange={(e) => setIncludeTitleBlock(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Include BIS Examination Title Block</span>
            </label>
          </div>

          {/* Title block fields */}
          {includeTitleBlock && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Sheet Size</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="A4">A4 Landscape</option>
                    <option value="A3">A3 Landscape</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Drawing Title</label>
                  <input
                    type="text"
                    value={drawingTitle}
                    onChange={(e) => setDrawingTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Student Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Register Number</label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-200">
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs"
          >
            <Download size={13} />
            <span>Download {format}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
