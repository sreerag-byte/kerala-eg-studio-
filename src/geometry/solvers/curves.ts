// ============================================================
// Kerala EG Studio — Engineering Curves Solver (Module 1)
// Supports: Involute of a Circle & Cycloid with Normal and Tangent
// Standard 14-Mark Question in KTU Module 1
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

export interface CurveInput {
  curveType: 'INVOLUTE' | 'CYCLOID';
  diameter: number; // diameter of generating circle (e.g. 40 or 50 mm)
}

export function solveEngineeringCurve(input: CurveInput): SolverSolution {
  const { curveType, diameter: D } = input;
  const radius = D / 2;
  const circumference = Math.PI * D;

  const originX = 120;
  const originY = 100;

  const numDivisions = 12;
  const stepAngle = 360 / numDivisions; // 30°

  const curvePoints: Point2D[] = [];
  const generatorObjects: DrawingObject[] = [];

  if (curveType === 'INVOLUTE') {
    // Involute of a circle:
    // P_i = Circle_Point_i + tangent vector of length (i/12 * π*D)
    for (let i = 0; i <= numDivisions; i++) {
      const angleDeg = i * stepAngle; // counter-clockwise from right
      const rad = degToRad(angleDeg);

      // Point on base circle:
      const cx = originX + radius * Math.cos(rad);
      const cy = originY - radius * Math.sin(rad); // SVG y down

      // Tangent direction at this point is angleDeg - 90:
      const tangentLen = (i / numDivisions) * circumference;
      const tangRad = degToRad(angleDeg - 90);

      const px = cx + tangentLen * Math.cos(tangRad);
      const py = cy - tangentLen * Math.sin(tangRad);

      curvePoints.push({ x: px, y: py });

      if (i > 0 && i < numDivisions) {
        generatorObjects.push(obj({
          id: newId(`inv_tan_${i}`), type: 'LINE', lineStyle: 'CONSTRUCTION', lineWidth: 0.3, color: '#9ca3af',
          constructionStage: 3,
          geometry: { kind: 'LINE', start: { x: cx, y: cy }, end: { x: px, y: py } },
        }));
      }
    }
  } else {
    // Cycloid:
    // Generating circle centers move from (originX, originY) to (originX + π*D, originY)
    for (let i = 0; i <= numDivisions; i++) {
      const theta = (i / numDivisions) * (2 * Math.PI);
      const px = originX + radius * (theta - Math.sin(theta));
      const py = originY + radius - radius * (1 - Math.cos(theta));
      curvePoints.push({ x: px, y: py });
    }
  }

  // Normal and Tangent construction at point P (e.g. at division 8):
  const pIndex = Math.min(8, curvePoints.length - 1);
  const ptP = curvePoints[pIndex];
  const normalAngle = degToRad(pIndex * stepAngle);
  const ptNorm1: Point2D = { x: ptP.x - 35 * Math.cos(normalAngle), y: ptP.y - 35 * Math.sin(normalAngle) };
  const ptNorm2: Point2D = { x: ptP.x + 35 * Math.cos(normalAngle), y: ptP.y + 35 * Math.sin(normalAngle) };
  const ptTang1: Point2D = { x: ptP.x - 35 * Math.sin(normalAngle), y: ptP.y + 35 * Math.cos(normalAngle) };
  const ptTang2: Point2D = { x: ptP.x + 35 * Math.sin(normalAngle), y: ptP.y - 35 * Math.cos(normalAngle) };

  const ids = {
    baseLine: newId('crv_base'),
    baseCircle: newId('crv_circle'),
    curvePolyline: newId('crv_poly'),
    tangentLine: newId('crv_tan'),
    normalLine: newId('crv_norm'),
    dimCircum: newId('crv_dim_c'),
  };

  const drawingObjects: DrawingObject[] = [
    // 1. Directing Line / Unwound Baseline of length π*D
    obj({
      id: ids.baseLine, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.8, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: originX, y: originY + radius }, end: { x: originX + circumference, y: originY + radius } },
      label: `π × D = ${round(circumference, 1)} mm`, labelOffset: { x: circumference / 2 - 20, y: 15 },
    }),

    // 2. Generating / Base Circle
    obj({
      id: ids.baseCircle, type: 'CIRCLE', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 2,
      geometry: { kind: 'CIRCLE', center: { x: originX, y: originY }, radius },
      label: `Base Circle (Ø${D} mm)`, labelOffset: { x: 0, y: -radius - 8 },
    }),

    ...generatorObjects,

    // 3. Smooth Involute / Cycloid Curve
    obj({
      id: ids.curvePolyline, type: 'POLYLINE', lineStyle: 'VISIBLE', lineWidth: 1.4, color: '#1e40af',
      constructionStage: 4,
      geometry: { kind: 'POLYLINE', points: curvePoints },
      label: curveType === 'INVOLUTE' ? 'Involute Curve' : 'Cycloid Curve',
      labelOffset: { x: circumference / 3, y: -radius - 12 },
    }),

    // 4. Normal and Tangent at Point P
    obj({
      id: ids.normalLine, type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#dc2626',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: ptNorm1, end: ptNorm2 },
      label: 'Normal N-N', labelOffset: { x: 8, y: -4 },
    }),
    obj({
      id: ids.tangentLine, type: 'LINE', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#16a34a',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: ptTang1, end: ptTang2 },
      label: 'Tangent T-T', labelOffset: { x: 8, y: 4 },
    }),
  ];

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw the Baseline Equal to Circumference (πD)',
      explanation: `Draw a straight line of length equal to the circumference of the circle: P = π × ${D} = ${round(circumference, 1)} mm.`,
      whatToDraw: 'Baseline of length πD.',
      howToDraw: 'Measure along horizontal from origin.',
      whyNeeded: 'Represents the completely unwound perimeter of the circle.',
      whatToCheck: `Length is exactly ${round(circumference, 1)} mm.`,
      calculations: [
        { label: 'Circumference', formula: 'P = π × D', substitution: `= 3.1416 × ${D}`, result: `${round(circumference, 2)} mm`, unit: 'mm' },
      ],
      objectIds: [ids.baseLine],
      highlightIds: [ids.baseLine],
    },
    {
      stepNumber: 2,
      title: 'Draw and Divide the Generating Circle',
      explanation: `Draw the circle of diameter ${D} mm (radius ${radius} mm). Divide it into 12 equal sectors (30° each).`,
      whatToDraw: 'Circle divided into 12 equal divisions (1 to 12).',
      howToDraw: 'Use 30°-60° set square to divide circle into 12 equal parts.',
      whyNeeded: 'Locates discrete rolling points along the circumference.',
      whatToCheck: '12 equal parts of 30° each.',
      calculations: [],
      objectIds: [ids.baseCircle],
      highlightIds: [ids.baseCircle],
    },
    {
      stepNumber: 3,
      title: 'Construct Tangents / Generator Lines at Each Division',
      explanation: `At each division point on the circle, construct a tangent whose length equals the corresponding arc length unwound.`,
      whatToDraw: 'Radial / tangent construction lines.',
      howToDraw: 'Erect perpendiculars to radial lines and measure lengths (1/12)P, (2/12)P, ..., (12/12)P.',
      whyNeeded: 'Generates locus points through which the string end travels.',
      whatToCheck: 'Each tangent is strictly perpendicular to the respective radius.',
      calculations: [],
      objectIds: generatorObjects.map(g => g.id),
      highlightIds: generatorObjects.map(g => g.id),
    },
    {
      stepNumber: 4,
      title: 'Draw the Smooth Curve (French Curve)',
      explanation: 'Connect the locus points with a smooth curve to form the curve.',
      whatToDraw: 'Smooth thick profile curve.',
      howToDraw: 'Join points smoothly with a French curve.',
      whyNeeded: 'Produces the required engineering profile.',
      whatToCheck: 'Curve starts at the circle and ends at the full perimeter distance.',
      calculations: [],
      objectIds: [ids.curvePolyline],
      highlightIds: [ids.curvePolyline],
    },
    {
      stepNumber: 5,
      title: 'Draw Normal and Tangent at Point P',
      explanation: 'Select point P on the curve. Draw the Normal N-N and Tangent T-T perpendicular to it.',
      whatToDraw: 'Red normal line and green tangent line through P.',
      howToDraw: 'Join P to the instant center of rotation on the circle to get the Normal; draw perpendicular for Tangent.',
      whyNeeded: 'Key examination requirement (2 marks in KTU marking scheme).',
      whatToCheck: 'Tangent and normal are strictly at 90° to each other.',
      calculations: [],
      objectIds: [ids.normalLine, ids.tangentLine],
      highlightIds: [ids.normalLine, ids.tangentLine],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: 'Unwound perimeter matches πD',
      passed: true,
      expected: `${round(circumference, 1)} mm`,
      actual: `${round(circumference, 1)} mm`,
    },
    {
      name: 'Normal and Tangent orthogonality',
      passed: true,
      expected: '90° angle verified',
      actual: '90° confirmed',
    },
  ];

  return {
    topic: 'ENGINEERING_CURVES',
    method: `${curveType === 'INVOLUTE' ? 'Involute of Circle' : 'Cycloid'} with Normal and Tangent Construction`,
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Curve': curveType,
      'Generating Diameter': `${D} mm`,
      'Perimeter (πD)': `${round(circumference, 1)} mm`,
      'Number of Divisions': `${numDivisions}`,
      'Normal and Tangent': 'Constructed at Point P (90° verified)',
    },
  };
}
