// ============================================================
// Kerala EG Studio — Projection of Points Solver
//
// Supports all four quadrants and reference-plane positions.
// First-angle projection convention (default for Indian/Kerala curriculum).
//
// Coordinate system:
//   XY line at y = xyLineY in SVG space (y increases downward)
//   Above XY (elevation space): y < xyLineY  → above HP
//   Below XY (plan space): y > xyLineY       → in front of VP (Q1)
//
// Quadrant conventions:
//   Q1: above HP, in front of VP
//   Q2: above HP, behind VP
//   Q3: below HP, behind VP
//   Q4: below HP, in front of VP
// ============================================================

import { newId, round } from '../math';
import {
  buildValidationResult,
  validateElevationDistance,
  validatePlanDistance,
} from '../validation';
import type {
  DrawingObject,
  SolverSolution,
  ConstructionStep,
  Point2D,
  ValidationCheck,
} from '../types';

// ── Layout constants (drawing space, mm) ──────────────────────
const XY_Y = 0;          // XY reference line at y=0
const SCALE = 1;         // 1 mm = 1 drawing unit; renderer applies px/mm

// Helper: make a drawing object with defaults
function obj(
  partial: Omit<DrawingObject, 'visible' | 'highlighted'>
): DrawingObject {
  return { ...partial, visible: true, highlighted: false };
}

// ── Input ──────────────────────────────────────────────────────
export interface PointProjectionInput {
  /** Distance above (+) or below (-) HP (mm). Positive = above HP. */
  heightAboveHP: number;
  /** Distance in front of (+) or behind (-) VP (mm). Positive = in front. */
  depthInFrontVP: number;
  /** Point label, e.g. 'A' */
  label: string;
}

// ── Output ────────────────────────────────────────────────────
export interface PointProjectionOutput extends SolverSolution {
  /** Quadrant (1-4) or 0 if on a reference plane. */
  quadrant: 0 | 1 | 2 | 3 | 4;
  /** Elevation (front-view) position in drawing space. */
  elevationPos: Point2D;
  /** Plan (top-view) position in drawing space. */
  planPos: Point2D;
  /** XY reference y position. */
  xyY: number;
}

/**
 * Solve the projection of a single point given its distances from HP and VP.
 * Returns a complete SolverSolution with construction steps and drawing objects.
 */
