// ============================================================
// Kerala EG Studio — 2D CAD Drafting Workbench (Section 8.J)
// Interactive 2D drafting tool adhering to KTU CAD syllabus:
// Line, Circle, Rectangle, Dimension, Text, Snapping, Ortho mode, and DXF export
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import {
  MousePointer, Minus, Circle, Square, Ruler, Type,
  Trash2, Download, Magnet, Crosshair, RotateCcw,
} from 'lucide-react';
import { saveAs } from 'file-saver';

interface CadEntity {
  id: string;
  type: 'LINE' | 'CIRCLE' | 'RECTANGLE' | 'DIMENSION' | 'TEXT';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  radius?: number;
  label?: string;
  color?: string;
}

export const CadWorkbench: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [activeTool, setActiveTool] = useState<'SELECT' | 'LINE' | 'CIRCLE' | 'RECT' | 'DIM' | 'TEXT'>('LINE');
  const [entities, setEntities] = useState<CadEntity[]>([
    // Default initial template: A4 border and reference lines
    { id: 'b_1', type: 'RECTANGLE', startX: 20, startY: 20, endX: 400, endY: 280, color: '#1a1a1a' },
    { id: 'tb_1', type: 'RECTANGLE', startX: 250, startY: 220, endX: 400, endY: 280, color: '#1a1a1a' },
    { id: 'txt_1', type: 'TEXT', startX: 260, startY: 240, endX: 260, endY: 240, label: 'KERALA EG STUDIO — CAD LAB' },
  ]);

  const [snapToGrid, setSnapToGrid] = useState(true);
  const [orthoMode, setOrthoMode] = useState(false);
  const [gridSize, setGridSize] = useState(10); // mm

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [previewEntity, setPreviewEntity] = useState<CadEntity | null>(null);

  // Snap point to grid
  const snapCoord = (val: number) => {
    if (!snapToGrid) return Math.round(val);
    return Math.round(val / gridSize) * gridSize;
  };

  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    let x = snapCoord(rawX);
    let y = snapCoord(rawY);

    if (orthoMode && drawingStart) {
      const dx = Math.abs(x - drawingStart.x);
      const dy = Math.abs(y - drawingStart.y);
      if (dx > dy) y = drawingStart.y;
      else x = drawingStart.x;
    }

    return { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getSvgCoordinates(e);
    setCursorPos(coords);

    if (drawingStart && activeTool !== 'SELECT') {
      const { x: sx, y: sy } = drawingStart;
      const { x: ex, y: ey } = coords;

      if (activeTool === 'LINE') {
        setPreviewEntity({ id: 'preview', type: 'LINE', startX: sx, startY: sy, endX: ex, endY: ey, color: '#2563eb' });
      } else if (activeTool === 'CIRCLE') {
        const r = Math.hypot(ex - sx, ey - sy);
        setPreviewEntity({ id: 'preview', type: 'CIRCLE', startX: sx, startY: sy, endX: ex, endY: ey, radius: r, color: '#2563eb' });
      } else if (activeTool === 'RECT') {
        setPreviewEntity({ id: 'preview', type: 'RECTANGLE', startX: sx, startY: sy, endX: ex, endY: ey, color: '#2563eb' });
      } else if (activeTool === 'DIM') {
        setPreviewEntity({
          id: 'preview', type: 'DIMENSION', startX: sx, startY: sy, endX: ex, endY: ey,
          label: `${Math.round(Math.hypot(ex - sx, ey - sy))} mm`, color: '#2563eb',
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const coords = getSvgCoordinates(e);

    if (!drawingStart) {
      if (activeTool === 'TEXT') {
        const text = prompt('Enter annotation text:', 'Dimension / Note');
        if (text) {
          setEntities(prev => [
            ...prev,
            { id: `cad_${Date.now()}`, type: 'TEXT', startX: coords.x, startY: coords.y, endX: coords.x, endY: coords.y, label: text },
          ]);
        }
        return;
      }
      setDrawingStart(coords);
    } else {
      if (previewEntity) {
        setEntities(prev => [
          ...prev,
          { ...previewEntity, id: `cad_${Date.now()}`, color: '#1a1a1a' },
        ]);
      }
      setDrawingStart(null);
      setPreviewEntity(null);
    }
  };

  const handleExportDxf = () => {
    let dxf = `0\nSECTION\n2\nENTITIES\n`;
    for (const ent of entities) {
      if (ent.type === 'LINE') {
        dxf += `0\nLINE\n8\nVISIBLE\n10\n${ent.startX}\n20\n${-ent.startY}\n30\n0.0\n11\n${ent.endX}\n21\n${-ent.endY}\n31\n0.0\n`;
      } else if (ent.type === 'CIRCLE' && ent.radius) {
        dxf += `0\nCIRCLE\n8\nVISIBLE\n10\n${ent.startX}\n20\n${-ent.startY}\n30\n0.0\n40\n${ent.radius}\n`;
      } else if (ent.type === 'RECTANGLE') {
        const x1 = ent.startX, y1 = -ent.startY, x2 = ent.endX, y2 = -ent.endY;
        dxf += `0\nLINE\n8\nVISIBLE\n10\n${x1}\n20\n${y1}\n30\n0.0\n11\n${x2}\n21\n${y1}\n31\n0.0\n`;
        dxf += `0\nLINE\n8\nVISIBLE\n10\n${x2}\n20\n${y1}\n30\n0.0\n11\n${x2}\n21\n${y2}\n31\n0.0\n`;
        dxf += `0\nLINE\n8\nVISIBLE\n10\n${x2}\n20\n${y2}\n30\n0.0\n11\n${x1}\n21\n${y2}\n31\n0.0\n`;
        dxf += `0\nLINE\n8\nVISIBLE\n10\n${x1}\n20\n${y2}\n30\n0.0\n11\n${x1}\n21\n${y1}\n31\n0.0\n`;
      }
    }
    dxf += `0\nENDSEC\n0\nEOF\n`;
    const blob = new Blob([dxf], { type: 'application/dxf;charset=utf-8' });
    saveAs(blob, `CAD_Drawing_${Date.now()}.dxf`);
  };

  const renderEntity = (ent: CadEntity, isPreview = false) => {
    const stroke = ent.color || '#1a1a1a';
    const strokeWidth = isPreview ? 1.5 : 1.2;
    const strokeDash = isPreview ? '4,2' : undefined;

    switch (ent.type) {
      case 'LINE':
        return (
          <line
            key={ent.id}
            x1={ent.startX} y1={ent.startY}
            x2={ent.endX} y2={ent.endY}
            stroke={stroke} strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        );
      case 'CIRCLE':
        return (
          <circle
            key={ent.id}
            cx={ent.startX} cy={ent.startY}
            r={ent.radius || 10}
            stroke={stroke} strokeWidth={strokeWidth}
            fill="none" strokeDasharray={strokeDash}
          />
        );
      case 'RECTANGLE': {
        const x = Math.min(ent.startX, ent.endX);
        const y = Math.min(ent.startY, ent.endY);
        const w = Math.abs(ent.endX - ent.startX);
        const h = Math.abs(ent.endY - ent.startY);
        return (
          <rect
            key={ent.id}
            x={x} y={y} width={w} height={h}
            stroke={stroke} strokeWidth={strokeWidth}
            fill="none" strokeDasharray={strokeDash}
          />
        );
      }
      case 'DIMENSION': {
        const mx = (ent.startX + ent.endX) / 2;
        const my = (ent.startY + ent.endY) / 2;
        return (
          <g key={ent.id}>
            <line x1={ent.startX} y1={ent.startY} x2={ent.endX} y2={ent.endY} stroke="#374151" strokeWidth={0.7} />
            <rect x={mx - 22} y={my - 8} width={44} height={14} fill="#ffffff" stroke="#cbd5e1" strokeWidth={0.5} />
            <text x={mx} y={my + 3} textAnchor="middle" fontSize={9} fill="#374151" fontFamily="Arial, sans-serif">
              {ent.label}
            </text>
          </g>
        );
      }
      case 'TEXT':
        return (
          <text
            key={ent.id}
            x={ent.startX} y={ent.startY}
            fontSize={11} fill="#1a1a1a" fontFamily="Arial, sans-serif" fontWeight="500"
          >
            {ent.label}
          </text>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
      {/* CAD Toolbar */}
      <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mr-2">Drafting Tools:</span>
          {[
            { id: 'SELECT', label: 'Select', icon: MousePointer },
            { id: 'LINE', label: 'Line', icon: Minus },
            { id: 'CIRCLE', label: 'Circle', icon: Circle },
            { id: 'RECT', label: 'Rectangle', icon: Square },
            { id: 'DIM', label: 'Dimension', icon: Ruler },
            { id: 'TEXT', label: 'Text Note', icon: Type },
          ].map(tool => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => { setActiveTool(tool.id as any); setDrawingStart(null); setPreviewEntity(null); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                  active ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title={tool.label}
              >
                <Icon size={14} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Snap & Ortho toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
              snapToGrid ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold' : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Snap to Grid (F9)"
          >
            <Magnet size={13} />
            <span>Snap {gridSize}mm</span>
          </button>

          <button
            onClick={() => setOrthoMode(!orthoMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
              orthoMode ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold' : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Ortho Mode (F8: Horizontal / Vertical Only)"
          >
            <Crosshair size={13} />
            <span>Ortho</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          <button
            onClick={() => setEntities([])}
            className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50"
            title="Clear Drawing"
          >
            <Trash2 size={15} />
          </button>

          <button
            onClick={handleExportDxf}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs"
          >
            <Download size={13} />
            <span>Export DXF</span>
          </button>
        </div>
      </div>

      {/* Main Drafting Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[#FAFAFA] flex items-center justify-center p-4">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="border border-slate-300 rounded shadow-sm bg-white"
          style={{ cursor: activeTool === 'SELECT' ? 'default' : 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
        >
          {/* Background Grid Pattern */}
          <defs>
            <pattern id="cadGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <rect width={gridSize} height={gridSize} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cadGrid)" />

          {/* Drawn Entities */}
          {entities.map(e => renderEntity(e, false))}

          {/* Live Preview Entity */}
          {previewEntity && renderEntity(previewEntity, true)}
        </svg>

        {/* Coordinate HUD */}
        <div className="absolute bottom-6 left-6 bg-slate-900/90 text-white px-3 py-1.5 rounded-md text-[11px] font-mono shadow-md flex items-center gap-3">
          <span>X: <strong>{cursorPos.x}</strong> mm</span>
          <span>Y: <strong>{cursorPos.y}</strong> mm</span>
          <span className="text-slate-400">| Objects: {entities.length}</span>
        </div>
      </div>
    </div>
  );
};
