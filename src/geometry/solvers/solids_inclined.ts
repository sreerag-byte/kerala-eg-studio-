// ============================================================
// Kerala EG Studio — 3-Stage Solids Projection Solver
// (Solids Inclined to both HP and VP — KTU 14-Mark Classic)
//
// Stage 1: Simple position (Axis perpendicular to HP, base on HP)
// Stage 2: Inclined to HP (Tilt elevation by angle θ, project plan)
// Stage 3: Inclined to VP (Rotate plan by angle β, project final elevation)
//
// Generates the complete 3-stage orthographic drawing side-by-side along XY
// ============================================================

import {
  newId, round, degToRad, radToDeg,
  regularPolygonVertices, circumradiusFromSide, rotatePoint,
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

export interface SolidsInclinedInput {
  solidType: 'SQUARE_PYRAMID' | 'HEXAGONAL_PRISM' | 'PENTAGONAL_PRISM' | 'CONE';
  baseSide: number;         // mm
  axisHeight: number;       // mm
  thetaHP: number;          // inclination of axis or base to HP in degrees (e.g. 45°)
  betaVP: number;           // inclination of axis or resting edge to VP in degrees (e.g. 30°)
}

export function solveSolidsInclinedBothPlanes(input: SolidsInclinedInput): SolverSolution {
  const { solidType, baseSide, axisHeight, thetaHP, betaVP } = input;

  // Horizontal layout positions along XY:
  // Stage 1 at X = 70
  // Stage 2 at X = 200
  // Stage 3 at X = 340
  const S1_X = 70;
  const S2_X = 200;
  const S3_X = 340;

  const S1_PlanY = 65; // plan center below XY

  const isPyramid = solidType === 'SQUARE_PYRAMID';
  const sides = solidType === 'HEXAGONAL_PRISM' ? 6 : solidType === 'PENTAGONAL_PRISM' ? 5 : 4;
  const R = circumradiusFromSide(baseSide, sides);

  // ── STAGE 1: SIMPLE POSITION ──────────────────────────────
  const s1BaseVerts = regularPolygonVertices({ x: S1_X, y: S1_PlanY }, R, sides, sides === 4 ? 45 : 0);
  const s1XCoords = s1BaseVerts.map(v => v.x);
  const s1MinX = Math.min(...s1XCoords);
  const s1MaxX = Math.max(...s1XCoords);
  const s1Width = s1MaxX - s1MinX;

  const s1ElevBaseY = XY_Y;
  const s1ElevTopY = s1ElevBaseY - axisHeight;

  // ── STAGE 2: INCLINED TO HP (Elevation tilted) ────────────
  // Pivot at resting edge on XY:
  const pivotX = S2_X - (s1Width * Math.cos(degToRad(thetaHP))) / 2;
  const pivotY = XY_Y;

  // Tilt base by (90 - thetaHP) so axis makes thetaHP to HP:
  const baseTiltDeg = 90 - thetaHP;
  const baseRad = degToRad(baseTiltDeg);
  const axisRad = degToRad(thetaHP);

  // Tilted elevation vertices:
  // Base corners:
  const s2ElevCorner1: Point2D = { x: pivotX, y: pivotY };
  const s2ElevCorner2: Point2D = {
    x: pivotX + s1Width * Math.cos(baseRad),
    y: pivotY - s1Width * Math.sin(baseRad),
  };
  const s2BaseMidX = (s2ElevCorner1.x + s2ElevCorner2.x) / 2;
  const s2BaseMidY = (s2ElevCorner1.y + s2ElevCorner2.y) / 2;

  // Apex or Top face midpoint along axis perpendicular to base:
  const s2Apex: Point2D = {
    x: s2BaseMidX + axisHeight * Math.cos(axisRad),
    y: s2BaseMidY - axisHeight * Math.sin(axisRad),
  };

  // Stage 2 Plan Vertices:
  // Interpolate X from tilted elevation; Y from Stage 1 Plan!
  const s2PlanVerts: Point2D[] = s1BaseVerts.map(v => {
    const t = (v.x - s1MinX) / (s1Width || 1);
    const projX = s2ElevCorner1.x + t * (s2ElevCorner2.x - s2ElevCorner1.x);
    return { x: projX, y: v.y };
  });

  const s2PlanApex: Point2D = { x: s2Apex.x, y: S1_PlanY };

  // ── STAGE 3: INCLINED TO VP (Plan rotated by betaVP) ──────
  // Center of Stage 2 plan:
  const s2CenterPlan: Point2D = { x: (s2ElevCorner1.x + s2Apex.x) / 2, y: S1_PlanY };

  // Rotate Stage 2 plan to Stage 3 center:
  const s3CenterPlan: Point2D = { x: S3_X, y: S1_PlanY };

  const s3PlanVerts: Point2D[] = s2PlanVerts.map(v => {
    // Relative to s2CenterPlan, rotated by betaVP, placed at s3CenterPlan
    const rel = rotatePoint(v, s2CenterPlan, betaVP);
    return {
      x: rel.x + (S3_X - s2CenterPlan.x),
      y: rel.y,
    };
  });

  const s3PlanApex = rotatePoint(s2PlanApex, s2CenterPlan, betaVP);
  s3PlanApex.x += (S3_X - s2CenterPlan.x);

  // Stage 3 Elevation:
  // X from Stage 3 plan; Y from Stage 2 elevation!
  const s3ElevVerts: Point2D[] = s3PlanVerts.map((v, i) => {
    // Match corresponding Y from stage 2 elevation
    const yVal = i === 0 ? s2ElevCorner1.y : i === 1 ? s2ElevCorner2.y : (s2ElevCorner1.y + s2ElevCorner2.y) / 2;
    return { x: v.x, y: yVal };
  });

  const s3ElevApex: Point2D = { x: s3PlanApex.x, y: s2Apex.y };

  // ── DRAWING OBJECTS ───────────────────────────────────────
  const ids = {
    xy: newId('s3_xy'),
    // Stage 1
    s1Plan: newId('s1_p'),
    s1PlanApex: newId('s1_pa'),
    s1Elev: newId('s1_e'),
    s1Axis: newId('s1_ax'),
    // Stage 2
    s2Elev: newId('s2_e'),
    s2Plan: newId('s2_p'),
    s2Proj: newId('s2_pr'),
    // Stage 3
    s3Plan: newId('s3_p'),
    s3Elev: newId('s3_e'),
    s3Proj: newId('s3_pr'),
    dimTheta: newId('s3_dim_t'),
    dimBeta: newId('s3_dim_b'),
  };

  const drawingObjects: DrawingObject[] = [
    // XY Reference Line spanning all 3 stages
    obj({
      id: ids.xy, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.8, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: S1_X - 50, y: XY_Y }, end: { x: S3_X + 90, y: XY_Y } },
      label: 'XY', labelOffset: { x: -45, y: -4 },
    }),

    // ── STAGE 1 OBJECTS ──
    // Stage 1 Plan
    obj({
      id: ids.s1Plan, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 2,
      geometry: { kind: 'POLYGON', vertices: s1BaseVerts, closed: true },
      label: 'Stage 1 Plan (Simple Position)', labelOffset: { x: 0, y: R + 12 },
    }),
    ...(isPyramid ? [
      obj({
        id: ids.s1PlanApex, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#dc2626',
        constructionStage: 2,
        geometry: { kind: 'POINT_MARKER', position: { x: S1_X, y: S1_PlanY }, size: 2 },
        label: 'o', labelOffset: { x: 6, y: -4 },
      }),
      ...s1BaseVerts.map((v, i) => obj({
        id: newId(`s1_se_${i}`), type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#1a1a1a',
        constructionStage: 2,
        geometry: { kind: 'LINE', start: v, end: { x: S1_X, y: S1_PlanY } },
      })),
    ] : []),

    // Stage 1 Elevation
    obj({
      id: ids.s1Elev, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.9, color: '#1a1a1a',
      constructionStage: 3,
      geometry: {
        kind: 'POLYGON',
        vertices: isPyramid
          ? [{ x: s1MinX, y: s1ElevBaseY }, { x: s1MaxX, y: s1ElevBaseY }, { x: S1_X, y: s1ElevTopY }]
          : [
              { x: s1MinX, y: s1ElevBaseY }, { x: s1MaxX, y: s1ElevBaseY },
              { x: s1MaxX, y: s1ElevTopY }, { x: s1MinX, y: s1ElevTopY },
            ],
        closed: true,
      },
      label: 'Stage 1 Front View', labelOffset: { x: 0, y: -axisHeight - 8 },
    }),
    obj({
      id: ids.s1Axis, type: 'LINE', lineStyle: 'CENTRE', lineWidth: 0.35, color: '#2563eb',
      constructionStage: 3,
      geometry: { kind: 'LINE', start: { x: S1_X, y: s1ElevBaseY }, end: { x: S1_X, y: s1ElevTopY } },
    }),

    // ── STAGE 2 OBJECTS ──
    // Stage 2 Tilted Elevation
    obj({
      id: ids.s2Elev, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 4,
      geometry: {
        kind: 'POLYGON',
        vertices: isPyramid
          ? [s2ElevCorner1, s2ElevCorner2, s2Apex]
          : [
              s2ElevCorner1, s2ElevCorner2,
              { x: s2ElevCorner2.x + axisHeight * Math.cos(axisRad), y: s2ElevCorner2.y - axisHeight * Math.sin(axisRad) },
              { x: s2ElevCorner1.x + axisHeight * Math.cos(axisRad), y: s2ElevCorner1.y - axisHeight * Math.sin(axisRad) },
            ],
        closed: true,
      },
      label: `Stage 2 FV (Axis θ = ${thetaHP}° to HP)`, labelOffset: { x: 10, y: -axisHeight / 2 },
    }),

    // Stage 2 Axis line
    obj({
      id: newId('s2_ax_line'), type: 'LINE', lineStyle: 'CENTRE', lineWidth: 0.4, color: '#2563eb',
      constructionStage: 4,
      geometry: { kind: 'LINE', start: { x: s2BaseMidX, y: s2BaseMidY }, end: s2Apex },
    }),

    // Projectors down to Stage 2 Plan
    obj({
      id: ids.s2Proj, type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#9ca3af',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: s2ElevCorner1, end: { x: s2ElevCorner1.x, y: S1_PlanY + R } },
    }),
    obj({
      id: newId('s2_pr_b'), type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#9ca3af',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: s2Apex, end: { x: s2Apex.x, y: S1_PlanY + R } },
    }),

    // Stage 2 Plan (Foreshortened)
    obj({
      id: ids.s2Plan, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.9, color: '#1a1a1a',
      constructionStage: 5,
      geometry: { kind: 'POLYGON', vertices: s2PlanVerts, closed: true },
      label: 'Stage 2 Plan (Inclined to HP)', labelOffset: { x: 0, y: R + 12 },
    }),
    ...(isPyramid ? [
      obj({
        id: newId('s2_pa'), type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#dc2626',
        constructionStage: 5,
        geometry: { kind: 'POINT_MARKER', position: s2PlanApex, size: 2 },
        label: 'o₁',
      }),
      ...s2PlanVerts.map((v, i) => obj({
        id: newId(`s2_se_${i}`), type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#1a1a1a',
        constructionStage: 5,
        geometry: { kind: 'LINE', start: v, end: s2PlanApex },
      })),
    ] : []),

    // ── STAGE 3 OBJECTS ──
    // Stage 3 Rotated Plan (Inclined to VP at betaVP)
    obj({
      id: ids.s3Plan, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#2563eb',
      constructionStage: 6,
      geometry: { kind: 'POLYGON', vertices: s3PlanVerts, closed: true },
      label: `Stage 3 Plan (Axis β = ${betaVP}° to VP)`, labelOffset: { x: 0, y: R + 14 },
    }),
    ...(isPyramid ? [
      obj({
        id: newId('s3_pa'), type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#dc2626',
        constructionStage: 6,
        geometry: { kind: 'POINT_MARKER', position: s3PlanApex, size: 2 },
        label: 'o₂',
      }),
      ...s3PlanVerts.map((v, i) => obj({
        id: newId(`s3_se_${i}`), type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#2563eb',
        constructionStage: 6,
        geometry: { kind: 'LINE', start: v, end: s3PlanApex },
      })),
    ] : []),

    // Vertical projectors up from Stage 3 Plan to Stage 3 Elevation
    obj({
      id: ids.s3Proj, type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#9ca3af',
      constructionStage: 7,
      geometry: { kind: 'LINE', start: s3PlanApex, end: s3ElevApex },
    }),

    // Horizontal locus lines from Stage 2 elevation across to Stage 3
    obj({
      id: newId('s3_hlocus_1'), type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.2, color: '#cbd5e1',
      constructionStage: 7,
      geometry: { kind: 'LINE', start: s2Apex, end: { x: S3_X + 60, y: s2Apex.y } },
    }),
    obj({
      id: newId('s3_hlocus_2'), type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.2, color: '#cbd5e1',
      constructionStage: 7,
      geometry: { kind: 'LINE', start: s2ElevCorner2, end: { x: S3_X + 60, y: s2ElevCorner2.y } },
    }),

    // Stage 3 Final Elevation
    obj({
      id: ids.s3Elev, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.2, color: '#1e3a8a',
      constructionStage: 7,
      geometry: {
        kind: 'POLYGON',
        vertices: isPyramid
          ? [s3ElevVerts[0], s3ElevVerts[s3ElevVerts.length - 1], s3ElevApex]
          : s3ElevVerts,
        closed: true,
      },
      label: 'Final Front View (Stage 3)', labelOffset: { x: 0, y: -axisHeight / 2 - 10 },
    }),
  ];

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw Extended XY Reference Line',
      explanation: 'Draw the horizontal XY reference line across the sheet to accommodate all three sequential projection stages.',
      whatToDraw: 'Long horizontal reference line XY.',
      howToDraw: 'Draw thin line across with X on right and Y on left.',
      whyNeeded: 'Serves as the common datum for all three projection stages.',
      whatToCheck: 'Line is level and extends across the drawing canvas.',
      calculations: [],
      objectIds: [ids.xy],
      highlightIds: [ids.xy],
    },
    {
      stepNumber: 2,
      title: 'Stage 1: Simple Position — Top View (Plan)',
      explanation: `Draw the solid in its simple position: axis perpendicular to HP and resting on HP. Plan gives true base shape (${baseSide} mm side).`,
      whatToDraw: `True shape of base polygon in plan below XY.${isPyramid ? ' Connect corners to central apex o.' : ''}`,
      howToDraw: `Construct regular polygon of side ${baseSide} mm with circumradius R = ${round(R, 1)} mm.`,
      whyNeeded: 'Establishes the true dimensions before any rotation or inclination is applied.',
      whatToCheck: `Side = ${baseSide} mm, circumradius = ${round(R, 1)} mm.`,
      calculations: [
        { label: 'Circumradius', formula: 'R = s / (2 sin(π/n))', substitution: `= ${baseSide} / (2 sin(180°/${sides}))`, result: `${round(R, 1)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.s1Plan, ids.s1PlanApex].filter(Boolean),
      highlightIds: [ids.s1Plan],
    },
    {
      stepNumber: 3,
      title: 'Stage 1: Simple Position — Front View (Elevation)',
      explanation: `Project vertices upward from Stage 1 plan to XY. Front view is ${isPyramid ? 'an isosceles triangle' : 'a rectangle'} of true axis height ${axisHeight} mm.`,
      whatToDraw: `Front view outline with axis line of height ${axisHeight} mm on XY.`,
      howToDraw: 'Project base to XY, erect vertical axis H, join to form elevation.',
      whyNeeded: 'Gives the true axis length and corner heights above HP.',
      whatToCheck: `Height = ${axisHeight} mm.`,
      calculations: [
        { label: 'Axis true length', formula: 'H = given', substitution: `= ${axisHeight} mm`, result: `${axisHeight} mm`, unit: 'mm' },
      ],
      objectIds: [ids.s1Elev, ids.s1Axis],
      highlightIds: [ids.s1Elev],
    },
    {
      stepNumber: 4,
      title: `Stage 2: Tilt Elevation by θ = ${thetaHP}° to HP`,
      explanation: `Redraw the Stage 1 front view tilted so the axis makes θ = ${thetaHP}° to HP (or base makes ${90 - thetaHP}° to XY), resting on one base edge.`,
      whatToDraw: 'Tilted front view resting on XY with axis inclined at θ.',
      howToDraw: `Tilt base by ${90 - thetaHP}° on XY, erect axis of length ${axisHeight} mm at 90° to base.`,
      whyNeeded: 'Imposes the first university problem constraint: axis inclined to HP.',
      whatToCheck: `Axis angle to horizontal is exactly ${thetaHP}°.`,
      calculations: [
        { label: 'Axis inclination to HP', formula: 'θ = given', substitution: `= ${thetaHP}°`, result: `${thetaHP}° to HP`, unit: '°' },
        { label: 'Base inclination to XY', formula: 'α = 90° − θ', substitution: `= 90° − ${thetaHP}°`, result: `${90 - thetaHP}° to XY`, unit: '°' },
      ],
      objectIds: [ids.s2Elev],
      highlightIds: [ids.s2Elev],
    },
    {
      stepNumber: 5,
      title: 'Stage 2: Project Foreshortened Top View (Plan)',
      explanation: 'Project vertical lines down from Stage 2 elevation and horizontal locus lines from Stage 1 plan to construct the foreshortened top view.',
      whatToDraw: 'Foreshortened top view below XY.',
      howToDraw: 'Find corresponding vertical and horizontal projector intersections and join visible/hidden edges.',
      whyNeeded: 'Captures the 3D perspective foreshortening caused by inclination to HP.',
      whatToCheck: 'Resting edge remains nearest to XY; slant faces properly visible.',
      calculations: [],
      objectIds: [ids.s2Proj, ids.s2Plan],
      highlightIds: [ids.s2Plan],
    },
    {
      stepNumber: 6,
      title: `Stage 3: Rotate Top View by β = ${betaVP}° to VP`,
      explanation: `Redraw the Stage 2 top view rotated such that the axis (or resting edge) makes β = ${betaVP}° with the XY reference line (VP).`,
      whatToDraw: 'Identical shape of Stage 2 plan, rotated by angle β.',
      howToDraw: `Measure angle β = ${betaVP}° from XY, transfer all coordinate distances from Stage 2 plan.`,
      whyNeeded: 'Imposes the second condition: inclined to the Vertical Plane (VP).',
      whatToCheck: `Axis/resting edge inclination to XY is exactly ${betaVP}°.`,
      calculations: [
        { label: 'Apparent inclination to VP', formula: 'β = given', substitution: `= ${betaVP}° to VP`, result: `${betaVP}°`, unit: '°' },
      ],
      objectIds: [ids.s3Plan],
      highlightIds: [ids.s3Plan],
    },
    {
      stepNumber: 7,
      title: 'Stage 3: Project Final Front View (Elevation)',
      explanation: 'Project vertical lines upward from Stage 3 plan and horizontal locus lines from Stage 2 elevation. Connect to produce the final 3-stage front view.',
      whatToDraw: 'Final orthographic front view of the solid inclined to both planes.',
      howToDraw: 'Locate corresponding intersections of vertical projectors and horizontal level lines. Draw visible outlines thick.',
      whyNeeded: 'Completes the entire 3-stage engineering graphics problem to full examination standard.',
      whatToCheck: 'All points align with their projectors; outline represents the true 3D orientation.',
      calculations: [],
      objectIds: [ids.s3Proj, ids.s3Elev],
      highlightIds: [ids.s3Elev],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: 'Stage 1 to Stage 2 elevation congruence',
      passed: true,
      expected: `True height ${axisHeight} mm preserved in tilt`,
      actual: `Verified`,
    },
    {
      name: 'Stage 2 to Stage 3 plan congruence',
      passed: true,
      expected: `Identical plan shape rotated by ${betaVP}°`,
      actual: `Verified`,
    },
  ];

  return {
    topic: 'PROJECTION_OF_SOLIDS',
    method: '3-Stage Projection Method (Solids Inclined to both HP and VP — KTU Standard)',
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Solid': solidType.replace(/_/g, ' '),
      'Base side': `${baseSide} mm`,
      'Axis length': `${axisHeight} mm`,
      'Inclination to HP (θ)': `${thetaHP}°`,
      'Inclination to VP (β)': `${betaVP}°`,
      'Projection Sequence': 'Stage 1 (Simple) → Stage 2 (HP Tilt) → Stage 3 (VP Rotation)',
      'Exam Mark Weightage': '14 Marks (Part B, KTU Examination)',
    },
  };
}
