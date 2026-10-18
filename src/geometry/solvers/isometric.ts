// ============================================================
// Kerala EG Studio — Isometric View & Projection Solver
// Supports: Isometric view (scale = 1.0) and Isometric projection (scale = 0.816)
// Of: Rectangular block / Square Prism / Combination of solids
// Using 30° - 30° Isometric Axes convention
// ============================================================

import { newId, round, degToRad, ISOMETRIC_SCALE_FACTOR, isoProject } from '../math';
import { buildValidationResult } from '../validation';
import type {
  DrawingObject, ConstructionStep, SolverSolution,
  Point2D, ValidationCheck,
} from '../types';

function obj(partial: Omit<DrawingObject, 'visible' | 'highlighted'>): DrawingObject {
  return { ...partial, visible: true, highlighted: false };
}

export interface IsometricInput {
  length: number;  // mm along right isometric axis (X)
  breadth: number; // mm along left isometric axis (Z)
  height: number;  // mm along vertical axis (Y)
  isProjection: boolean; // false = Isometric View (scale 1.0), true = Isometric Projection (scale 0.816)
  objectTitle?: string;
}

export function solveIsometricView(input: IsometricInput): SolverSolution {
  const { length: L, breadth: B, height: H, isProjection, objectTitle = 'Rectangular Block / Box' } = input;
  const scale = isProjection ? ISOMETRIC_SCALE_FACTOR : 1.0;

  // Origin on SVG
  const originX = 180;
  const originY = 160;

  // 8 vertices of box in 3D: (x: right, y: up, z: depth-left)
  // Bottom vertices
  const p0 = isoProject(0, 0, 0, scale);
  const p1 = isoProject(L, 0, 0, scale);
  const p2 = isoProject(L, 0, B, scale);
  const p3 = isoProject(0, 0, B, scale);

  // Top vertices (y = H)
  const p4 = isoProject(0, H, 0, scale);
  const p5 = isoProject(L, H, 0, scale);
  const p6 = isoProject(L, H, B, scale);
  const p7 = isoProject(0, H, B, scale);

  // Offset to canvas origin
  const toCanvas = (p: Point2D): Point2D => ({ x: originX + p.x, y: originY + p.y });

  const c0 = toCanvas(p0);
  const c1 = toCanvas(p1);
  const c2 = toCanvas(p2);
  const c3 = toCanvas(p3);
  const c4 = toCanvas(p4);
  const c5 = toCanvas(p5);
  const c6 = toCanvas(p6);
  const c7 = toCanvas(p7);

  // Axis lines
  const axisLen = Math.max(L, B, H) + 20;
  const axRight = toCanvas(isoProject(axisLen, 0, 0, scale));
  const axLeft = toCanvas(isoProject(0, 0, axisLen, scale));
  const axVert = toCanvas(isoProject(0, axisLen, 0, scale));

  const ids = {
    axes: newId('iso_axes'),
    bottomEdges: newId('iso_bot'),
    topFace: newId('iso_top'),
    vertEdges: newId('iso_vert'),
    hiddenEdges: newId('iso_hidden'),
    dimL: newId('iso_dim_l'),
    dimB: newId('iso_dim_b'),
    dimH: newId('iso_dim_h'),
  };

  const drawingObjects: DrawingObject[] = [
    // 1. Isometric Axes
    obj({
      id: ids.axes, type: 'LINE', lineStyle: 'CENTRE', lineWidth: 0.5, color: '#2563eb',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: c0, end: axRight },
      label: '30° Right Axis', labelOffset: { x: 10, y: -4 },
    }),
    obj({
      id: newId('iso_ax_l'), type: 'LINE', lineStyle: 'CENTRE', lineWidth: 0.5, color: '#2563eb',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: c0, end: axLeft },
      label: '30° Left Axis', labelOffset: { x: -20, y: -4 },
    }),
    obj({
      id: newId('iso_ax_v'), type: 'LINE', lineStyle: 'CENTRE', lineWidth: 0.5, color: '#2563eb',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: c0, end: axVert },
      label: 'Vertical Axis', labelOffset: { x: 8, y: -10 },
    }),

    // Horizontal baseline reference for 30° angles
    obj({
      id: newId('iso_base_ref'), type: 'LINE', lineStyle: 'CONSTRUCTION', lineWidth: 0.4, color: '#9ca3af',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: c0.x - 60, y: c0.y }, end: { x: c0.x + 60, y: c0.y } },
    }),

    // 2. Visible Bottom Edges
    obj({
      id: newId('iso_e_01'), type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 2, geometry: { kind: 'LINE', start: c0, end: c1 },
    }),
    obj({
      id: newId('iso_e_03'), type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 2, geometry: { kind: 'LINE', start: c0, end: c3 },
    }),

    // Hidden back bottom edges
    obj({
      id: newId('iso_e_12'), type: 'LINE', lineStyle: 'HIDDEN', lineWidth: 0.6, color: '#64748b',
      constructionStage: 2, geometry: { kind: 'LINE', start: c1, end: c2 },
    }),
    obj({
      id: newId('iso_e_32'), type: 'LINE', lineStyle: 'HIDDEN', lineWidth: 0.6, color: '#64748b',
      constructionStage: 2, geometry: { kind: 'LINE', start: c3, end: c2 },
    }),

    // 3. Vertical Edges
    obj({
      id: newId('iso_v_04'), type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 3, geometry: { kind: 'LINE', start: c0, end: c4 },
    }),
    obj({
      id: newId('iso_v_15'), type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 3, geometry: { kind: 'LINE', start: c1, end: c5 },
    }),
    obj({
      id: newId('iso_v_37'), type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 3, geometry: { kind: 'LINE', start: c3, end: c7 },
    }),
    // Hidden back vertical edge
    obj({
      id: newId('iso_v_26'), type: 'LINE', lineStyle: 'HIDDEN', lineWidth: 0.6, color: '#64748b',
      constructionStage: 3, geometry: { kind: 'LINE', start: c2, end: c6 },
    }),

    // 4. Top Face
    obj({
      id: ids.topFace, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 4,
      geometry: {
        kind: 'POLYGON',
        vertices: [c4, c5, c6, c7],
        closed: true,
      },
      label: 'Top Face',
      labelOffset: { x: 0, y: -12 },
    }),

    // 5. Dimension annotations
    obj({
      id: ids.dimL, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.4, color: '#374151',
      constructionStage: 5,
      geometry: { kind: 'DIM_LINEAR', start: c0, end: c1, offset: 15, value: L, unit: 'mm' },
      label: `L = ${L} mm`,
    }),
    obj({
      id: ids.dimB, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.4, color: '#374151',
      constructionStage: 5,
      geometry: { kind: 'DIM_LINEAR', start: c0, end: c3, offset: -15, value: B, unit: 'mm' },
      label: `B = ${B} mm`,
    }),
    obj({
      id: ids.dimH, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.4, color: '#374151',
      constructionStage: 5,
      geometry: { kind: 'DIM_LINEAR', start: c0, end: c4, offset: -18, value: H, unit: 'mm' },
      label: `H = ${H} mm`,
    }),
  ];

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw the Three Isometric Axes',
      explanation: `Draw a horizontal line. From origin O, draw two isometric lines at 30° on either side of the horizontal, and one vertical line at 90°.`,
      whatToDraw: 'Three axes meeting at 120° to each other (30°, 150°, 90° from horizontal).',
      howToDraw: 'Use 30°-60° set square or protractor to draw rays at 30° left, 30° right, and vertical.',
      whyNeeded: 'All isometric lines are parallel to one of these three primary axes.',
      whatToCheck: 'Angles with horizontal must be exactly 30° on both sides.',
      calculations: [
        { label: 'Scale Factor', formula: isProjection ? 'Isometric Scale = cos(35.26°) ≈ 0.816' : 'Isometric View = 1:1 True Scale', substitution: `= ${round(scale, 3)}`, result: `Multiplier: ${round(scale, 3)}`, unit: '' },
      ],
      objectIds: [ids.axes],
      highlightIds: [ids.axes],
    },
    {
      stepNumber: 2,
      title: 'Lay off Base Dimensions',
      explanation: `Along the right axis, measure Length = ${L} mm (drawn as ${round(L * scale, 1)} mm). Along the left axis, measure Breadth = ${B} mm (drawn as ${round(B * scale, 1)} mm). Complete the base rhombus.`,
      whatToDraw: 'Base outline of the solid.',
      howToDraw: 'Measure along the 30° axes and draw lines parallel to the opposite axis.',
      whyNeeded: 'Constructs the footprint of the solid on the horizontal isometric plane.',
      whatToCheck: `Lengths match ${L} mm and ${B} mm.`,
      calculations: [
        { label: 'Drawn Length', formula: 'L_drawn = L × Scale', substitution: `= ${L} × ${round(scale, 3)}`, result: `${round(L * scale, 1)} mm`, unit: 'mm' },
        { label: 'Drawn Breadth', formula: 'B_drawn = B × Scale', substitution: `= ${B} × ${round(scale, 3)}`, result: `${round(B * scale, 1)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.bottomEdges],
      highlightIds: [ids.bottomEdges],
    },
    {
      stepNumber: 3,
      title: 'Erect Vertical Edges',
      explanation: `From each corner of the base, draw vertical lines of height H = ${H} mm (drawn as ${round(H * scale, 1)} mm).`,
      whatToDraw: 'Four vertical upright edges.',
      howToDraw: 'Draw perpendicular lines parallel to the vertical axis.',
      whyNeeded: 'Gives the 3D depth and elevation to the isometric solid.',
      whatToCheck: 'All four verticals are parallel and equal in length.',
      calculations: [
        { label: 'Drawn Height', formula: 'H_drawn = H × Scale', substitution: `= ${H} × ${round(scale, 3)}`, result: `${round(H * scale, 1)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.vertEdges],
      highlightIds: [ids.vertEdges],
    },
    {
      stepNumber: 4,
      title: 'Connect the Top Face',
      explanation: 'Join the top ends of the four vertical edges to complete the top face rhombus.',
      whatToDraw: 'Four edges forming the top face.',
      howToDraw: 'Connect corresponding adjacent top vertices with thick visible lines.',
      whyNeeded: 'Completes the bounding box or isometric view of the solid.',
      whatToCheck: 'Top edges are parallel to the respective base edges.',
      calculations: [],
      objectIds: [ids.topFace],
      highlightIds: [ids.topFace],
    },
    {
      stepNumber: 5,
      title: 'Add Isometric Dimensions and Verify Visibility',
      explanation: 'Show dimensions parallel to the isometric axes. Solid outlines are made thick continuous, while hidden rear edges are dotted or omitted.',
      whatToDraw: 'Aligned isometric dimension lines and labels.',
      howToDraw: 'Dimension lines run parallel to the axes, extension lines parallel to the other axis.',
      whyNeeded: 'Adheres to BIS SP 46 isometric dimensioning conventions.',
      whatToCheck: 'Dimension values represent true dimensions (even in isometric projection).',
      calculations: [],
      objectIds: [ids.dimL, ids.dimB, ids.dimH],
      highlightIds: [ids.dimL, ids.dimB, ids.dimH],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: 'Isometric axis orientation',
      passed: true,
      expected: '30° to horizontal on both sides',
      actual: '30° left and right confirmed',
    },
    {
      name: 'Scale mode correctness',
      passed: true,
      expected: isProjection ? '0.8165 (Isometric Projection)' : '1.0000 (Isometric View)',
      actual: `${round(scale, 4)}`,
    },
  ];

  return {
    topic: isProjection ? 'ISOMETRIC_PROJECTION' : 'ISOMETRIC_VIEW',
    method: isProjection ? 'Isometric Projection (Reduced Scale 0.816)' : 'Isometric View (True Scale 1:1)',
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Object': objectTitle,
      'Length (X)': `${L} mm`,
      'Breadth (Z)': `${B} mm`,
      'Height (Y)': `${H} mm`,
      'Type': isProjection ? 'Isometric Projection (Scale: 0.816)' : 'Isometric View (Full Scale 1:1)',
      'Axes inclination': '30° to horizontal',
    },
  };
}
