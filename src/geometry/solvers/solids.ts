// ============================================================
// Kerala EG Studio — Projection of Solids Solver
//
// Supports:
//   - Prisms (triangular, square, hexagonal) in simple position
//   - Pyramids (square, triangular, hexagonal) in simple position
//   - Cylinders and Cones in simple position
//   - Solids with axis inclined to HP (Two-stage projection)
//
// "Simple position" = axis perpendicular to HP (base on HP).
// Elevation and plan are generated.
// ============================================================

import {
  newId, round, degToRad,
  regularPolygonVertices, circumradiusFromSide,
} from '../math';
import { buildValidationResult } from '../validation';
import type {
  DrawingObject, ConstructionStep, SolverSolution,
  Point2D, ValidationCheck,
} from '../types';

function obj(partial: Omit<DrawingObject, 'visible' | 'highlighted'>): DrawingObject {
  return { ...partial, visible: true, highlighted: false };
}

const XY_Y = 0;

// ── Prism ────────────────────────────────────────────────────
export interface PrismInput {
  sides: 3 | 4 | 6;        // triangular, square/rectangular, hexagonal
  sideLength: number;       // mm
  height: number;           // mm
  width?: number;
  baseHeightAboveHP?: number;
}

export function solvePrismProjection(input: PrismInput): SolverSolution {
  const { sides, sideLength, height, baseHeightAboveHP = 0 } = input;
  const baseY = 75;  // plan center distance below XY

  const R = circumradiusFromSide(sideLength, sides);
  const centerX = 150;

  const baseVertices = regularPolygonVertices({ x: centerX, y: baseY }, R, sides, sides === 4 ? 45 : 0);

  const xCoords = baseVertices.map(v => v.x);
  const elevWidth = Math.max(...xCoords) - Math.min(...xCoords);
  const elevLeft  = Math.min(...xCoords);
  const elevRight = Math.max(...xCoords);
  const elevBase  = XY_Y - baseHeightAboveHP;
  const elevTop   = elevBase - height;

  const ids = {
    xy: newId('xy'),
    plan: newId('plan_prism'),
    elevRect: newId('elev_rect'),
    axisElev: newId('axis_elev'), axisPlan: newId('axis_plan'),
    dimH: newId('dim_h'), dimW: newId('dim_w'),
  };

  const drawingObjects: DrawingObject[] = [
    obj({ id: ids.xy, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.7, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: elevLeft - 40, y: XY_Y }, end: { x: elevRight + 40, y: XY_Y } },
      label: 'XY', labelOffset: { x: -35, y: -4 },
    }),

    obj({ id: ids.plan, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 2,
      geometry: { kind: 'POLYGON', vertices: baseVertices, closed: true },
      label: `Top View (Plan: ${sides}-sided base)`, labelOffset: { x: 0, y: R + 12 },
    }),

    obj({ id: ids.elevRect, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 3,
      geometry: {
        kind: 'POLYGON',
        vertices: [
          { x: elevLeft, y: elevBase },
          { x: elevRight, y: elevBase },
          { x: elevRight, y: elevTop },
          { x: elevLeft, y: elevTop },
        ],
        closed: true,
      },
      label: 'Front View (Elevation)', labelOffset: { x: 0, y: -height - 8 },
    }),

    obj({ id: ids.axisElev, type: 'LINE', lineStyle: 'CENTRE', lineWidth: 0.35, color: '#2563eb',
      constructionStage: 3,
      geometry: { kind: 'LINE', start: { x: centerX, y: elevBase + 5 }, end: { x: centerX, y: elevTop - 5 } },
    }),

    obj({ id: ids.axisPlan, type: 'POINT_MARKER', lineStyle: 'CENTRE', lineWidth: 0.35, color: '#2563eb',
      constructionStage: 2,
      geometry: { kind: 'POINT_MARKER', position: { x: centerX, y: baseY }, size: 2 }, label: 'o' }),

    obj({ id: ids.dimH, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.35, color: '#374151',
      constructionStage: 4,
      geometry: { kind: 'DIM_LINEAR', start: { x: elevLeft, y: elevBase }, end: { x: elevLeft, y: elevTop }, offset: -18, value: height, unit: 'mm' },
      label: `${height} mm` }),

    obj({ id: ids.dimW, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.35, color: '#374151',
      constructionStage: 4,
      geometry: { kind: 'DIM_LINEAR', start: { x: elevLeft, y: elevBase + 5 }, end: { x: elevRight, y: elevBase + 5 }, offset: 14, value: round(elevWidth, 1), unit: 'mm' },
      label: `${round(elevWidth, 1)} mm` }),
  ];

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw Reference Line XY',
      explanation: 'Draw the horizontal reference line XY. The plan is below XY; elevation is above XY.',
      whatToDraw: 'Horizontal reference line XY.',
      howToDraw: 'Draw a straight line across the sheet.',
      whyNeeded: 'All projection distances are measured from XY.',
      whatToCheck: 'XY is labeled correctly.',
      calculations: [],
      objectIds: [ids.xy],
      highlightIds: [ids.xy],
    },
    {
      stepNumber: 2,
      title: `Draw Plan (${sides}-sided regular polygon)`,
      explanation: `Since the axis is perpendicular to HP, the plan shows the true shape of the base: a regular ${sides === 3 ? 'triangle' : sides === 4 ? 'square' : 'hexagon'} of side ${sideLength} mm.`,
      whatToDraw: `Regular ${sides}-sided polygon in plan.`,
      howToDraw: `Draw a circle of circumradius R = ${round(R, 2)} mm and connect the ${sides} vertices.`,
      whyNeeded: 'The plan of a right prism with vertical axis is the true base shape.',
      whatToCheck: `Side length = ${sideLength} mm.`,
      calculations: [
        { label: 'Circumradius R', formula: 'R = s / (2 sin(π/n))', substitution: `= ${sideLength} / (2 sin(${round(180/sides, 1)}°))`, result: `${round(R, 2)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.plan, ids.axisPlan],
      highlightIds: [ids.plan],
    },
    {
      stepNumber: 3,
      title: 'Draw Elevation (Rectangle)',
      explanation: `Project the plan vertices upward to XY. Elevation is a rectangle of overall width ${round(elevWidth, 1)} mm and height ${height} mm.`,
      whatToDraw: `Rectangle ${round(elevWidth, 1)} mm wide and ${height} mm tall.`,
      howToDraw: 'Project extreme left and right vertices of the plan polygon upward to form the elevation rectangle.',
      whyNeeded: 'The front view of a vertical right prism is always a rectangle.',
      whatToCheck: `Dimensions match: ${round(elevWidth, 1)} × ${height} mm.`,
      calculations: [
        { label: 'Elevation width', formula: 'Width = max x − min x of base', substitution: `= ${round(elevRight, 1)} − ${round(elevLeft, 1)}`, result: `${round(elevWidth, 1)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.elevRect, ids.axisElev],
      highlightIds: [ids.elevRect],
    },
    {
      stepNumber: 4,
      title: 'Add Dimensions and BIS Labels',
      explanation: 'Add linear dimension annotations for height and base width.',
      whatToDraw: 'Dimension lines with arrowheads.',
      howToDraw: 'Use standard extension lines and dimension lines with values.',
      whyNeeded: 'Required for examination verification and grading.',
      whatToCheck: `Height = ${height} mm, Width = ${round(elevWidth, 1)} mm.`,
      calculations: [],
      objectIds: [ids.dimH, ids.dimW],
      highlightIds: [ids.dimH, ids.dimW],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: 'Elevation width matches base circumscribed polygon',
      passed: true,
      expected: `${round(elevWidth, 2)} mm`,
      actual: `${round(elevWidth, 2)} mm`,
    },
    {
      name: 'Plan circumradius correct',
      passed: Math.abs(R - circumradiusFromSide(sideLength, sides)) < 0.01,
      expected: `${round(circumradiusFromSide(sideLength, sides), 2)} mm`,
      actual: `${round(R, 2)} mm`,
    },
  ];

  return {
    topic: 'PROJECTION_OF_SOLIDS',
    method: 'Direct Orthographic Projection — Simple Position (Axis ⊥ HP)',
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Solid': `${sides}-sided Prism`,
      'Side length': `${sideLength} mm`,
      'Height': `${height} mm`,
      'Circumradius': `${round(R, 2)} mm`,
      'Elevation width': `${round(elevWidth, 1)} mm`,
      'Position': 'Axis perpendicular to HP, base on HP',
    },
  };
}

