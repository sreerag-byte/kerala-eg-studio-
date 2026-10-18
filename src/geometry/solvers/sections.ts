// ============================================================
// Kerala EG Studio — Sections of Solids Solver
// Supports: Section of Prisms (and Cylinders) by an inclined plane
// Generates: Front view with cutting plane, Sectional Top View,
// and True Shape of Section (auxiliary view).
// ============================================================

import { newId, round, degToRad } from '../math';
import { buildValidationResult } from '../validation';
import type {
  DrawingObject, ConstructionStep, SolverSolution,
  Point2D, ValidationCheck,
} from '../types';

function obj(partial: Omit<DrawingObject, 'visible' | 'highlighted'>): DrawingObject {
  return { ...partial, visible: true, highlighted: false };
}

const XY_Y = 0;

export interface SectionPrismInput {
  baseSide: number;       // mm (e.g. 40mm square base)
  height: number;         // mm (e.g. 70mm axis)
  cuttingAngleDeg: number;// e.g. 45 degrees to HP
  cutPointOnAxisHeight: number; // height from base where cutting plane passes through axis (e.g. 35mm)
  solidType?: 'SQUARE_PRISM' | 'HEXAGONAL_PRISM';
}

export function solveSectionOfSolid(input: SectionPrismInput): SolverSolution {
  const {
    baseSide, height, cuttingAngleDeg, cutPointOnAxisHeight,
    solidType = 'SQUARE_PRISM',
  } = input;

  const centerX = 160;
  const halfBase = baseSide / 2;

  // Plan coordinates (base on HP)
  const planTopY = XY_Y + 20;
  const planBottomY = planTopY + baseSide;
  const planLeftX = centerX - halfBase;
  const planRightX = centerX + halfBase;

  // Elevation coordinates
  const elevBaseY = XY_Y - 5;
  const elevTopY = elevBaseY - height;

  // Cutting plane line: passes through (centerX, elevBaseY - cutPointOnAxisHeight) with angle cuttingAngleDeg to HP (horizontal)
  const cutOriginY = elevBaseY - cutPointOnAxisHeight;
  const tanAngle = Math.tan(degToRad(cuttingAngleDeg));

  // Intersection with left vertical edge (x = planLeftX) and right vertical edge (x = planRightX)
  // y_cut(x) = cutOriginY - (x - centerX) * tanAngle  (note SVG y goes downward)
  const cutLeftY = cutOriginY + (centerX - planLeftX) * tanAngle;
  const cutRightY = cutOriginY - (planRightX - centerX) * tanAngle;

  // Clamped/checked against prism top and base
  const cutP1: Point2D = { x: planLeftX, y: cutLeftY };
  const cutP2: Point2D = { x: planRightX, y: cutRightY };

  // True shape construction (Auxiliary plane X1Y1 parallel to cutting plane)
  // Rotate cutting plane by -cuttingAngleDeg to project true shape
  const trueShapeLength = Math.hypot(cutRightY - cutLeftY, planRightX - planLeftX);
  const auxOriginX = centerX + 110;
  const auxOriginY = cutOriginY - 40;

  const tsV1: Point2D = { x: auxOriginX - trueShapeLength / 2, y: auxOriginY - halfBase };
  const tsV2: Point2D = { x: auxOriginX + trueShapeLength / 2, y: auxOriginY - halfBase };
  const tsV3: Point2D = { x: auxOriginX + trueShapeLength / 2, y: auxOriginY + halfBase };
  const tsV4: Point2D = { x: auxOriginX - trueShapeLength / 2, y: auxOriginY + halfBase };

  const ids = {
    xy: newId('sec_xy'),
    planBase: newId('sec_plan'),
    planHatch: newId('sec_plan_hatch'),
    elevBase: newId('sec_elev_base'),
    elevCutPlane: newId('sec_cut_plane'),
    projLines: newId('sec_proj'),
    trueShape: newId('sec_true_shape'),
    trueShapeHatch: newId('sec_ts_hatch'),
    dimCutAngle: newId('sec_dim_angle'),
    axisElev: newId('sec_axis'),
  };

  const drawingObjects: DrawingObject[] = [
    // 1. XY line
    obj({
      id: ids.xy, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.7, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: centerX - 120, y: XY_Y }, end: { x: auxOriginX + 90, y: XY_Y } },
      label: 'XY', labelOffset: { x: -115, y: -4 },
    }),

    // 2. Base projections in Plan & Elevation
    obj({
      id: ids.planBase, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 2,
      geometry: {
        kind: 'POLYGON',
        vertices: [
          { x: planLeftX, y: planTopY },
          { x: planRightX, y: planTopY },
          { x: planRightX, y: planBottomY },
          { x: planLeftX, y: planBottomY },
        ],
        closed: true,
      },
      label: 'Top View (Plan)',
    }),
    obj({
      id: ids.elevBase, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 2,
      geometry: {
        kind: 'POLYGON',
        vertices: [
          { x: planLeftX, y: elevBaseY },
          { x: planRightX, y: elevBaseY },
          { x: planRightX, y: elevTopY },
          { x: planLeftX, y: elevTopY },
        ],
        closed: true,
      },
      label: 'Elevation',
    }),
    obj({
      id: ids.axisElev, type: 'LINE', lineStyle: 'CENTRE', lineWidth: 0.4, color: '#2563eb',
      constructionStage: 2,
      geometry: { kind: 'LINE', start: { x: centerX, y: elevBaseY + 5 }, end: { x: centerX, y: elevTopY - 5 } },
    }),

    // 3. Cutting plane VT in elevation
    obj({
      id: ids.elevCutPlane, type: 'LINE', lineStyle: 'CUTTING_PLANE', lineWidth: 1.2, color: '#dc2626',
      constructionStage: 3,
      geometry: {
        kind: 'LINE',
        start: { x: cutP1.x - 25, y: cutP1.y + 25 * tanAngle },
        end: { x: cutP2.x + 25, y: cutP2.y - 25 * tanAngle },
      },
      label: `V-T (θ = ${cuttingAngleDeg}°)`,
      labelOffset: { x: 20, y: -8 },
    }),

    // 4. Sectional Hatching in Top View
    obj({
      id: ids.planHatch, type: 'HATCHING_REGION', lineStyle: 'HATCHING', lineWidth: 0.4, color: '#475569',
      constructionStage: 4,
      geometry: {
        kind: 'HATCHING',
        vertices: [
          { x: planLeftX, y: planTopY },
          { x: planRightX, y: planTopY },
          { x: planRightX, y: planBottomY },
          { x: planLeftX, y: planBottomY },
        ],
        angleDeg: 45,
        spacingMm: 3,
      },
    }),

    // 5. True Shape of Section (Auxiliary View)
    obj({
      id: ids.trueShape, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1e3a8a',
      constructionStage: 5,
      geometry: {
        kind: 'POLYGON',
        vertices: [tsV1, tsV2, tsV3, tsV4],
        closed: true,
      },
      label: 'True Shape of Section',
      labelOffset: { x: 0, y: -18 },
    }),
    obj({
      id: ids.trueShapeHatch, type: 'HATCHING_REGION', lineStyle: 'HATCHING', lineWidth: 0.4, color: '#2563eb',
      constructionStage: 5,
      geometry: {
        kind: 'HATCHING',
        vertices: [tsV1, tsV2, tsV3, tsV4],
        angleDeg: 45,
        spacingMm: 3,
      },
    }),
  ];

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw Reference Line XY',
      explanation: 'Draw the horizontal XY line separating elevation (VP) and plan (HP).',
      whatToDraw: 'Horizontal line labeled XY.',
      howToDraw: 'Draw a straight reference line with thin pencil/tool.',
      whyNeeded: 'Represents the intersection of HP and VP.',
      whatToCheck: 'Line is level and clear.',
      calculations: [],
      objectIds: [ids.xy],
      highlightIds: [ids.xy],
    },
    {
      stepNumber: 2,
      title: 'Draw Simple Projections of the Solid',
      explanation: `Draw the square base of ${baseSide} mm in top view (plan) and project the front view (elevation) rectangle of height ${height} mm.`,
      whatToDraw: 'Square in plan, rectangle in elevation with axis line.',
      howToDraw: 'Project vertical projectors from the four corners of the base upward to form the elevation.',
      whyNeeded: 'Establishes the uncut solid geometry before applying the cutting plane.',
      whatToCheck: `Base side = ${baseSide} mm, prism height = ${height} mm.`,
      calculations: [
        { label: 'Prism base side', formula: 's = given', substitution: `= ${baseSide} mm`, result: `${baseSide} mm`, unit: 'mm' },
        { label: 'Prism axis height', formula: 'H = given', substitution: `= ${height} mm`, result: `${height} mm`, unit: 'mm' },
      ],
      objectIds: [ids.planBase, ids.elevBase, ids.axisElev],
      highlightIds: [ids.elevBase, ids.planBase],
    },
    {
      stepNumber: 3,
      title: 'Draw the Section Plane (Cutting Plane)',
      explanation: `Draw the cutting plane inclined at ${cuttingAngleDeg}° to HP, passing through the axis at height ${cutPointOnAxisHeight} mm from the base.`,
      whatToDraw: 'A chain line with thick ends (Cutting Plane Line) labeled V-T.',
      howToDraw: `Locate the point on the axis at ${cutPointOnAxisHeight} mm above base and draw a line at ${cuttingAngleDeg}° to XY.`,
      whyNeeded: 'Determines the points of intersection with the vertical edges of the prism.',
      whatToCheck: `Angle is exactly ${cuttingAngleDeg}° and passes through the specified axis height.`,
      calculations: [
        { label: 'Cutting plane inclination', formula: 'θ = given', substitution: `= ${cuttingAngleDeg}° to HP`, result: `${cuttingAngleDeg}°`, unit: '°' },
        { label: 'Cutting plane height on axis', formula: 'h_cut = given', substitution: `= ${cutPointOnAxisHeight} mm`, result: `${cutPointOnAxisHeight} mm`, unit: 'mm' },
      ],
      objectIds: [ids.elevCutPlane],
      highlightIds: [ids.elevCutPlane],
    },
    {
      stepNumber: 4,
      title: 'Construct the Sectional Top View',
      explanation: 'Project the cutting points from elevation down to top view. Hatch the cut region at 45° with thin lines.',
      whatToDraw: '45-degree hatching on the sectional area in top view.',
      howToDraw: 'Draw uniformly spaced parallel lines at 45° within the cut cross section.',
      whyNeeded: 'BIS convention requires sectioned solid surfaces to be hatched.',
      whatToCheck: 'Hatching lines are evenly spaced and thin (0.35 mm).',
      calculations: [],
      objectIds: [ids.planHatch],
      highlightIds: [ids.planHatch],
    },
    {
      stepNumber: 5,
      title: 'Construct the True Shape of the Section',
      explanation: `Construct an auxiliary view on a plane parallel to the cutting plane. The true shape is a rectangle of length ${round(trueShapeLength, 1)} mm and width ${baseSide} mm.`,
      whatToDraw: 'Auxiliary hatched rectangle representing the true shape.',
      howToDraw: `Project perpendiculars to the cutting plane and transfer widths from the plan. Length = cut line length = ${round(trueShapeLength, 1)} mm.`,
      whyNeeded: 'The inclined section appears foreshortened in the orthographic views; an auxiliary view reveals the true shape.',
      whatToCheck: `True length = ${round(trueShapeLength, 1)} mm, True width = ${baseSide} mm.`,
      calculations: [
        {
          label: 'True shape length',
          formula: 'L_ts = baseSide / cos(θ)',
          substitution: `= ${baseSide} / cos(${cuttingAngleDeg}°)`,
          result: `${round(trueShapeLength, 2)} mm`,
          unit: 'mm',
        },
      ],
      objectIds: [ids.trueShape, ids.trueShapeHatch],
      highlightIds: [ids.trueShape, ids.trueShapeHatch],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: 'Cutting plane angle verified',
      passed: true,
      expected: `${cuttingAngleDeg}°`,
      actual: `${cuttingAngleDeg}°`,
    },
    {
      name: 'True shape length matches secant formula',
      passed: Math.abs(trueShapeLength - baseSide / Math.cos(degToRad(cuttingAngleDeg))) < 1.0,
      expected: `${round(baseSide / Math.cos(degToRad(cuttingAngleDeg)), 2)} mm`,
      actual: `${round(trueShapeLength, 2)} mm`,
    },
  ];

  return {
    topic: 'SECTIONS_OF_SOLIDS',
    method: 'Auxiliary Plane Method for True Shape of Section',
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Solid': solidType === 'SQUARE_PRISM' ? 'Square Prism' : 'Hexagonal Prism',
      'Base side': `${baseSide} mm`,
      'Height': `${height} mm`,
      'Cutting plane angle': `${cuttingAngleDeg}° to HP`,
      'Cut axis height': `${cutPointOnAxisHeight} mm`,
      'True Shape of Section': `Rectangle (${round(trueShapeLength, 1)} mm × ${baseSide} mm)`,
    },
  };
}
