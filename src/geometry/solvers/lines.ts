// ============================================================
// Kerala EG Studio — Projection of Straight Lines Solver
//
// Supports:
//   1. Line parallel to both HP and VP
//   2. Line inclined to HP only (theta given, phi = 0)
//   3. Line inclined to VP only (phi given, theta = 0)
//   4. Line inclined to both HP and VP (rotating-line method)
//
// First-angle projection convention.
// Returns construction steps + drawing objects + validation.
// ============================================================

import {
  newId, round, degToRad, radToDeg,
  planProjectionLength, elevProjectionLength,
  inclinationToHP, inclinationToVP,
  validateLineThetaPhi,
} from '../math';
import {
  buildValidationResult,
  validatePlanLength,
  validateElevationLength,
  validateThetaPhiConstraint,
} from '../validation';
import type {
  DrawingObject, ConstructionStep, SolverSolution,
  Point2D, ValidationCheck,
} from '../types';

// Drawing layout constants (drawing-space mm, y increases downward)
const XY_Y = 0;

function obj(partial: Omit<DrawingObject, 'visible' | 'highlighted'>): DrawingObject {
  return { ...partial, visible: true, highlighted: false };
}

// ── Inputs ─────────────────────────────────────────────────────
export interface LineProjectionInput {
  /** True length of line AB (mm). */
  trueLength: number;
  /** Label for end A (e.g. 'A'). */
  labelA: string;
  /** Label for end B (e.g. 'B'). */
  labelB: string;
  /** Height of end A above HP (mm, positive = above). */
  heightA: number;
  /** Depth of end A in front of VP (mm, positive = in front). */
  depthA: number;
  /** True inclination to HP in degrees (θ). 0 = parallel to HP. */
  thetaDeg: number;
  /** True inclination to VP in degrees (φ). 0 = parallel to VP. */
  phiDeg: number;
  /** Whether to calculate and show traces (HT, VT). */
  showTraces: boolean;
  /** Horizontal direction of end B from A (1 = right, -1 = left). */
  direction?: 1 | -1;
}

export interface LineProjectionOutput extends SolverSolution {
  /** Plan projection length (mm). */
  planLength: number;
  /** Elevation projection length (mm). */
  elevLength: number;
  /** True inclination to HP (degrees). */
  thetaDeg: number;
  /** True inclination to VP (degrees). */
  phiDeg: number;
  /** Apparent inclination of elevation to XY (alpha). */
  alphaElevDeg: number;
  /** Apparent inclination of plan to XY (beta). */
  betaPlanDeg: number;
  /** Horizontal Trace point, if requested. */
  HT?: Point2D;
  /** Vertical Trace point, if requested. */
  VT?: Point2D;
}

/**
 * Solve the projection of a straight line.
 * Uses the Rotating-Line (Rabatment) Method for lines inclined to both planes.
 */