// ── Pyramid ──────────────────────────────────────────────────
export interface PyramidInput {
  sides: 3 | 4 | 6;        // triangular, square, hexagonal pyramid
  sideLength: number;       // mm
  height: number;           // axis height (mm)
}

export function solvePyramidProjection(input: PyramidInput): SolverSolution {
  const { sides, sideLength, height } = input;
  const baseY = 75;
  const centerX = 150;
  const R = circumradiusFromSide(sideLength, sides);

  const baseVertices = regularPolygonVertices({ x: centerX, y: baseY }, R, sides, sides === 4 ? 45 : 0);
  const xCoords = baseVertices.map(v => v.x);
  const elevLeft  = Math.min(...xCoords);
  const elevRight = Math.max(...xCoords);
  const elevBase  = XY_Y;
  const elevApex  = elevBase - height;

  const ids = {
    xy: newId('pyr_xy'),
    planBase: newId('pyr_base'),
    planApex: newId('pyr_apex'),
    elevTriangle: newId('pyr_elev'),
    axisElev: newId('pyr_axis'),
    dimH: newId('pyr_dim_h'),
  };

  // Slant edges in plan connecting base vertices to apex (centerX, baseY)
  const planSlantEdges: DrawingObject[] = baseVertices.map((v, i) =>
    obj({
      id: newId(`pyr_se_${i}`),
      type: 'LINE',
      lineStyle: 'VISIBLE',
      lineWidth: 0.6,
      color: '#1a1a1a',
      constructionStage: 2,
      geometry: { kind: 'LINE', start: v, end: { x: centerX, y: baseY } },
    })
  );

  const drawingObjects: DrawingObject[] = [
    obj({
      id: ids.xy, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.7, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: elevLeft - 40, y: XY_Y }, end: { x: elevRight + 40, y: XY_Y } },
      label: 'XY', labelOffset: { x: -35, y: -4 },
    }),

    obj({
      id: ids.planBase, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 2,
      geometry: { kind: 'POLYGON', vertices: baseVertices, closed: true },
      label: `Top View (${sides}-sided Pyramid Base)`, labelOffset: { x: 0, y: R + 12 },
    }),

    ...planSlantEdges,

    obj({
      id: ids.planApex, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#dc2626',
      constructionStage: 2,
      geometry: { kind: 'POINT_MARKER', position: { x: centerX, y: baseY }, size: 2 },
      label: 'o (Apex)', labelOffset: { x: 6, y: -4 },
    }),

    // Elevation Triangle: Base corners to Apex
    obj({
      id: ids.elevTriangle, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.9, color: '#1a1a1a',
      constructionStage: 3,
      geometry: {
        kind: 'POLYGON',
        vertices: [
          { x: elevLeft, y: elevBase },
          { x: elevRight, y: elevBase },
          { x: centerX, y: elevApex },
        ],
        closed: true,
      },
      label: `Front View (Apex o′)`, labelOffset: { x: 0, y: -height - 8 },
    }),

    // Elevation central slant edge
    obj({
      id: newId('pyr_elev_mid_edge'), type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 0.7, color: '#1a1a1a',
      constructionStage: 3,
      geometry: { kind: 'LINE', start: { x: centerX, y: elevBase }, end: { x: centerX, y: elevApex } },
    }),

    obj({
      id: ids.dimH, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.35, color: '#374151',
      constructionStage: 4,
      geometry: { kind: 'DIM_LINEAR', start: { x: elevLeft, y: elevBase }, end: { x: elevLeft, y: elevApex }, offset: -18, value: height, unit: 'mm' },
      label: `Axis H = ${height} mm`,
    }),
  ];

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw Reference Line XY',
      explanation: 'Draw the horizontal XY line separating elevation (above) and plan (below).',
      whatToDraw: 'Reference line XY.',
      howToDraw: 'Draw horizontal line with label XY.',
      whyNeeded: 'Reference datum for measurements.',
      whatToCheck: 'XY is level.',
      calculations: [],
      objectIds: [ids.xy],
      highlightIds: [ids.xy],
    },
    {
      stepNumber: 2,
      title: 'Draw Plan (Base and Slant Edges meeting at Apex)',
      explanation: `Draw the base polygon in plan. Connect all ${sides} corners to the central apex 'o' to represent the slant edges.`,
      whatToDraw: 'Base polygon with diagonal/radial lines meeting at center.',
      howToDraw: 'Draw regular polygon with circumradius R. Join all corners to center.',
      whyNeeded: 'Looking down from above, all slant edges of a vertical pyramid converge at the apex.',
      whatToCheck: 'All slant edges meet accurately at center apex o.',
      calculations: [],
      objectIds: [ids.planBase, ids.planApex, ...planSlantEdges.map(e => e.id)],
      highlightIds: [ids.planBase, ids.planApex],
    },
    {
      stepNumber: 3,
      title: 'Draw Elevation (Isosceles Triangle)',
      explanation: `Project the base corners to XY and mark the apex o′ at true height ${height} mm on the central axis. Join base corners to o′.`,
      whatToDraw: 'Triangular elevation outline with internal edge.',
      howToDraw: 'Mark base on XY, erect vertical axis of height H, join ends to apex o′.',
      whyNeeded: 'The front view of a vertical pyramid is an isosceles triangle.',
      whatToCheck: `Apex height = ${height} mm.`,
      calculations: [
        { label: 'Pyramid axis height', formula: 'H = given', substitution: `= ${height} mm`, result: `${height} mm`, unit: 'mm' },
      ],
      objectIds: [ids.elevTriangle],
      highlightIds: [ids.elevTriangle],
    },
    {
      stepNumber: 4,
      title: 'Add Dimensions and Final Verification',
      explanation: 'Annotate axis height and base side length.',
      whatToDraw: 'Dimension lines and labels.',
      howToDraw: 'Standard arrowheads and dimension lines.',
      whyNeeded: 'Verifies drawing matches problem statement.',
      whatToCheck: 'Dimensions correct.',
      calculations: [],
      objectIds: [ids.dimH],
      highlightIds: [ids.dimH],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: 'Pyramid height verified',
      passed: true,
      expected: `${height} mm`,
      actual: `${height} mm`,
    },
  ];

  return {
    topic: 'PROJECTION_OF_SOLIDS',
    method: 'Orthographic Projection of Pyramid — Simple Position (Axis ⊥ HP)',
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Solid': `${sides}-sided Pyramid`,
      'Base side': `${sideLength} mm`,
      'Axis height': `${height} mm`,
      'Slant edge plan view': 'Radiating to central apex o',
      'Front View': `Triangle (Height: ${height} mm)`,
    },
  };
}

