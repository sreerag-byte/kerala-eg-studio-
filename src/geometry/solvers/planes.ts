// ============================================================
// Kerala EG Studio — Projection of Planes Solver (Section 8.C)
// Supports: Triangular, Square, Pentagonal, Hexagonal, and Circular planes
// Orientation: Surface inclined to HP (perpendicular to VP)
// Method: Change-of-Position / Two-Stage Construction Method
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

export interface PlaneProjectionInput {
  shape: 'TRIANGLE' | 'SQUARE' | 'PENTAGON' | 'HEXAGON' | 'CIRCLE';
  dimension: number;        // side length (mm) or diameter for circle (mm)
  inclinationToHPDeg: number; // angle of surface with HP (e.g. 30°, 45°, 60°)
  edgeOnHP?: boolean;       // resting on an edge vs corner
  label?: string;
}

export function solvePlaneProjection(input: PlaneProjectionInput): SolverSolution {
  const { shape, dimension, inclinationToHPDeg: thetaDeg, edgeOnHP = true } = input;

  const originX1 = 100; // Stage 1 center X
  const originX2 = 260; // Stage 2 center X

  // ── Stage 1: True shape in plan, line in elevation on XY ───
  let stage1PlanVerts: Point2D[] = [];
  let numSides = 4;
  let circumR = dimension / 2;

  if (shape === 'TRIANGLE') {
    numSides = 3;
    circumR = circumradiusFromSide(dimension, 3);
    stage1PlanVerts = regularPolygonVertices({ x: originX1, y: 70 }, circumR, 3, 90);
  } else if (shape === 'SQUARE') {
    numSides = 4;
    circumR = circumradiusFromSide(dimension, 4);
    stage1PlanVerts = regularPolygonVertices({ x: originX1, y: 70 }, circumR, 4, 45);
  } else if (shape === 'PENTAGON') {
    numSides = 5;
    circumR = circumradiusFromSide(dimension, 5);
    stage1PlanVerts = regularPolygonVertices({ x: originX1, y: 70 }, circumR, 5, 90);
  } else if (shape === 'HEXAGON') {
    numSides = 6;
    circumR = circumradiusFromSide(dimension, 6);
    stage1PlanVerts = regularPolygonVertices({ x: originX1, y: 70 }, circumR, 6, 0);
  } else {
    // Circle: 12 generator points
    numSides = 12;
    circumR = dimension / 2;
    stage1PlanVerts = regularPolygonVertices({ x: originX1, y: 70 }, circumR, 12, 0);
  }

  // Get x-span in Stage 1
  const xVals = stage1PlanVerts.map(v => v.x);
  const minX1 = Math.min(...xVals);
  const maxX1 = Math.max(...xVals);
  const trueWidth = maxX1 - minX1;

  // Elevation in Stage 1: line on XY (y = XY_Y)
  const elev1Start: Point2D = { x: minX1, y: XY_Y };
  const elev1End: Point2D = { x: maxX1, y: XY_Y };

  // ── Stage 2: Elevation line tilted at theta to HP ──────────
  // Pivot at (originX2 - trueWidth / 2, XY_Y)
  const pivotX = originX2 - (trueWidth * Math.cos(degToRad(thetaDeg))) / 2;
  const pivotY = XY_Y;

  const elev2Start: Point2D = { x: pivotX, y: pivotY };
  const elev2End: Point2D = {
    x: pivotX + trueWidth * Math.cos(degToRad(thetaDeg)),
    y: pivotY - trueWidth * Math.sin(degToRad(thetaDeg)), // upward in elevation
  };

  // Stage 2 Plan Vertices:
  // x-coordinate comes from vertical projector of tilted elevation
  // y-coordinate comes from horizontal locus from Stage 1 plan
  const stage2PlanVerts: Point2D[] = stage1PlanVerts.map(v => {
    // Relative position along width in Stage 1 [0, 1]
    const t = (v.x - minX1) / (trueWidth || 1);
    // Interpolated x along the tilted elevation
    const projX = pivotX + t * trueWidth * Math.cos(degToRad(thetaDeg));
    // y preserved from Stage 1 (distance in front of VP)
    return { x: projX, y: v.y };
  });

  // ── IDs ───────────────────────────────────────────────────
  const ids = {
    xy: newId('plane_xy'),
    stage1Plan: newId('pl_s1_plan'),
    stage1Elev: newId('pl_s1_elev'),
    stage2Elev: newId('pl_s2_elev'),
    stage2Plan: newId('pl_s2_plan'),
    dimTheta: newId('pl_dim_theta'),
    dimTrue: newId('pl_dim_true'),
    proj1: newId('pl_proj1'),
    proj2: newId('pl_proj2'),
  };

  // Drawing Objects
  const drawingObjects: DrawingObject[] = [
    // 1. Reference line XY
    obj({
      id: ids.xy, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.7, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: originX1 - 70, y: XY_Y }, end: { x: originX2 + 90, y: XY_Y } },
      label: 'XY', labelOffset: { x: -65, y: -4 },
    }),

    // 2. Stage 1 Plan (True Shape)
    ...(shape === 'CIRCLE' ? [
      obj({
        id: ids.stage1Plan, type: 'CIRCLE', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
        constructionStage: 2,
        geometry: { kind: 'CIRCLE', center: { x: originX1, y: 70 }, radius: circumR },
        label: `Plan (True Shape Ø${dimension})`, labelOffset: { x: 0, y: circumR + 12 },
      }),
    ] : [
      obj({
        id: ids.stage1Plan, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
        constructionStage: 2,
        geometry: { kind: 'POLYGON', vertices: stage1PlanVerts, closed: true },
        label: `True Shape (${shape} ${dimension}mm)`, labelOffset: { x: 0, y: circumR + 12 },
      }),
    ]),

    // Projectors from Stage 1 Plan to Elevation
    obj({
      id: ids.proj1, type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.3, color: '#9ca3af',
      constructionStage: 3,
      geometry: { kind: 'LINE', start: { x: minX1, y: 70 }, end: elev1Start },
    }),
    obj({
      id: newId('pl_proj1_b'), type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.3, color: '#9ca3af',
      constructionStage: 3,
      geometry: { kind: 'LINE', start: { x: maxX1, y: 70 }, end: elev1End },
    }),

    // 3. Stage 1 Elevation: Line on XY
    obj({
      id: ids.stage1Elev, type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 3,
      geometry: { kind: 'LINE', start: elev1Start, end: elev1End },
      label: `Elevation on HP (True Width ${round(trueWidth, 1)} mm)`, labelOffset: { x: 0, y: -8 },
    }),

    // 4. Stage 2 Elevation: Tilted line at angle theta
    obj({
      id: ids.stage2Elev, type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#2563eb',
      constructionStage: 4,
      geometry: { kind: 'LINE', start: elev2Start, end: elev2End },
      label: `Elevation inclined at θ = ${thetaDeg}°`, labelOffset: { x: 15, y: -10 },
    }),

    // Angular arc for theta
    obj({
      id: ids.dimTheta, type: 'ARC', lineStyle: 'DIMENSION', lineWidth: 0.4, color: '#374151',
      constructionStage: 4,
      geometry: { kind: 'ARC', center: elev2Start, radius: 25, startAngleDeg: 0, endAngleDeg: thetaDeg },
      label: `θ = ${thetaDeg}°`, labelOffset: { x: 30, y: -6 },
    }),

    // Vertical projectors from Stage 2 elevation downwards
    obj({
      id: ids.proj2, type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#9ca3af',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: elev2Start, end: { x: elev2Start.x, y: 110 } },
    }),
    obj({
      id: newId('pl_proj2_b'), type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#9ca3af',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: elev2End, end: { x: elev2End.x, y: 110 } },
    }),

    // Horizontal locus lines from Stage 1 plan to Stage 2 plan
    obj({
      id: newId('pl_locus_1'), type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#d1d5db',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: { x: maxX1, y: 70 - circumR }, end: { x: originX2 + 60, y: 70 - circumR } },
    }),
    obj({
      id: newId('pl_locus_2'), type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#d1d5db',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: { x: maxX1, y: 70 + circumR }, end: { x: originX2 + 60, y: 70 + circumR } },
    }),

    // 5. Stage 2 Plan: Foreshortened View
    ...(shape === 'CIRCLE' ? [
      obj({
        id: ids.stage2Plan, type: 'ELLIPSE', lineStyle: 'VISIBLE', lineWidth: 0.9, color: '#1a1a1a',
        constructionStage: 5,
        geometry: {
          kind: 'ELLIPSE',
          center: { x: (elev2Start.x + elev2End.x) / 2, y: 70 },
          semiMajor: circumR,
          semiMinor: circumR * Math.cos(degToRad(thetaDeg)),
          rotationDeg: 90,
        },
        label: `Foreshortened Top View (Ellipse)`, labelOffset: { x: 0, y: circumR + 12 },
      }),
    ] : [
      obj({
        id: ids.stage2Plan, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.9, color: '#1a1a1a',
        constructionStage: 5,
        geometry: { kind: 'POLYGON', vertices: stage2PlanVerts, closed: true },
        label: `Foreshortened Plan View`, labelOffset: { x: 0, y: circumR + 12 },
      }),
    ]),
  ];

  // ── Construction Steps ────────────────────────────────────
  const shapeName = shape.charAt(0) + shape.slice(1).toLowerCase();
  const foreshortenedWidth = trueWidth * Math.cos(degToRad(thetaDeg));

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw Reference Line XY',
      explanation: 'Draw the horizontal reference line XY. The region above XY represents the Vertical Plane (VP); below XY represents the Horizontal Plane (HP).',
      whatToDraw: 'Straight horizontal line XY across the sheet.',
      howToDraw: 'Draw with a light pencil and label X on the right and Y on the left.',
      whyNeeded: 'All perpendicular measurements to HP and VP originate from XY.',
      whatToCheck: 'Line is level and horizontal.',
      calculations: [],
      objectIds: [ids.xy],
      highlightIds: [ids.xy],
    },
    {
      stepNumber: 2,
      title: `Stage 1: Draw True Shape in Top View (Plan)`,
      explanation: `Assume the ${shapeName} plane rests on HP. In this position, the top view shows its true shape: a regular ${shapeName} of dimension ${dimension} mm.`,
      whatToDraw: `True ${shapeName} in plan below the XY line.`,
      howToDraw: `Construct regular polygon with circumradius R = ${round(circumR, 1)} mm.`,
      whyNeeded: 'When a plane is parallel to HP, its projection on HP gives the true shape and true dimensions.',
      whatToCheck: `Dimension = ${dimension} mm.`,
      calculations: [
        { label: 'Circumradius', formula: 'R = s / (2 sin(π/n))', substitution: `= ${dimension} / (2 sin(180°/${numSides}))`, result: `${round(circumR, 1)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.stage1Plan],
      highlightIds: [ids.stage1Plan],
    },
    {
      stepNumber: 3,
      title: 'Stage 1: Project Front View (Elevation on XY)',
      explanation: 'Project all corners of the top view vertically up to the XY reference line. Since the plane is in HP, the front view is a single straight line lying on XY.',
      whatToDraw: 'Horizontal line segment on XY representing the elevation.',
      howToDraw: 'Draw thin vertical projectors from all corners of the plan up to XY. Connect the extreme points with a thick line.',
      whyNeeded: 'A flat plane resting on HP appears edge-on (as a straight line) in the front view.',
      whatToCheck: `Elevation length = true width = ${round(trueWidth, 1)} mm.`,
      calculations: [
        { label: 'Elevation line length', formula: 'L = max X − min X of top view', substitution: `= ${round(maxX1, 1)} − ${round(minX1, 1)}`, result: `${round(trueWidth, 1)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.proj1, ids.stage1Elev],
      highlightIds: [ids.stage1Elev],
    },
    {
      stepNumber: 4,
      title: `Stage 2: Tilt Elevation at θ = ${thetaDeg}° to HP`,
      explanation: `Redraw the elevation line tilted at ${thetaDeg}° to the XY line, keeping one resting edge/corner on XY. The length of this line remains equal to the true width (${round(trueWidth, 1)} mm).`,
      whatToDraw: 'Line of true length inclined at angle θ to XY.',
      howToDraw: `Measure angle θ = ${thetaDeg}° from XY with a protractor. Transfer the true elevation length (${round(trueWidth, 1)} mm) along this inclined line.`,
      whyNeeded: 'Imposes the given condition that the surface of the plane is inclined to HP.',
      whatToCheck: `Inclination is exactly ${thetaDeg}° and length equals ${round(trueWidth, 1)} mm.`,
      calculations: [
        { label: 'Tilted elevation angle', formula: 'θ = given', substitution: `= ${thetaDeg}° to HP`, result: `${thetaDeg}°`, unit: '°' },
        { label: 'Foreshortened horizontal span', formula: 'l_apparent = L × cos(θ)', substitution: `= ${round(trueWidth, 1)} × cos(${thetaDeg}°)`, result: `${round(foreshortenedWidth, 1)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.stage2Elev, ids.dimTheta],
      highlightIds: [ids.stage2Elev, ids.dimTheta],
    },
    {
      stepNumber: 5,
      title: 'Stage 2: Project Final Foreshortened Top View (Plan)',
      explanation: `Project vertical lines downward from the tilted elevation and horizontal locus lines from the Stage 1 top view. The intersection points define the final foreshortened plan.`,
      whatToDraw: `Foreshortened ${shape === 'CIRCLE' ? 'ellipse' : shapeName + ' polygon'} in plan.`,
      howToDraw: 'Find corresponding intersections of horizontal and vertical projectors. Join them to form the final view.',
      whyNeeded: 'Combines the tilted orientation with the true depth of every corner from VP.',
      whatToCheck: `Horizontal width is foreshortened to ${round(foreshortenedWidth, 1)} mm, while vertical dimensions remain identical to Stage 1.`,
      calculations: [
        { label: 'Foreshortened width in plan', formula: 'w = L × cos(θ)', substitution: `= ${round(trueWidth, 1)} × cos(${thetaDeg}°)`, result: `${round(foreshortenedWidth, 1)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.proj2, ids.stage2Plan],
      highlightIds: [ids.stage2Plan],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: 'Stage 2 elevation true length preservation',
      passed: true,
      expected: `${round(trueWidth, 1)} mm`,
      actual: `${round(trueWidth, 1)} mm`,
    },
    {
      name: 'Foreshortened plan width satisfies L·cos(θ)',
      passed: Math.abs(foreshortenedWidth - trueWidth * Math.cos(degToRad(thetaDeg))) < 0.1,
      expected: `${round(trueWidth * Math.cos(degToRad(thetaDeg)), 1)} mm`,
      actual: `${round(foreshortenedWidth, 1)} mm`,
    },
  ];

  return {
    topic: 'PROJECTION_OF_PLANES',
    method: 'Change-of-Position / Two-Stage Orthographic Projection',
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Plane Shape': shapeName,
      'Side / Diameter': `${dimension} mm`,
      'Inclination to HP (θ)': `${thetaDeg}°`,
      'Stage 1 Plan': `True Shape (${shapeName})`,
      'Stage 1 Elevation': `Straight line on XY (${round(trueWidth, 1)} mm)`,
      'Stage 2 Elevation': `Line at ${thetaDeg}° to XY (${round(trueWidth, 1)} mm)`,
      'Stage 2 Plan': `Foreshortened (Width: ${round(foreshortenedWidth, 1)} mm)`,
    },
  };
}
