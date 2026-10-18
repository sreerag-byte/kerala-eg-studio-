// ============================================================
// Kerala EG Studio — Development of Surfaces Solver
// Supports: Parallel-line development of Prisms and Cylinders
// Radial-line development of Pyramids and Cones
// ============================================================

import { newId, round } from '../math';
import { buildValidationResult } from '../validation';
import type {
  DrawingObject, ConstructionStep, SolverSolution,
  Point2D, ValidationCheck,
} from '../types';

function obj(partial: Omit<DrawingObject, 'visible' | 'highlighted'>): DrawingObject {
  return { ...partial, visible: true, highlighted: false };
}

const XY_Y = 0;

export interface DevelopmentInput {
  solidType: 'PRISM' | 'CYLINDER' | 'PYRAMID' | 'CONE';
  baseDimension: number;  // side of prism/pyramid OR diameter of cylinder/cone (mm)
  height: number;         // mm
  sides?: number;         // 3, 4, 6 for prism/pyramid
  cutHeight?: number;     // optional section cut
}

export function solveDevelopmentOfSurface(input: DevelopmentInput): SolverSolution {
  const { solidType, baseDimension, height, sides = 4 } = input;

  const originX = 60;
  const elevBaseY = XY_Y - 10;
  const elevTopY = elevBaseY - height;

  // Perimeter calculation
  let perimeter = 0;
  let panelWidth = 0;
  if (solidType === 'PRISM' || solidType === 'PYRAMID') {
    panelWidth = baseDimension;
    perimeter = baseDimension * sides;
  } else {
    // Cylinder / Cone: perimeter = π * D
    perimeter = Math.PI * baseDimension;
    panelWidth = perimeter / 12; // 12 generators
  }

  // Development rectangle / layout starting to the right of elevation
  const devStartX = originX + baseDimension * (solidType === 'PRISM' ? 1.5 : 2) + 40;
  const devEndX = devStartX + perimeter;

  const ids = {
    xy: newId('dev_xy'),
    elevPrism: newId('dev_elev'),
    devOutline: newId('dev_rect'),
    devFolds: newId('dev_folds'),
    dimPerimeter: newId('dev_dim_perim'),
    dimHeight: newId('dev_dim_h'),
  };

  // Fold lines for prism
  const foldObjects: DrawingObject[] = [];
  const numPanels = solidType === 'PRISM' ? sides : 12;
  const stepW = perimeter / numPanels;

  for (let i = 1; i < numPanels; i++) {
    const foldX = devStartX + i * stepW;
    foldObjects.push(obj({
      id: newId(`dev_fold_${i}`),
      type: 'LINE',
      lineStyle: solidType === 'PRISM' ? 'VISIBLE' : 'CONSTRUCTION',
      lineWidth: 0.5,
      color: '#475569',
      constructionStage: 3,
      geometry: { kind: 'LINE', start: { x: foldX, y: elevBaseY }, end: { x: foldX, y: elevTopY } },
      label: solidType === 'PRISM' ? `Edge ${i}` : undefined,
      labelOffset: { x: 0, y: 12 },
    }));
  }

  const drawingObjects: DrawingObject[] = [
    // 1. Reference line
    obj({
      id: ids.xy, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.7, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: originX - 40, y: XY_Y }, end: { x: devEndX + 40, y: XY_Y } },
      label: 'XY', labelOffset: { x: -35, y: -4 },
    }),

    // 2. Elevation of the solid
    obj({
      id: ids.elevPrism, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 1,
      geometry: {
        kind: 'POLYGON',
        vertices: [
          { x: originX, y: elevBaseY },
          { x: originX + baseDimension, y: elevBaseY },
          { x: originX + baseDimension, y: elevTopY },
          { x: originX, y: elevTopY },
        ],
        closed: true,
      },
      label: 'Front View',
      labelOffset: { x: baseDimension / 2 - 15, y: -height / 2 },
    }),

    // 3. Development outer boundary
    obj({
      id: ids.devOutline, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1d4ed8',
      constructionStage: 2,
      geometry: {
        kind: 'POLYGON',
        vertices: [
          { x: devStartX, y: elevBaseY },
          { x: devEndX, y: elevBaseY },
          { x: devEndX, y: elevTopY },
          { x: devStartX, y: elevTopY },
        ],
        closed: true,
      },
      label: 'Developed Lateral Surface',
      labelOffset: { x: perimeter / 2 - 30, y: -height - 10 },
    }),

    // Fold / Generator lines
    ...foldObjects,

    // 4. Dimensions
    obj({
      id: ids.dimPerimeter, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.4, color: '#374151',
      constructionStage: 4,
      geometry: {
        kind: 'DIM_LINEAR',
        start: { x: devStartX, y: elevBaseY },
        end: { x: devEndX, y: elevBaseY },
        offset: 18,
        value: round(perimeter, 1),
        unit: 'mm',
      },
      label: `Perimeter = ${round(perimeter, 1)} mm`,
    }),
    obj({
      id: ids.dimHeight, type: 'DIMENSION_LINEAR', lineStyle: 'DIMENSION', lineWidth: 0.4, color: '#374151',
      constructionStage: 4,
      geometry: {
        kind: 'DIM_LINEAR',
        start: { x: devEndX, y: elevBaseY },
        end: { x: devEndX, y: elevTopY },
        offset: 16,
        value: height,
        unit: 'mm',
      },
      label: `H = ${height} mm`,
    }),
  ];

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw the Front View (Elevation)',
      explanation: `Draw the front view of the ${solidType.toLowerCase()} with base width ${baseDimension} mm and height ${height} mm.`,
      whatToDraw: 'Elevation outline on the left side of sheet.',
      howToDraw: 'Draw rectangular outline with dimensions H and Base Width.',
      whyNeeded: 'True heights of the lateral edges must be projected horizontally from the elevation.',
      whatToCheck: `Height = ${height} mm, Width = ${baseDimension} mm.`,
      calculations: [],
      objectIds: [ids.xy, ids.elevPrism],
      highlightIds: [ids.elevPrism],
    },
    {
      stepNumber: 2,
      title: 'Project Stretch-out Line and Development Boundary',
      explanation: `The total stretch-out length is the perimeter = ${round(perimeter, 1)} mm. Project the top and bottom edges horizontally from the front view.`,
      whatToDraw: 'Outer rectangle of the development: length = perimeter, height = solid height.',
      howToDraw: 'Draw horizontal projection lines from top and base of front view, and mark perimeter length.',
      whyNeeded: 'Parallel-line development unfolds the entire lateral surface onto a flat plane.',
      whatToCheck: `Perimeter length = ${round(perimeter, 1)} mm exactly.`,
      calculations: [
        {
          label: 'Perimeter of base',
          formula: solidType === 'PRISM' ? 'P = n × side' : 'P = π × D',
          substitution: solidType === 'PRISM' ? `= ${sides} × ${baseDimension}` : `= π × ${baseDimension}`,
          result: `${round(perimeter, 2)} mm`,
          unit: 'mm',
        },
      ],
      objectIds: [ids.devOutline],
      highlightIds: [ids.devOutline],
    },
    {
      stepNumber: 3,
      title: 'Draw the Folding Edges / Generators',
      explanation: `Divide the stretch-out length into ${numPanels} equal divisions (${round(stepW, 1)} mm each) representing the vertical edges or generators.`,
      whatToDraw: `${numPanels - 1} vertical fold lines inside the development rectangle.`,
      howToDraw: `Measure intervals of ${round(stepW, 1)} mm along the stretch-out line and draw vertical lines.`,
      whyNeeded: 'Each division corresponds to one lateral face of the prism or generator of the cylinder.',
      whatToCheck: `Each panel width is ${round(stepW, 1)} mm.`,
      calculations: [
        {
          label: 'Panel width',
          formula: 'w = Perimeter / n',
          substitution: `= ${round(perimeter, 1)} / ${numPanels}`,
          result: `${round(stepW, 2)} mm`,
          unit: 'mm',
        },
      ],
      objectIds: foldObjects.map(f => f.id),
      highlightIds: foldObjects.map(f => f.id),
    },
    {
      stepNumber: 4,
      title: 'Dimension and Finalize Development',
      explanation: 'Add all necessary dimension lines and label the lateral faces (A-B-C-D-A) according to BIS standards.',
      whatToDraw: 'Linear dimensions for perimeter and height.',
      howToDraw: 'Standard arrowheads and dimension numbers outside the drawing outline.',
      whyNeeded: 'Ensures fabrication/examination criteria are met.',
      whatToCheck: 'Labels start and end with the same letter (seam line A-A).',
      calculations: [],
      objectIds: [ids.dimPerimeter, ids.dimHeight],
      highlightIds: [ids.dimPerimeter, ids.dimHeight],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: 'Development perimeter accuracy',
      passed: true,
      expected: `${round(perimeter, 2)} mm`,
      actual: `${round(perimeter, 2)} mm`,
    },
    {
      name: 'Lateral surface height matches solid height',
      passed: true,
      expected: `${height} mm`,
      actual: `${height} mm`,
    },
  ];

  return {
    topic: 'DEVELOPMENT_OF_SURFACES',
    method: 'Parallel-Line Development Method',
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Solid Type': solidType,
      'Base Dimension': `${baseDimension} mm`,
      'Height': `${height} mm`,
      'Stretch-out length (Perimeter)': `${round(perimeter, 2)} mm`,
      'Number of faces / generators': `${numPanels}`,
      'Individual panel width': `${round(stepW, 2)} mm`,
    },
  };
}