export function solveLineProjection(input: LineProjectionInput): LineProjectionOutput {
  const {
    trueLength: L, labelA, labelB, heightA, depthA,
    thetaDeg, phiDeg, showTraces, direction = 1,
  } = input;

  // ── Validate input ────────────────────────────────────────
  const tpCheck = validateLineThetaPhi(thetaDeg, phiDeg);
  if (!tpCheck.valid) {
    throw new Error(`Invalid input: ${tpCheck.reason}`);
  }

  // ── Compute key lengths ───────────────────────────────────
  const l_plan = planProjectionLength(L, thetaDeg);  // plan projection = L cos θ
  const l_elev = elevProjectionLength(L, phiDeg);    // elevation projection = L cos φ

  // Height and depth differences of B relative to A
  const dHeight = L * Math.sin(degToRad(thetaDeg));  // B is dHeight above A (if θ > 0)
  const dDepth  = L * Math.sin(degToRad(phiDeg));    // B is dDepth further from VP

  // Apparent inclinations
  const alphaElevDeg = radToDeg(Math.atan2(dHeight, l_plan)); // inclination of elevation view
  const betaPlanDeg  = radToDeg(Math.atan2(dDepth, l_elev));  // inclination of plan view

  // ── Point coordinates (drawing space) ─────────────────────
  // Point A positions
  const xA = 100;  // starting x for A
  const elevAy = XY_Y - heightA;
  const planAy  = XY_Y + depthA;

  // Point B positions (end of projections)
  const xB = xA + direction * l_plan; // B is l_plan to the right in plan
  const heightB = heightA + dHeight;
  const depthB  = depthA  + dDepth;
  const elevBy  = XY_Y - heightB;
  const planBy  = XY_Y + depthB;
  const xBelev  = xA + direction * l_elev; // may differ in elevation if inclined to VP

  const A_elev: Point2D = { x: xA, y: elevAy };
  const B_elev: Point2D = { x: xBelev, y: elevBy };
  const A_plan: Point2D = { x: xA, y: planAy };
  const B_plan: Point2D = { x: xB, y: planBy };

  // ── IDs ───────────────────────────────────────────────────
  const ids = {
    xy: newId('xy'), xyLabelX: newId('xyX'), xyLabelY: newId('xyY'),
    projA: newId('projA'), projB: newId('projB'),
    elevLine: newId('elev_line'), planLine: newId('plan_line'),
    elevA: newId('elevA'), elevB: newId('elevB'),
    planA: newId('planA'), planB: newId('planB'),
    labelElevA: newId('lbl_eA'), labelElevB: newId('lbl_eB'),
    labelPlanA: newId('lbl_pA'), labelPlanB: newId('lbl_pB'),
    dimPlan: newId('dim_plan'), dimElev: newId('dim_elev'),
    rotTrue: newId('rot_true'),
    ht: newId('ht'), vt: newId('vt'),
    dimTheta: newId('dim_theta'), dimPhi: newId('dim_phi'),
    dimAlpha: newId('dim_alpha'), dimBeta: newId('dim_beta'),
  };

  // ── Drawing objects ───────────────────────────────────────
  const drawingObjects: DrawingObject[] = [
    // Stage 1: XY reference line
    obj({ id: ids.xy, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.7, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: xA - 50, y: XY_Y }, end: { x: xB + 60, y: XY_Y } } }),
    obj({ id: ids.xyLabelX, type: 'TEXT', lineStyle: 'REFERENCE', lineWidth: 0, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'TEXT', position: { x: xB + 58, y: XY_Y - 4 }, content: 'X', fontSize: 5, anchor: 'END' } }),
    obj({ id: ids.xyLabelY, type: 'TEXT', lineStyle: 'REFERENCE', lineWidth: 0, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'TEXT', position: { x: xA - 48, y: XY_Y - 4 }, content: 'Y', fontSize: 5, anchor: 'START' } }),

    // Stage 2: Projectors for A and B
    obj({ id: ids.projA, type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#d1d5db',
      constructionStage: 2,
      geometry: { kind: 'LINE', start: { x: xA, y: Math.min(elevAy, planAy) - 10 }, end: { x: xA, y: Math.max(elevAy, planAy) + 10 } } }),
    obj({ id: ids.projB, type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#d1d5db',
      constructionStage: 4,
      geometry: { kind: 'LINE', start: { x: xBelev, y: Math.min(elevBy, planBy) - 10 }, end: { x: xBelev, y: Math.max(elevBy, planBy) + 10 } } }),

    // Stage 3: End A projections
    obj({ id: ids.elevA, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#1a1a1a',
      constructionStage: 3, geometry: { kind: 'POINT_MARKER', position: A_elev, size: 1.5 },
      label: `${labelA}′`, labelOffset: { x: -6, y: -4 } }),
    obj({ id: ids.planA, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#1a1a1a',
      constructionStage: 3, geometry: { kind: 'POINT_MARKER', position: A_plan, size: 1.5 },
      label: labelA.toLowerCase(), labelOffset: { x: -6, y: 4 } }),

    // Stage 4: True length rotation arc (for both-inclined case)
    ...(thetaDeg > 0 && phiDeg > 0 ? [
      obj({ id: ids.rotTrue, type: 'ARC', lineStyle: 'CONSTRUCTION', lineWidth: 0.35, color: '#888888',
        constructionStage: 4,
        geometry: {
          kind: 'ARC', center: A_elev, radius: L,
          startAngleDeg: -alphaElevDeg, endAngleDeg: 0,
        } }),
    ] : []),

    // Stage 4: End B projections
    obj({ id: ids.elevB, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#1a1a1a',
      constructionStage: 4, geometry: { kind: 'POINT_MARKER', position: B_elev, size: 1.5 },
      label: `${labelB}′`, labelOffset: { x: 4, y: -4 } }),
    obj({ id: ids.planB, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.5, color: '#1a1a1a',
      constructionStage: 4, geometry: { kind: 'POINT_MARKER', position: B_plan, size: 1.5 },
      label: labelB.toLowerCase(), labelOffset: { x: 4, y: 4 } }),

    // Stage 5: Elevation projection line (a'b')
    obj({ id: ids.elevLine, type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 0.7, color: '#1a1a1a',
      constructionStage: 5, label: `${labelA.toLowerCase()}′${labelB.toLowerCase()}′`,
      geometry: { kind: 'LINE', start: A_elev, end: B_elev } }),

    // Stage 5: Plan projection line (ab)
    obj({ id: ids.planLine, type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 0.7, color: '#1a1a1a',
      constructionStage: 5, label: `${labelA.toLowerCase()}${labelB.toLowerCase()}`,
      geometry: { kind: 'LINE', start: A_plan, end: B_plan } }),

    // Stage 6: Dimension annotations
    obj({ id: ids.dimPlan, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.35, color: '#374151',
      constructionStage: 6,
      geometry: { kind: 'DIM_LINEAR', start: A_plan, end: B_plan, offset: 20, value: round(l_plan, 1), unit: 'mm' },
      label: `${round(l_plan, 1)} mm (Plan)` }),
    obj({ id: ids.dimElev, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.35, color: '#374151',
      constructionStage: 6,
      geometry: { kind: 'DIM_LINEAR', start: A_elev, end: B_elev, offset: -20, value: round(l_elev, 1), unit: 'mm' },
      label: `${round(l_elev, 1)} mm (Elev)` }),
  ];

  // ── Traces (HT and VT) ────────────────────────────────────
  let HT: Point2D | undefined;
  let VT: Point2D | undefined;

  if (showTraces) {
    // Horizontal Trace: where the line (extended) meets HP (y=0 in plan space)
    // Parametric: point = A_plan + t*(B_plan - A_plan)
    // At y = XY_Y (HP): t = (XY_Y - A_plan.y) / (B_plan.y - A_plan.y)
    const dy_plan = B_plan.y - A_plan.y;
    if (Math.abs(dy_plan) > 0.001) {
      const t_ht = (XY_Y - A_plan.y) / dy_plan;
      HT = { x: A_plan.x + t_ht * (B_plan.x - A_plan.x), y: XY_Y };
      drawingObjects.push(obj({
        id: ids.ht, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.7, color: '#dc2626',
        constructionStage: 7, geometry: { kind: 'POINT_MARKER', position: HT, size: 2 },
        label: 'HT', labelOffset: { x: 4, y: 6 },
      }));
    }

    // Vertical Trace: where line (extended) meets VP (plan y = XY_Y means z=0 depth)
    // In elevation: t such that the point is on the VP (depth = 0)
    // Approximation: VT is on the XY line in elevation space
    const dy_elev = B_elev.y - A_elev.y;
    if (Math.abs(dy_elev) > 0.001) {
      const t_vt = (XY_Y - A_elev.y) / dy_elev;
      VT = { x: A_elev.x + t_vt * (B_elev.x - A_elev.x), y: XY_Y };
      drawingObjects.push(obj({
        id: ids.vt, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.7, color: '#7c3aed',
        constructionStage: 7, geometry: { kind: 'POINT_MARKER', position: VT, size: 2 },
        label: 'VT', labelOffset: { x: 4, y: -6 },
      }));
    }
  }

  // ── Construction steps ────────────────────────────────────
  const lA = labelA, lB = labelB;
  const la = lA.toLowerCase(), lb = lB.toLowerCase();

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw XY Reference Line and Mark End A',
      explanation: `Draw the XY reference line. Mark end A: elevation ${lA}′ is ${heightA} mm above XY; plan ${la} is ${depthA} mm below XY (in front of VP).`,
      whatToDraw: 'XY reference line, then point A in both elevation and plan.',
      howToDraw: `Draw horizontal XY line. On the projector through A, mark ${lA}′ at ${heightA} mm above XY and ${la} at ${depthA} mm below XY.`,
      whyNeeded: 'End A gives the starting anchor for the line construction.',
      whatToCheck: `${lA}′ is ${heightA} mm above XY. ${la} is ${depthA} mm below XY.`,
      calculations: [
        { label: `Height of ${lA} above HP`, formula: 'h_A = given', substitution: `= ${heightA} mm`, result: `${lA}′ is ${heightA} mm above XY`, unit: 'mm' },
        { label: `Depth of ${lA} in front of VP`, formula: 'd_A = given', substitution: `= ${depthA} mm`, result: `${la} is ${depthA} mm below XY`, unit: 'mm' },
      ],
      objectIds: [ids.xy, ids.xyLabelX, ids.xyLabelY, ids.projA, ids.elevA, ids.planA],
      highlightIds: [ids.elevA, ids.planA],
    },
    {
      stepNumber: 2,
      title: 'Compute Plan and Elevation Projection Lengths',
      explanation: `The plan projection length = L cos θ = ${round(l_plan, 2)} mm. The elevation projection length = L cos φ = ${round(l_elev, 2)} mm.`,
      whatToDraw: 'Calculations (no new lines yet).',
      howToDraw: 'Apply the projection length formulas.',
      whyNeeded: 'These lengths determine where end B falls in each view.',
      whatToCheck: `Plan length ≈ ${round(l_plan, 2)} mm; Elevation length ≈ ${round(l_elev, 2)} mm.`,
      calculations: [
        { label: 'Plan projection length', formula: 'l_plan = L × cos θ', substitution: `= ${L} × cos(${thetaDeg}°) = ${L} × ${round(Math.cos(degToRad(thetaDeg)), 4)}`, result: `${round(l_plan, 2)} mm`, unit: 'mm' },
        { label: 'Elevation projection length', formula: 'l_elev = L × cos φ', substitution: `= ${L} × cos(${phiDeg}°) = ${L} × ${round(Math.cos(degToRad(phiDeg)), 4)}`, result: `${round(l_elev, 2)} mm`, unit: 'mm' },
        { label: 'Height difference (B above A)', formula: 'Δh = L × sin θ', substitution: `= ${L} × sin(${thetaDeg}°)`, result: `${round(dHeight, 2)} mm`, unit: 'mm' },
        { label: 'Depth difference (B beyond A)', formula: 'Δd = L × sin φ', substitution: `= ${L} × sin(${phiDeg}°)`, result: `${round(dDepth, 2)} mm`, unit: 'mm' },
      ],
      objectIds: [],
      highlightIds: [],
    },
    {
      stepNumber: 3,
      title: `Locate End ${lB} and Draw Projections`,
      explanation: `End ${lB}: height = ${round(heightB, 2)} mm above HP, depth = ${round(depthB, 2)} mm in front of VP. Mark ${lB}′ at ${round(Math.abs(elevBy), 2)} mm from XY in elevation; mark ${lb} at ${round(Math.abs(planBy), 2)} mm from XY in plan.`,
      whatToDraw: `Points ${lB}′ (elevation) and ${lb} (plan). Then draw lines ${la}′${lb}′ and ${la}${lb}.`,
      howToDraw: `From ${lA}′, draw elevation line at angle α = ${round(alphaElevDeg, 1)}° to XY, length ${round(l_elev, 2)} mm. From ${la}, draw plan line at angle β = ${round(betaPlanDeg, 1)}° to XY, length ${round(l_plan, 2)} mm.`,
      whyNeeded: 'These are the front-view (elevation) and top-view (plan) projections of the line.',
      whatToCheck: `${lB}′ is ${round(Math.abs(elevBy), 2)} mm from XY. ${lb} is ${round(Math.abs(planBy), 2)} mm from XY. Draw projectors through ${lB}′ and ${lb}.`,
      calculations: [
        { label: `Height of ${lB}`, formula: `h_B = h_A + Δh`, substitution: `= ${heightA} + ${round(dHeight, 2)}`, result: `${round(heightB, 2)} mm`, unit: 'mm' },
        { label: `Depth of ${lB}`, formula: `d_B = d_A + Δd`, substitution: `= ${depthA} + ${round(dDepth, 2)}`, result: `${round(depthB, 2)} mm`, unit: 'mm' },
        { label: 'Apparent inclination in elevation (α)', formula: 'α = arctan(Δh / l_plan)', substitution: `= arctan(${round(dHeight, 2)} / ${round(l_plan, 2)})`, result: `${round(alphaElevDeg, 1)}°`, unit: '°' },
        { label: 'Apparent inclination in plan (β)', formula: 'β = arctan(Δd / l_elev)', substitution: `= arctan(${round(dDepth, 2)} / ${round(l_elev, 2)})`, result: `${round(betaPlanDeg, 1)}°`, unit: '°' },
      ],
      objectIds: [ids.projB, ids.elevB, ids.planB, ids.elevLine, ids.planLine, ids.rotTrue].filter(Boolean),
      highlightIds: [ids.elevLine, ids.planLine],
    },
    ...(showTraces && (HT || VT) ? [{
      stepNumber: 4,
      title: 'Find Traces (HT and VT)',
      explanation: `The Horizontal Trace (HT) is where line AB (extended) meets HP. The Vertical Trace (VT) is where it meets VP.`,
      whatToDraw: `HT on the XY line in plan; VT on the XY line in elevation.`,
      howToDraw: 'Extend the elevation line to XY for VT. Extend the plan line to XY for HT.',
      whyNeeded: 'Traces show where the line pierces each reference plane.',
      whatToCheck: 'HT must lie on XY in the plan view. VT must lie on XY in the elevation.',
      calculations: [],
      objectIds: [ids.ht, ids.vt].filter(x => !!x),
      highlightIds: [ids.ht, ids.vt].filter(x => !!x),
    }] : []),
    {
      stepNumber: showTraces && (HT || VT) ? 5 : 4,
      title: 'Add Dimensions and Final Labels',
      explanation: `Annotate: plan length ${round(l_plan, 2)} mm, elevation length ${round(l_elev, 2)} mm, true length ${L} mm, θ = ${thetaDeg}°, φ = ${phiDeg}°.`,
      whatToDraw: 'Dimension lines for plan length and elevation length.',
      howToDraw: 'Add standard linear dimension annotations.',
      whyNeeded: 'Dimensions allow verification and examination marking.',
      whatToCheck: 'All labels are clear and non-overlapping. Projection lengths match calculations.',
      calculations: [],
      objectIds: [ids.dimPlan, ids.dimElev],
      highlightIds: [ids.dimPlan, ids.dimElev],
    },
  ];

  // ── Validation ────────────────────────────────────────────
  const checks: ValidationCheck[] = [
    validateThetaPhiConstraint(thetaDeg, phiDeg),
    validatePlanLength(l_plan, L, thetaDeg),
    validateElevationLength(l_elev, L, phiDeg),
  ];
  const validation = buildValidationResult(checks);

  return {
    topic: 'PROJECTION_OF_LINES',
    method: 'Rotating-Line (Rabatment) Method — First-Angle Projection',
    drawingObjects,
    steps,
    validation,
    finalValues: {
      'True Length (L)': `${L} mm`,
      'True Inclination to HP (θ)': `${thetaDeg}°`,
      'True Inclination to VP (φ)': `${phiDeg}°`,
      'Plan Projection Length': `${round(l_plan, 2)} mm`,
      'Elevation Projection Length': `${round(l_elev, 2)} mm`,
      'Apparent inclination in Elevation (α)': `${round(alphaElevDeg, 1)}°`,
      'Apparent inclination in Plan (β)': `${round(betaPlanDeg, 1)}°`,
      ...(HT ? { 'Horizontal Trace (HT)': `(${round(HT.x, 1)}, ${round(HT.y, 1)})` } : {}),
      ...(VT ? { 'Vertical Trace (VT)': `(${round(VT.x, 1)}, ${round(VT.y, 1)})` } : {}),
    },
    planLength: l_plan,
    elevLength: l_elev,
    thetaDeg,
    phiDeg,
    alphaElevDeg,
    betaPlanDeg,
    HT,
    VT,
  };
}
