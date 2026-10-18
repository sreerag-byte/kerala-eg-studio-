// ============================================================
// Kerala EG Studio — SVG Drawing Canvas
// Renders DrawingObjects as precise SVG elements.
// Supports both Manual Hand-Drawing Sheet Style (BIS SP 46) and CAD Style.
// Handles zoom, pan, projection lines visibility, and step playback.
// ============================================================

import React, { useRef, useState, useCallback, useEffect } from 'react';
import type {
  DrawingObject, DrawingCanvasState,
  LineGeometry, CircleGeometry, ArcGeometry, PolygonGeometry,
  EllipseGeometry, PolylineGeometry, PointMarkerGeometry,
  TextGeometry, DimLinearGeometry, HatchingRegionGeometry,
} from '../../geometry/types';
import { ManualDraftingModal } from './ManualDraftingModal';
import { useAppStore } from '../../store/appStore';
import { PenTool, Laptop, Layers, BookOpen, Compass, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface DrawingCanvasProps {
  canvasState: DrawingCanvasState;
  onScaleChange?: (scale: number) => void;
  onPanChange?: (x: number, y: number) => void;
  width?: number;
  height?: number;
  /** Ref to SVG element for export */
  svgRef?: React.RefObject<SVGSVGElement>;
}

// ── Line style configuration for CAD vs Manual Sheet ─────────
const CAD_LINE_CONFIG: Record<string, { stroke: string; strokeWidth: number; dashArray?: string; opacity: number }> = {
  VISIBLE:       { stroke: '#0f172a', strokeWidth: 1.4, opacity: 1 },
  HIDDEN:        { stroke: '#475569', strokeWidth: 0.8, dashArray: '4,2.5', opacity: 0.85 },
  CONSTRUCTION:  { stroke: '#94a3b8', strokeWidth: 0.45, dashArray: '3,2', opacity: 0.65 },
  PROJECTION:    { stroke: '#0284c7', strokeWidth: 0.55, dashArray: '5,2.5', opacity: 0.85 },
  DIMENSION:     { stroke: '#334155', strokeWidth: 0.55, opacity: 0.95 },
  EXTENSION:     { stroke: '#64748b', strokeWidth: 0.45, opacity: 0.9 },
  CENTRE:        { stroke: '#2563eb', strokeWidth: 0.55, dashArray: '9,2,1.5,2', opacity: 0.85 },
  CUTTING_PLANE: { stroke: '#dc2626', strokeWidth: 1.3, dashArray: '10,3,2,3', opacity: 1 },
  HATCHING:      { stroke: '#475569', strokeWidth: 0.45, opacity: 0.7 },
  REFERENCE:     { stroke: '#1e293b', strokeWidth: 1.0, opacity: 1 },
};

// Realistic Graphite Pencil weights (BIS SP 46:2003 / IS 962)
const MANUAL_LINE_CONFIG: Record<string, { stroke: string; strokeWidth: number; dashArray?: string; opacity: number; pencilGrade: string }> = {
  VISIBLE:       { stroke: '#181e29', strokeWidth: 1.6, opacity: 1, pencilGrade: 'HB' },
  HIDDEN:        { stroke: '#334155', strokeWidth: 0.85, dashArray: '4,2', opacity: 0.85, pencilGrade: '2H' },
  CONSTRUCTION:  { stroke: '#8fa0af', strokeWidth: 0.45, dashArray: '3,2', opacity: 0.65, pencilGrade: '4H' },
  PROJECTION:    { stroke: '#64748b', strokeWidth: 0.5, dashArray: '5,2', opacity: 0.8, pencilGrade: '4H' },
  DIMENSION:     { stroke: '#334155', strokeWidth: 0.55, opacity: 0.9, pencilGrade: '2H' },
  EXTENSION:     { stroke: '#64748b', strokeWidth: 0.45, opacity: 0.85, pencilGrade: '2H' },
  CENTRE:        { stroke: '#1e40af', strokeWidth: 0.5, dashArray: '9,2,1.5,2', opacity: 0.85, pencilGrade: '3H' },
  CUTTING_PLANE: { stroke: '#991b1b', strokeWidth: 1.35, dashArray: '10,2.5,2,2.5', opacity: 1, pencilGrade: '2H/HB' },
  HATCHING:      { stroke: '#475569', strokeWidth: 0.45, opacity: 0.75, pencilGrade: '2H' },
  REFERENCE:     { stroke: '#1e293b', strokeWidth: 1.1, opacity: 1, pencilGrade: '2H' },
};

function getLineConfig(style: string, highlighted: boolean, isManual: boolean) {
  const table = isManual ? MANUAL_LINE_CONFIG : CAD_LINE_CONFIG;
  const cfg = table[style] ?? table.VISIBLE;
  if (highlighted) {
    return { ...cfg, stroke: '#2563eb', strokeWidth: cfg.strokeWidth * 2.2, opacity: 1 };
  }
  return cfg;
}

// ── Coordinate transform: drawing mm → SVG px ────────────────
function toSvg(x: number, y: number, scale: number, panX: number, panY: number, svgCX: number, svgCY: number): [number, number] {
  return [
    svgCX + (x * scale) + panX,
    svgCY + (y * scale) + panY,
  ];
}

// ── Individual geometry renderers ────────────────────────────
function RenderLine({ geo, cfg, scale, panX, panY, cx, cy, isProjection }: {
  geo: LineGeometry; cfg: ReturnType<typeof getLineConfig>;
  scale: number; panX: number; panY: number; cx: number; cy: number;
  isProjection?: boolean;
}) {
  const [x1, y1] = toSvg(geo.start.x, geo.start.y, scale, panX, panY, cx, cy);
  const [x2, y2] = toSvg(geo.end.x, geo.end.y, scale, panX, panY, cx, cy);
  return (
    <g className={isProjection ? 'projection-line-group' : undefined}>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={cfg.stroke} strokeWidth={cfg.strokeWidth}
        strokeDasharray={cfg.dashArray} opacity={cfg.opacity}
        strokeLinecap="round" />
      {/* For projection lines, add faint termination dots for visual alignment */}
      {isProjection && (
        <>
          <circle cx={x1} cy={y1} r={1.5} fill={cfg.stroke} opacity={0.6} />
          <circle cx={x2} cy={y2} r={1.5} fill={cfg.stroke} opacity={0.6} />
        </>
      )}
    </g>
  );
}

function RenderCircle({ geo, cfg, scale, panX, panY, cx, cy }: {
  geo: CircleGeometry; cfg: ReturnType<typeof getLineConfig>;
  scale: number; panX: number; panY: number; cx: number; cy: number;
}) {
  const [cx2, cy2] = toSvg(geo.center.x, geo.center.y, scale, panX, panY, cx, cy);
  return (
    <circle cx={cx2} cy={cy2} r={geo.radius * scale}
      stroke={cfg.stroke} strokeWidth={cfg.strokeWidth}
      fill="none" strokeDasharray={cfg.dashArray} opacity={cfg.opacity} />
  );
}

function RenderArc({ geo, cfg, scale, panX, panY, cx, cy }: {
  geo: ArcGeometry; cfg: ReturnType<typeof getLineConfig>;
  scale: number; panX: number; panY: number; cx: number; cy: number;
}) {
  const [cxS, cyS] = toSvg(geo.center.x, geo.center.y, scale, panX, panY, cx, cy);
  const r = geo.radius * scale;
  const startRad = (geo.startAngleDeg * Math.PI) / 180;
  const endRad = (geo.endAngleDeg * Math.PI) / 180;
  const x1 = cxS + r * Math.cos(startRad);
  const y1 = cyS - r * Math.sin(startRad); // SVG y-down
  const x2 = cxS + r * Math.cos(endRad);
  const y2 = cyS - r * Math.sin(endRad);
  const sweepAngle = geo.endAngleDeg - geo.startAngleDeg;
  const largeArcFlag = Math.abs(sweepAngle) > 180 ? 1 : 0;
  const sweepFlag = sweepAngle > 0 ? 0 : 1;
  const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
  return (
    <path d={d} stroke={cfg.stroke} strokeWidth={cfg.strokeWidth}
      fill="none" strokeDasharray={cfg.dashArray} opacity={cfg.opacity} />
  );
}

function RenderPolygon({ geo, cfg, scale, panX, panY, cx, cy, fillColor }: {
  geo: PolygonGeometry; cfg: ReturnType<typeof getLineConfig>; fillColor?: string;
  scale: number; panX: number; panY: number; cx: number; cy: number;
}) {
  const pts = geo.vertices.map(v => {
    const [sx, sy] = toSvg(v.x, v.y, scale, panX, panY, cx, cy);
    return `${sx},${sy}`;
  }).join(' ');
  return geo.closed
    ? <polygon points={pts} stroke={cfg.stroke} strokeWidth={cfg.strokeWidth}
        fill={fillColor ?? 'none'} strokeDasharray={cfg.dashArray} opacity={cfg.opacity} />
    : <polyline points={pts} stroke={cfg.stroke} strokeWidth={cfg.strokeWidth}
        fill="none" strokeDasharray={cfg.dashArray} opacity={cfg.opacity} />;
}

function RenderEllipse({ geo, cfg, scale, panX, panY, cx, cy }: {
  geo: EllipseGeometry; cfg: ReturnType<typeof getLineConfig>;
  scale: number; panX: number; panY: number; cx: number; cy: number;
}) {
  const [cx2, cy2] = toSvg(geo.center.x, geo.center.y, scale, panX, panY, cx, cy);
  const rx = geo.semiMajor * scale;
  const ry = geo.semiMinor * scale;
  return (
    <ellipse cx={cx2} cy={cy2} rx={rx} ry={ry}
      stroke={cfg.stroke} strokeWidth={cfg.strokeWidth}
      fill="none" strokeDasharray={cfg.dashArray} opacity={cfg.opacity}
      transform={`rotate(${geo.rotationDeg}, ${cx2}, ${cy2})`} />
  );
}

function RenderPointMarker({ geo, cfg, scale, panX, panY, cx, cy }: {
  geo: PointMarkerGeometry; cfg: ReturnType<typeof getLineConfig>;
  scale: number; panX: number; panY: number; cx: number; cy: number;
}) {
  const [px, py] = toSvg(geo.position.x, geo.position.y, scale, panX, panY, cx, cy);
  const r = (geo.size ?? 2.5) * (scale > 1.5 ? 1 : 1.2);
  return (
    <g>
      <circle cx={px} cy={py} r={r} fill={cfg.stroke} />
      <circle cx={px} cy={py} r={r + 1.5} stroke={cfg.stroke} strokeWidth={0.5} fill="none" opacity={0.5} />
    </g>
  );
}

function RenderText({ geo, scale, panX, panY, cx, cy }: {
  geo: TextGeometry; scale: number; panX: number; panY: number; cx: number; cy: number;
}) {
  const [tx, ty] = toSvg(geo.position.x, geo.position.y, scale, panX, panY, cx, cy);
  const anchor: 'start' | 'middle' | 'end' =
    geo.anchor === 'START' ? 'start' : geo.anchor === 'MIDDLE' ? 'middle' : geo.anchor === 'END' ? 'end' : 'start';
  return (
    <text x={tx} y={ty}
      fontSize={(geo.fontSize ?? 10) * Math.max(0.7, Math.min(1.4, scale * 0.5))}
      fontFamily="'JetBrains Mono', 'Fira Code', 'Segoe UI', Arial, sans-serif"
      fontWeight="600"
      fontStyle={geo.italic ? 'italic' : 'normal'}
      fill="#1e293b"
      textAnchor={anchor}>
      {geo.content}
    </text>
  );
}

function RenderDimLinear({ geo, scale, panX, panY, cx, cy }: {
  geo: DimLinearGeometry; scale: number; panX: number; panY: number; cx: number; cy: number;
}) {
  const [x1, y1] = toSvg(geo.start.x, geo.start.y, scale, panX, panY, cx, cy);
  const [x2, y2] = toSvg(geo.end.x, geo.end.y, scale, panX, panY, cx, cy);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  const nx = -dy / len;
  const ny = dx / len;
  const off = geo.offset * scale;
  const dx1 = x1 + nx * off;
  const dy1 = y1 + ny * off;
  const dx2 = x2 + nx * off;
  const dy2 = y2 + ny * off;
  const mx = (dx1 + dx2) / 2;
  const my = (dy1 + dy2) / 2;
  const aSize = 5;
  const ux = dx / len;
  const uy = dy / len;
  const displayVal = geo.value !== undefined ? geo.value : Math.hypot(geo.end.x - geo.start.x, geo.end.y - geo.start.y);

  return (
    <g className="dimension-linear">
      <line x1={x1} y1={y1} x2={dx1 + nx * 3} y2={dy1 + ny * 3} stroke="#64748b" strokeWidth={0.5} opacity={0.7} />
      <line x1={x2} y1={y2} x2={dx2 + nx * 3} y2={dy2 + ny * 3} stroke="#64748b" strokeWidth={0.5} opacity={0.7} />
      <line x1={dx1} y1={dy1} x2={dx2} y2={dy2} stroke="#334155" strokeWidth={0.6} />
      {/* 3:1 closed arrowheads */}
      <polygon
        points={`${dx1},${dy1} ${dx1 + ux * aSize * 2 - ny * (aSize * 0.7)},${dy1 + uy * aSize * 2 + nx * (aSize * 0.7)} ${dx1 + ux * aSize * 2 + ny * (aSize * 0.7)},${dy1 + uy * aSize * 2 - nx * (aSize * 0.7)}`}
        fill="#334155"
      />
      <polygon
        points={`${dx2},${dy2} ${dx2 - ux * aSize * 2 - ny * (aSize * 0.7)},${dy2 - uy * aSize * 2 + nx * (aSize * 0.7)} ${dx2 - ux * aSize * 2 + ny * (aSize * 0.7)},${dy2 - uy * aSize * 2 - nx * (aSize * 0.7)}`}
        fill="#334155"
      />
      <rect x={mx - 16} y={my - 7} width={32} height={14} fill="#ffffff" rx={2} opacity={0.9} />
      <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={10} fill="#1e293b" fontFamily="Arial, sans-serif" fontWeight="bold">
        {Math.round(displayVal)}
      </text>
    </g>
  );
}

function RenderHatching({ geo, scale, panX, panY, cx, cy }: {
  geo: HatchingRegionGeometry; scale: number; panX: number; panY: number; cx: number; cy: number;
}) {
  const pts = geo.vertices.map(v => {
    const [sx, sy] = toSvg(v.x, v.y, scale, panX, panY, cx, cy);
    return `${sx},${sy}`;
  }).join(' ');
  const patId = `hatch-${Math.round(geo.angleDeg || 45)}`;
  return (
    <g>
      <defs>
        <pattern id={patId} width="8" height="8" patternTransform={`rotate(${geo.angleDeg || 45})`} patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" strokeWidth="0.75" />
        </pattern>
      </defs>
      <polygon points={pts} fill={`url(#${patId})`} stroke="none" opacity={0.8} />
    </g>
  );
}

function RenderLabel({ obj, scale, panX, panY, cx, cy }: {
  obj: DrawingObject; scale: number; panX: number; panY: number; cx: number; cy: number;
}) {
  if (!obj.label) return null;
  const off = obj.labelOffset ?? { x: 5, y: -5 };
  let anchorPos: { x: number; y: number } | null = null;
  const geo = obj.geometry;

  if (geo.kind === 'POINT_MARKER') anchorPos = geo.position;
  else if (geo.kind === 'LINE') anchorPos = { x: (geo.start.x + geo.end.x) / 2, y: (geo.start.y + geo.end.y) / 2 };
  else if (geo.kind === 'CIRCLE') anchorPos = geo.center;
  else if (geo.kind === 'POLYGON' && geo.vertices.length > 0) anchorPos = geo.vertices[0];
  if (!anchorPos) return null;

  const [lx, ly] = toSvg(anchorPos.x + off.x, anchorPos.y + off.y, scale, panX, panY, cx, cy);
  return (
    <text x={lx} y={ly}
      fontSize={10.5} fontFamily="'JetBrains Mono', 'Segoe UI', Arial, sans-serif"
      fontWeight="700" fill="#0f172a"
      paintOrder="stroke" stroke="#ffffff" strokeWidth={2.5} strokeLinejoin="round"
      opacity={0.95}>
      {obj.label}
    </text>
  );
}

// ── Main DrawingCanvas component ─────────────────────────────
export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  canvasState, onScaleChange, onPanChange, width = 800, height = 600, svgRef: externalRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalRef ?? internalSvgRef;
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [containerSize, setContainerSize] = useState({ w: width, h: height });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });

  const {
    toggleProjectors,
    toggleConstructionLines,
    toggleDimensions,
    toggleDraftingStyle,
  } = useAppStore();

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const {
    objects, currentStep, viewport,
    showConstructionLines, showHiddenLines, showDimensions,
    showLabels, showProjectors = true, draftingStyle = 'MANUAL_SHEET',
  } = canvasState;

  const isManual = draftingStyle !== 'CAD';
  const { scale, panX, panY } = viewport;
  const cx = containerSize.w / 2;
  const cy = containerSize.h / 2;

  // Filter visible objects at current step
  const visibleObjects = objects.filter(obj => {
    if (!obj.visible) return false;
    if (currentStep > 0 && obj.constructionStage > currentStep) return false;
    if (!showProjectors && obj.lineStyle === 'PROJECTION') return false;
    if (!showConstructionLines && obj.lineStyle === 'CONSTRUCTION') return false;
    if (!showHiddenLines && obj.lineStyle === 'HIDDEN') return false;
    if (!showDimensions && (obj.lineStyle === 'DIMENSION' || obj.lineStyle === 'EXTENSION')) return false;
    return true;
  });

  // Highlight objects introduced in current step
  const currentStepIds = new Set(
    objects
      .filter(o => o.constructionStage === currentStep)
      .map(o => o.id)
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.max(0.2, Math.min(20, scale * factor));
    onScaleChange?.(newScale);
  }, [scale, onScaleChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, panX, panY });
  }, [panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    onPanChange?.(dragStart.panX + dx, dragStart.panY + dy);
  }, [isDragging, dragStart, onPanChange]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Render each drawing object
  const renderObject = (obj: DrawingObject) => {
    const isHighlighted = currentStepIds.has(obj.id);
    const cfg = getLineConfig(obj.lineStyle, isHighlighted, isManual);
    const geo = obj.geometry;
    const key = obj.id;
    const commonProps = { key, scale, panX, panY, cx, cy, cfg };

    let element: React.ReactNode = null;
    switch (geo.kind) {
      case 'LINE':
        element = <RenderLine geo={geo} isProjection={obj.lineStyle === 'PROJECTION'} {...commonProps} />;
        break;
      case 'CIRCLE': element = <RenderCircle geo={geo} {...commonProps} />; break;
      case 'ARC': element = <RenderArc geo={geo} {...commonProps} />; break;
      case 'POLYGON': element = <RenderPolygon geo={geo} fillColor={obj.fillColor} {...commonProps} />; break;
      case 'ELLIPSE': element = <RenderEllipse geo={geo} {...commonProps} />; break;
      case 'POLYLINE': element = <RenderPolygon geo={{ kind: 'POLYGON', vertices: geo.points, closed: false }} {...commonProps} />; break;
      case 'POINT_MARKER': element = <RenderPointMarker geo={geo} {...commonProps} />; break;
      case 'TEXT': element = <RenderText geo={geo} {...commonProps} />; break;
      case 'DIM_LINEAR': return (
        <React.Fragment key={key}>
          {showDimensions && <RenderDimLinear geo={geo} {...commonProps} />}
        </React.Fragment>
      );
      case 'HATCHING': element = <RenderHatching geo={geo} {...commonProps} />; break;
      default: return null;
    }

    return (
      <React.Fragment key={key}>
        {element}
        {showLabels && <RenderLabel obj={obj} scale={scale} panX={panX} panY={panY} cx={cx} cy={cy} />}
      </React.Fragment>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full drawing-canvas-container relative overflow-hidden transition-colors duration-300 ${
        isManual ? 'bg-[#FBF9F4]' : 'bg-white'
      }`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={() => {
        onScaleChange?.(2.0);
        onPanChange?.(0, 0);
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${containerSize.w} ${containerSize.h}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <filter id="active-step-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#3b82f6" floodOpacity="0.6" />
          </filter>
          <style>
            {`
              line, circle, path, polygon, polyline, ellipse {
                transition: stroke 0.25s ease, stroke-width 0.25s ease, opacity 0.3s ease-out;
              }
              .step-highlighted {
                filter: url(#active-step-glow);
                animation: pulse-step 2s infinite ease-in-out;
              }
              @keyframes pulse-step {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.85; }
              }
            `}
          </style>
        </defs>

        {/* Manual Drafting Sheet Border & Margins (BIS SP 46) */}
        {isManual && (
          <g id="drawing-sheet-border" pointerEvents="none">
            {/* Outer sheet edge */}
            <rect x="8" y="8" width={containerSize.w - 16} height={containerSize.h - 16}
              fill="none" stroke="#d5d0c4" strokeWidth="1" />
            {/* Drawing border: 20mm left margin, 10mm top/right/bottom */}
            <rect x="24" y="16" width={containerSize.w - 40} height={containerSize.h - 32}
              fill="none" stroke="#8c8275" strokeWidth="1.2" opacity="0.6" />
            
            {/* Authentic Kerala Engineering Title Block (bottom-right) */}
            <g transform={`translate(${containerSize.w - 230}, ${containerSize.h - 52})`}>
              <rect x="0" y="0" width="214" height="36" fill="#f5f1e8" stroke="#8c8275" strokeWidth="1" rx="2" />
              <text x="8" y="13" fontSize="9" fontWeight="bold" fill="#2d3748" fontFamily="Arial, sans-serif">
                KERALA EG STUDIO — TECHNICAL SHEET
              </text>
              <text x="8" y="27" fontSize="7.5" fill="#4a5568" fontFamily="Arial, sans-serif">
                BIS FIRST ANGLE PROJECTION • SCALE 1:1
              </text>
              {/* First-Angle Projection Symbol (Frustum + circles) */}
              <g transform="translate(182, 17) scale(0.65)">
                <polygon points="-12,-6 0,-10 0,10 -12,6" fill="none" stroke="#2d3748" strokeWidth="1.2" />
                <circle cx="12" cy="0" r="4.5" fill="none" stroke="#2d3748" strokeWidth="1.2" />
                <circle cx="12" cy="0" r="9" fill="none" stroke="#2d3748" strokeWidth="1.2" />
              </g>
            </g>
          </g>
        )}

        {/* Objects */}
        <g id="drawing-objects">
          {visibleObjects.map(renderObject)}
        </g>

        {/* Step progress watermark */}
        {currentStep > 0 && canvasState.totalSteps > 0 && (
          <text x={isManual ? containerSize.w - 238 : containerSize.w - 12} y={containerSize.h - 14}
            textAnchor="end" fontSize={10} fill="#94a3b8" fontFamily="Arial, sans-serif" fontWeight="bold">
            Step {currentStep} of {canvasState.totalSteps}
          </text>
        )}

        {/* Empty state */}
        {objects.length === 0 && (
          <g>
            <text x={cx} y={cy - 20} textAnchor="middle" fontSize={14} fill="#94a3b8" fontFamily="Arial, sans-serif">
              No drawing to display
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={11} fill="#cbd5e1" fontFamily="Arial, sans-serif">
              Solve a question to see the construction here
            </text>
          </g>
        )}
      </svg>

      {/* Floating Canvas Top Controls Toolbar */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/90 p-1.5 rounded-xl shadow-md z-10 text-xs">
        {/* Style mode toggle */}
        <button
          onClick={toggleDraftingStyle}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
            isManual
              ? 'bg-amber-100/80 text-amber-900 border border-amber-200 shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Switch between Hand-Drawing Sheet Style (4H/2H/HB) and Clean CAD Style"
        >
          {isManual ? <PenTool size={13} className="text-amber-800" /> : <Laptop size={13} />}
          <span>{isManual ? 'Sheet & Pencil Mode' : 'CAD Mode'}</span>
        </button>

        <span className="w-px h-4 bg-slate-200 mx-0.5" />

        {/* Projection lines toggle */}
        <button
          onClick={toggleProjectors}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition ${
            showProjectors
              ? 'bg-sky-50 text-sky-800 border border-sky-200'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
          title="Show or hide inter-view projection lines"
        >
          {showProjectors ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>Projectors</span>
        </button>

        {/* Construction lines toggle */}
        <button
          onClick={toggleConstructionLines}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition ${
            showConstructionLines
              ? 'bg-slate-100 text-slate-800 border border-slate-300'
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
          }`}
          title="Show or hide temporary construction lines"
        >
          <span>Construction</span>
        </button>

        {/* Dimensions toggle */}
        <button
          onClick={toggleDimensions}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition ${
            showDimensions
              ? 'bg-slate-100 text-slate-800 border border-slate-300'
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
          }`}
          title="Show or hide dimension markings"
        >
          <span>Dimensions</span>
        </button>

        <span className="w-px h-4 bg-slate-200 mx-0.5" />

        {/* Manual Drafting Guide button */}
        <button
          onClick={() => setIsGuideOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
          title="View step-by-step instructions for drawing manually on paper using mini-drafter and pencils"
        >
          <BookOpen size={13} />
          <span>Sheet Guide</span>
        </button>
      </div>

      {/* Floating Canvas Bottom Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-slate-200 px-2.5 py-1 rounded-lg text-xs shadow-xs z-10">
        <span className="font-mono text-slate-600 font-medium">{Math.round(scale * 100)}%</span>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => {
            onScaleChange?.(2.0);
            onPanChange?.(0, 0);
          }}
          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
          title="Double-click canvas to reset view"
        >
          <RotateCcw size={11} />
          <span>Reset View</span>
        </button>
      </div>

      {/* Manual Drafting Modal */}
      <ManualDraftingModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default DrawingCanvas;