export function solvePointProjection(
  input: PointProjectionInput
): PointProjectionOutput {
  const { heightAboveHP, depthInFrontVP, label } = input;
  const h = heightAboveHP;
  const d = depthInFrontVP;

  // ── Determine quadrant ────────────────────────────────────
  let quadrant: 0 | 1 | 2 | 3 | 4 = 0;
  if (h > 0 && d > 0) quadrant = 1;
  else if (h > 0 && d < 0) quadrant = 2;
  else if (h < 0 && d < 0) quadrant = 3;
  else if (h < 0 && d > 0) quadrant = 4;

  // ── Compute drawing positions ──────────────────────────────
  // First-angle projection:
  //   Elevation (a'): h mm above XY  → SVG y = XY_Y - h
  //   Plan (a):       d mm below XY for Q1 (in front of VP)
  //                   d mm above XY for Q2/Q3 (behind VP)
  // The plan of a point in front of VP goes BELOW XY;
  // the plan of a point behind VP goes ABOVE XY (but below elevation).
  // This matches standard first-angle projection folding.
  const elevY = XY_Y - h;   // above XY if h > 0
  const planY = XY_Y + d;   // below XY if d > 0 (in front of VP)

  // Points share the same x coordinate (projector is vertical)
  const X = 100; // arbitrary x for a single point; can be overridden

  const elevationPos: Point2D = { x: X, y: elevY };
  const planPos: Point2D = { x: X, y: planY };

  // ── Build drawing objects ──────────────────────────────────
  const xyId = newId('xy');
  const elevId = newId('elev');
  const planId = newId('plan');
  const projId = newId('proj');
  const projElId = newId('proj_el');
  const projPlId = newId('proj_pl');
  const dimHId = newId('dim_h');
  const dimDId = newId('dim_d');

  const drawingObjects: DrawingObject[] = [
    // Step 1: XY reference line
    obj({
      id: xyId,
      type: 'LINE',
      lineStyle: 'REFERENCE',
      lineWidth: 0.7,
      color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: X - 80, y: XY_Y }, end: { x: X + 80, y: XY_Y } },
      label: 'XY',
      labelOffset: { x: -75, y: -4 },
    }),
    // Step 1: XY label right
    obj({
      id: newId('xy_label'),
      type: 'TEXT',
      lineStyle: 'REFERENCE',
      lineWidth: 0,
      color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'TEXT', position: { x: X + 78, y: XY_Y - 4 }, content: 'X', fontSize: 5, anchor: 'END' },
    }),
    obj({
      id: newId('xy_label_l'),
      type: 'TEXT',
      lineStyle: 'REFERENCE',
      lineWidth: 0,
      color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'TEXT', position: { x: X - 78, y: XY_Y - 4 }, content: 'Y', fontSize: 5, anchor: 'START' },
    }),

    // Step 2: Projector (vertical construction line through both projections)
    obj({
      id: projId,
      type: 'LINE',
      lineStyle: 'PROJECTION',
      lineWidth: 0.35,
      color: '#9ca3af',
      constructionStage: 2,
      geometry: {
        kind: 'LINE',
        start: { x: X, y: Math.min(elevY, planY) - 15 },
        end: { x: X, y: Math.max(elevY, planY) + 15 },
      },
    }),

    // Step 3: Elevation point (a')
    obj({
      id: elevId,
      type: 'POINT_MARKER',
      lineStyle: 'VISIBLE',
      lineWidth: 0.5,
      color: '#1a1a1a',
      constructionStage: 3,
      geometry: { kind: 'POINT_MARKER', position: elevationPos, size: 1.5 },
      label: `${label}′`,
      labelOffset: { x: 4, y: -4 },
    }),

    // Step 4: Plan point (a)
    obj({
      id: planId,
      type: 'POINT_MARKER',
      lineStyle: 'VISIBLE',
      lineWidth: 0.5,
      color: '#1a1a1a',
      constructionStage: 4,
      geometry: { kind: 'POINT_MARKER', position: planPos, size: 1.5 },
      label: label.toLowerCase(),
      labelOffset: { x: 4, y: 4 },
    }),

    // Step 5: Dimension — height above/below HP
    obj({
      id: dimHId,
      type: 'DIMENSION_LINEAR',
      lineStyle: 'DIMENSION',
      lineWidth: 0.35,
      color: '#374151',
      constructionStage: 5,
      geometry: {
        kind: 'DIM_LINEAR',
        start: { x: X, y: XY_Y },
        end: { x: X, y: elevY },
        offset: 20,
        value: Math.abs(h),
        unit: 'mm',
      },
      label: h >= 0 ? `${Math.abs(h)} mm above HP` : `${Math.abs(h)} mm below HP`,
    }),

    // Step 5: Dimension — depth in front of/behind VP
    obj({
      id: dimDId,
      type: 'DIMENSION_LINEAR',
      lineStyle: 'DIMENSION',
      lineWidth: 0.35,
      color: '#374151',
      constructionStage: 5,
      geometry: {
        kind: 'DIM_LINEAR',
        start: { x: X, y: XY_Y },
        end: { x: X, y: planY },
        offset: 35,
        value: Math.abs(d),
        unit: 'mm',
      },
      label: d >= 0 ? `${Math.abs(d)} mm in front of VP` : `${Math.abs(d)} mm behind VP`,
    }),

    // Step 3: Elevation projector (from XY to elevation)
    obj({
      id: projElId,
      type: 'LINE',
      lineStyle: 'PROJECTION',
      lineWidth: 0.25,
      color: '#d1d5db',
      constructionStage: 3,
      geometry: { kind: 'LINE', start: { x: X, y: XY_Y }, end: elevationPos },
    }),

    // Step 4: Plan projector (from XY to plan)
    obj({
      id: projPlId,
      type: 'LINE',
      lineStyle: 'PROJECTION',
      lineWidth: 0.25,
      color: '#d1d5db',
      constructionStage: 4,
      geometry: { kind: 'LINE', start: { x: X, y: XY_Y }, end: planPos },
    }),
  ];

  // ── Construction steps ────────────────────────────────────
  const quadrantLabel = quadrant === 0 ? 'on a reference plane' : `in the ${quadrant}${['st', 'nd', 'rd', 'th'][quadrant - 1]} quadrant`;
  const hLabel = h === 0 ? 'on HP' : h > 0 ? `${h} mm above HP` : `${Math.abs(h)} mm below HP`;
  const dLabel = d === 0 ? 'on VP' : d > 0 ? `${d} mm in front of VP` : `${Math.abs(d)} mm behind VP`;

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw the XY Reference Line',
      explanation: `The XY line represents the intersection of the Horizontal Plane (HP) and the Vertical Plane (VP). All projections are measured from this line.`,
      whatToDraw: 'A horizontal reference line labeled X on the right and Y on the left.',
      howToDraw: 'Draw a horizontal line across the drawing sheet. Mark X at the right end and Y at the left end.',
      whyNeeded: 'Every projection distance is measured perpendicular to the XY line. Without it there is no reference.',
      whatToCheck: 'The line must be perfectly horizontal. Label both ends correctly.',
      calculations: [],
      objectIds: [xyId],
      highlightIds: [xyId],
    },
    {
      stepNumber: 2,
      title: 'Draw the Projector',
      explanation: `The projector is a vertical construction line. The elevation (${label}′) and plan (${label.toLowerCase()}) of the point both lie on this line.`,
      whatToDraw: 'A thin vertical construction line perpendicular to XY.',
      howToDraw: 'Draw a light vertical line at any convenient horizontal position.',
      whyNeeded: 'The elevation and plan projections of a point always lie on the same vertical projector.',
      whatToCheck: 'The projector must be exactly perpendicular to XY.',
      calculations: [],
      objectIds: [projId, projElId, projPlId],
      highlightIds: [projId],
    },
    {
      stepNumber: 3,
      title: `Mark the Elevation (${label}′)`,
      explanation: `The elevation is the projection of point ${label} onto the VP. In first-angle projection, if the point is ${hLabel}, its elevation (${label}′) is marked ${Math.abs(h)} mm ${h >= 0 ? 'above' : 'below'} XY.`,
      whatToDraw: `Point ${label}′ on the projector, ${Math.abs(h)} mm ${h >= 0 ? 'above' : 'below'} XY.`,
      howToDraw: `Measure ${Math.abs(h)} mm ${h >= 0 ? 'upward' : 'downward'} from the XY line along the projector. Mark this point as ${label}′.`,
      whyNeeded: `When HP is rotated to become coplanar with VP, the elevation appears ${h >= 0 ? 'above' : 'below'} XY by the point's ${h >= 0 ? 'height above' : 'depth below'} HP.`,
      whatToCheck: `Measure: ${label}′ must be exactly ${Math.abs(h)} mm from XY. Label it correctly with a prime (${label}′).`,
      calculations: [
        {
          label: 'Elevation distance from XY',
          formula: `${label}′ distance from XY = height above HP`,
          substitution: `= ${h} mm`,
          result: `${label}′ is ${Math.abs(h)} mm ${h >= 0 ? 'above' : 'below'} XY`,
          unit: 'mm',
        },
      ],
      objectIds: [elevId, projElId],
      highlightIds: [elevId],
    },
    {
      stepNumber: 4,
      title: `Mark the Plan (${label.toLowerCase()})`,
      explanation: `The plan is the projection of point ${label} onto the HP. The point is ${dLabel}. In first-angle projection, its plan (${label.toLowerCase()}) is ${Math.abs(d)} mm ${d >= 0 ? 'below' : 'above'} XY.`,
      whatToDraw: `Point ${label.toLowerCase()} on the projector, ${Math.abs(d)} mm ${d >= 0 ? 'below' : 'above'} XY.`,
      howToDraw: `Measure ${Math.abs(d)} mm ${d >= 0 ? 'downward' : 'upward'} from the XY line along the projector. Mark this point as ${label.toLowerCase()}.`,
      whyNeeded: `When HP is unfolded, the plan of a point in front of VP appears below XY by the depth of the point. A point behind VP appears above XY.`,
      whatToCheck: `Measure: ${label.toLowerCase()} must be exactly ${Math.abs(d)} mm from XY. The label must be lowercase.`,
      calculations: [
        {
          label: 'Plan distance from XY',
          formula: `${label.toLowerCase()} distance from XY = depth in front of VP`,
          substitution: `= ${d} mm`,
          result: `${label.toLowerCase()} is ${Math.abs(d)} mm ${d >= 0 ? 'below' : 'above'} XY`,
          unit: 'mm',
        },
      ],
      objectIds: [planId, projPlId],
      highlightIds: [planId],
    },
    {
      stepNumber: 5,
      title: 'Add Dimensions and Verify',
      explanation: `Add dimension annotations showing the distances from XY. Verify that the point is correctly placed in ${quadrantLabel}: elevation ${hLabel} from HP, plan ${dLabel} from VP.`,
      whatToDraw: 'Dimension lines showing h and d measurements from XY.',
      howToDraw: 'Use thin lines with arrowheads to annotate the two distances.',
      whyNeeded: 'Dimensions confirm the given data and allow the examiner to verify the construction.',
      whatToCheck: `Both dimensions must match the given data: h = ${h} mm, d = ${d} mm.`,
      calculations: [
        {
          label: 'Height above HP',
          formula: 'h = distance of point above HP',
          substitution: `= ${h} mm`,
          result: `${label}′ is ${Math.abs(h)} mm from XY in elevation`,
          unit: 'mm',
        },
        {
          label: 'Depth in front of VP',
          formula: 'd = distance of point in front of VP',
          substitution: `= ${d} mm`,
          result: `${label} is ${Math.abs(d)} mm from XY in plan`,
          unit: 'mm',
        },
      ],
      objectIds: [dimHId, dimDId],
      highlightIds: [dimHId, dimDId],
    },
  ];

  // ── Validation ────────────────────────────────────────────
  const checks: ValidationCheck[] = [
    validateElevationDistance(Math.abs(elevY - XY_Y), Math.abs(h)),
    validatePlanDistance(Math.abs(planY - XY_Y), Math.abs(d)),
  ];
  const validation = buildValidationResult(checks);

  return {
    topic: 'PROJECTION_OF_POINTS',
    method: 'Direct Projection Method (First-Angle)',
    drawingObjects,
    steps,
    validation,
    finalValues: {
      'Point Label': label,
      'Height above HP (h)': `${h} mm`,
      'Depth in front of VP (d)': `${d} mm`,
      'Quadrant': quadrant === 0 ? 'On reference plane' : `Quadrant ${quadrant}`,
      [`Elevation (${label}′) from XY`]: `${Math.abs(round(elevY - XY_Y, 2))} mm ${h >= 0 ? 'above' : 'below'}`,
      [`Plan (${label.toLowerCase()}) from XY`]: `${Math.abs(round(planY - XY_Y, 2))} mm ${d >= 0 ? 'below' : 'above'}`,
    },
    quadrant,
    elevationPos,
    planPos,
    xyY: XY_Y,
  };
}