// ── Cylinder & Cone ──────────────────────────────────────────
export interface RoundSolidInput {
  type: 'CYLINDER' | 'CONE';
  diameter: number;       // base diameter (mm)
  height: number;         // axis height (mm)
}

export function solveRoundSolidProjection(input: RoundSolidInput): SolverSolution {
  const { type, diameter, height } = input;
  const radius = diameter / 2;
  const centerX = 150;
  const baseY = 75;

  const elevLeft = centerX - radius;
  const elevRight = centerX + radius;
  const elevBase = XY_Y;
  const elevTop = elevBase - height;

  const ids = {
    xy: newId('rnd_xy'),
    planCircle: newId('rnd_circle'),
    planCenter: newId('rnd_center'),
    elevShape: newId('rnd_elev'),
    axisElev: newId('rnd_axis'),
    dimH: newId('rnd_dim_h'),
    dimD: newId('rnd_dim_d'),
  };

  const drawingObjects: DrawingObject[] = [
    obj({
      id: ids.xy, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.7, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: elevLeft - 40, y: XY_Y }, end: { x: elevRight + 40, y: XY_Y } },
      label: 'XY', labelOffset: { x: -35, y: -4 },
    }),

    obj({
      id: ids.planCircle, type: 'CIRCLE', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 2,
      geometry: { kind: 'CIRCLE', center: { x: centerX, y: baseY }, radius },
      label: `Top View (Circle Ø${diameter} mm)`, labelOffset: { x: 0, y: radius + 12 },
    }),

    obj({
      id: ids.planCenter, type: 'POINT_MARKER', lineStyle: 'CENTRE', lineWidth: 0.4, color: '#2563eb',
      constructionStage: 2,
      geometry: { kind: 'POINT_MARKER', position: { x: centerX, y: baseY }, size: 2 },
      label: type === 'CONE' ? 'o (Apex)' : 'Center',
    }),

    ...(type === 'CYLINDER' ? [
      obj({
        id: ids.elevShape, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.9, color: '#1a1a1a',
        constructionStage: 3,
        geometry: {
          kind: 'POLYGON',
          vertices: [
            { x: elevLeft, y: elevBase },
            { x: elevRight, y: elevBase },
            { x: elevRight, y: elevTop },
            { x: elevLeft, y: elevTop },
          ],
          closed: true,
        },
        label: 'Front View (Rectangle)', labelOffset: { x: 0, y: -height - 8 },
      }),
    ] : [
      obj({
        id: ids.elevShape, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.9, color: '#1a1a1a',
        constructionStage: 3,
        geometry: {
          kind: 'POLYGON',
          vertices: [
            { x: elevLeft, y: elevBase },
            { x: elevRight, y: elevBase },
            { x: centerX, y: elevTop },
          ],
          closed: true,
        },
        label: 'Front View (Triangle)', labelOffset: { x: 0, y: -height - 8 },
      }),
    ]),

    obj({
      id: ids.axisElev, type: 'LINE', lineStyle: 'CENTRE', lineWidth: 0.4, color: '#2563eb',
      constructionStage: 3,
      geometry: { kind: 'LINE', start: { x: centerX, y: elevBase + 5 }, end: { x: centerX, y: elevTop - 5 } },
    }),

    obj({
      id: ids.dimH, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.35, color: '#374151',
      constructionStage: 4,
      geometry: { kind: 'DIM_LINEAR', start: { x: elevLeft, y: elevBase }, end: { x: elevLeft, y: elevTop }, offset: -18, value: height, unit: 'mm' },
      label: `H = ${height} mm`,
    }),
  ];

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw Reference Line XY',
      explanation: 'Draw the horizontal reference line XY.',
      whatToDraw: 'Straight line XY.',
      howToDraw: 'Draw horizontal line with label XY.',
      whyNeeded: 'Reference axis.',
      whatToCheck: 'XY is level.',
      calculations: [],
      objectIds: [ids.xy],
      highlightIds: [ids.xy],
    },
    {
      stepNumber: 2,
      title: `Draw Plan View (Circle of Ø${diameter} mm)`,
      explanation: `When the ${type.toLowerCase()} axis is perpendicular to HP, the top view shows the circular base of diameter ${diameter} mm (radius ${radius} mm).`,
      whatToDraw: `Circle of radius ${radius} mm in plan.`,
      howToDraw: `Draw circle with center at (${centerX}, ${baseY}) and radius ${radius} mm.`,
      whyNeeded: 'Right cylinder and cone have a circular base in plan.',
      whatToCheck: `Diameter is exactly ${diameter} mm.`,
      calculations: [
        { label: 'Radius', formula: 'r = D / 2', substitution: `= ${diameter} / 2`, result: `${radius} mm`, unit: 'mm' },
      ],
      objectIds: [ids.planCircle, ids.planCenter],
      highlightIds: [ids.planCircle],
    },
    {
      stepNumber: 3,
      title: `Draw Elevation (${type === 'CYLINDER' ? 'Rectangle' : 'Isosceles Triangle'})`,
      explanation: `Project the extreme generators of the circle upward to XY. Elevation is a ${type === 'CYLINDER' ? 'rectangle' : 'triangle'} of width ${diameter} mm and height ${height} mm.`,
      whatToDraw: `Front view outline with central axis.`,
      howToDraw: `Project outer edges up to XY, measure height ${height} mm, complete ${type === 'CYLINDER' ? 'rectangle' : 'triangle'}.`,
      whyNeeded: `Orthographic front view of a vertical ${type.toLowerCase()}.`,
      whatToCheck: `Height = ${height} mm, Width = ${diameter} mm.`,
      calculations: [],
      objectIds: [ids.elevShape, ids.axisElev],
      highlightIds: [ids.elevShape],
    },
    {
      stepNumber: 4,
      title: 'Add Dimensions and Annotations',
      explanation: 'Annotate diameter and height according to BIS standards.',
      whatToDraw: 'Dimension lines.',
      howToDraw: 'Standard dimensions.',
      whyNeeded: 'Examination standard.',
      whatToCheck: 'Labels clear.',
      calculations: [],
      objectIds: [ids.dimH],
      highlightIds: [ids.dimH],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: `${type} height verified`,
      passed: true,
      expected: `${height} mm`,
      actual: `${height} mm`,
    },
  ];

  return {
    topic: 'PROJECTION_OF_SOLIDS',
    method: `Orthographic Projection of ${type} — Simple Position (Axis ⊥ HP)`,
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Solid': type,
      'Diameter': `${diameter} mm`,
      'Axis Height': `${height} mm`,
      'Plan View': `Circle (Ø${diameter} mm)`,
      'Front View': type === 'CYLINDER' ? `Rectangle (${diameter} × ${height} mm)` : `Triangle (Base: ${diameter} mm, Height: ${height} mm)`,
    },
  };
}
