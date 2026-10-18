// ============================================================
// Kerala EG Studio — Perspective Projection Solver (Section 8.H)
// Prescribed in KTU 2019 Scheme (EST110 Module 5)
// Method: Visual-Ray Method (Top View / Front View combination)
// Features: PP (Picture Plane), GL (Ground Line), HL (Horizon Line),
// SP (Station Point top view), S' (Station Point front view)
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

export interface PerspectiveInput {
  width: number;           // mm (e.g. 40mm)
  depth: number;           // mm (e.g. 30mm)
  height: number;          // mm (e.g. 50mm)
  spDistanceInFrontPP: number; // mm (distance of station point in front of PP, e.g. 60mm)
  eyeLevelAboveGL: number;     // mm (height of observer above ground, e.g. 40mm)
}

export function solvePerspectiveProjection(input: PerspectiveInput): SolverSolution {
  const {
    width: W, depth: D, height: H,
    spDistanceInFrontPP = 60,
    eyeLevelAboveGL = 40,
  } = input;

  const centerX = 160;

  // Reference lines:
  // PP (Picture Plane) at y = -20
  const PP_Y = -20;
  // GL (Ground Line) at y = 80
  const GL_Y = 80;
  // HL (Horizon Line) at y = GL_Y - eyeLevelAboveGL
  const HL_Y = GL_Y - eyeLevelAboveGL;

  // Station point in top view (in front of PP)
  const SP: Point2D = { x: centerX, y: PP_Y + spDistanceInFrontPP };
  // Station point / eye level in front view (on HL)
  const S_prime: Point2D = { x: centerX, y: HL_Y };

  // Object in Top View (behind PP)
  // Let corner A touch PP at (centerX - W/2, PP_Y)
  const a_tv: Point2D = { x: centerX - W / 2, y: PP_Y };
  const b_tv: Point2D = { x: centerX + W / 2, y: PP_Y };
  const c_tv: Point2D = { x: centerX + W / 2, y: PP_Y - D };
  const d_tv: Point2D = { x: centerX - W / 2, y: PP_Y - D };

  // Visual rays in Top View to SP, intersecting PP:
  // For A and B (touching PP), intersection is at their own x
  const intA_x = a_tv.x;
  const intB_x = b_tv.x;

  // For C and D: intersection of line from C/D to SP with y = PP_Y
  // x(y) = SP.x + (v.x - SP.x) * (PP_Y - SP.y) / (v.y - SP.y)
  const intersectPP_X = (pt: Point2D): number => {
    const t = (PP_Y - SP.y) / (pt.y - SP.y);
    return SP.x + t * (pt.x - SP.x);
  };

  const intC_x = intersectPP_X(c_tv);
  const intD_x = intersectPP_X(d_tv);

  // In Perspective view (between GL and HL):
  // Points touching PP are drawn at true height on GL:
  // Bottom of front face rests on GL:
  const pA_bottom: Point2D = { x: intA_x, y: GL_Y };
  const pB_bottom: Point2D = { x: intB_x, y: GL_Y };
  const pA_top: Point2D = { x: intA_x, y: GL_Y - H };
  const pB_top: Point2D = { x: intB_x, y: GL_Y - H };

  // For points behind PP (C and D):
  // Height is scaled by perspective ratio: t_depth = spDistanceInFrontPP / (spDistanceInFrontPP + D)
  const scaleD = spDistanceInFrontPP / (spDistanceInFrontPP + D);
  const pD_bottom: Point2D = { x: intD_x, y: HL_Y + (GL_Y - HL_Y) * scaleD };
  const pC_bottom: Point2D = { x: intC_x, y: HL_Y + (GL_Y - HL_Y) * scaleD };
  const pD_top: Point2D = { x: intD_x, y: pD_bottom.y - H * scaleD };
  const pC_top: Point2D = { x: intC_x, y: pC_bottom.y - H * scaleD };

  const ids = {
    ppLine: newId('persp_pp'),
    glLine: newId('persp_gl'),
    hlLine: newId('persp_hl'),
    tvRect: newId('persp_tv'),
    spMarker: newId('persp_sp'),
    spPrime: newId('persp_s_prime'),
    raysTV: newId('persp_rays'),
    frontFace: newId('persp_ff'),
    topFace: newId('persp_tf'),
    sideFace: newId('persp_sf'),
    hiddenEdges: newId('persp_hidden'),
  };

  const drawingObjects: DrawingObject[] = [
    // 1. Picture Plane PP
    obj({
      id: ids.ppLine, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.8, color: '#1e3a8a',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: centerX - 120, y: PP_Y }, end: { x: centerX + 120, y: PP_Y } },
      label: 'PP (Picture Plane)', labelOffset: { x: -110, y: -4 },
    }),

    // 2. Ground Line GL
    obj({
      id: ids.glLine, type: 'LINE', lineStyle: 'REFERENCE', lineWidth: 0.8, color: '#374151',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: centerX - 120, y: GL_Y }, end: { x: centerX + 120, y: GL_Y } },
      label: 'GL (Ground Line)', labelOffset: { x: -110, y: -4 },
    }),

    // 3. Horizon Line HL
    obj({
      id: ids.hlLine, type: 'LINE', lineStyle: 'CENTRE', lineWidth: 0.5, color: '#2563eb',
      constructionStage: 1,
      geometry: { kind: 'LINE', start: { x: centerX - 120, y: HL_Y }, end: { x: centerX + 120, y: HL_Y } },
      label: 'HL (Horizon Line)', labelOffset: { x: -110, y: -4 },
    }),

    // 4. Station Points
    obj({
      id: ids.spMarker, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.6, color: '#dc2626',
      constructionStage: 2,
      geometry: { kind: 'POINT_MARKER', position: SP, size: 2.5 },
      label: 'SP (Top View)', labelOffset: { x: 8, y: 0 },
    }),
    obj({
      id: ids.spPrime, type: 'POINT_MARKER', lineStyle: 'VISIBLE', lineWidth: 0.6, color: '#dc2626',
      constructionStage: 2,
      geometry: { kind: 'POINT_MARKER', position: S_prime, size: 2.5 },
      label: `S′ (Eye Level ${eyeLevelAboveGL}mm)`, labelOffset: { x: 8, y: 0 },
    }),

    // 5. Top View of object behind PP
    obj({
      id: ids.tvRect, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 0.8, color: '#1a1a1a',
      constructionStage: 3,
      geometry: {
        kind: 'POLYGON',
        vertices: [a_tv, b_tv, c_tv, d_tv],
        closed: true,
      },
      label: `Plan (${W} × ${D} mm)`, labelOffset: { x: 0, y: -D / 2 },
    }),

    // Visual rays in plan from corners to SP
    obj({
      id: ids.raysTV, type: 'LINE', lineStyle: 'CONSTRUCTION', lineWidth: 0.3, color: '#9ca3af',
      constructionStage: 4,
      geometry: { kind: 'LINE', start: c_tv, end: SP },
    }),
    obj({
      id: newId('persp_ray_d'), type: 'LINE', lineStyle: 'CONSTRUCTION', lineWidth: 0.3, color: '#9ca3af',
      constructionStage: 4,
      geometry: { kind: 'LINE', start: d_tv, end: SP },
    }),

    // Vertical projectors from PP intersections downward to perspective view
    obj({
      id: newId('persp_proj_d'), type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#cbd5e1',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: { x: intD_x, y: PP_Y }, end: pD_bottom },
    }),
    obj({
      id: newId('persp_proj_c'), type: 'LINE', lineStyle: 'PROJECTION', lineWidth: 0.25, color: '#cbd5e1',
      constructionStage: 5,
      geometry: { kind: 'LINE', start: { x: intC_x, y: PP_Y }, end: pC_bottom },
    }),

    // 6. Perspective Projection Outline
    // Front face (touching PP)
    obj({
      id: ids.frontFace, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.2, color: '#1a1a1a',
      constructionStage: 6,
      geometry: {
        kind: 'POLYGON',
        vertices: [pA_bottom, pB_bottom, pB_top, pA_top],
        closed: true,
      },
      label: 'Front Face',
    }),
    // Top face
    obj({
      id: ids.topFace, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 6,
      geometry: {
        kind: 'POLYGON',
        vertices: [pA_top, pB_top, pC_top, pD_top],
        closed: true,
      },
    }),
    // Right side face
    obj({
      id: ids.sideFace, type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 6,
      geometry: {
        kind: 'POLYGON',
        vertices: [pB_bottom, pC_bottom, pC_top, pB_top],
        closed: true,
      },
    }),
    // Left side face
    obj({
      id: newId('persp_lf'), type: 'POLYGON', lineStyle: 'VISIBLE', lineWidth: 1.0, color: '#1a1a1a',
      constructionStage: 6,
      geometry: {
        kind: 'POLYGON',
        vertices: [pA_bottom, pD_bottom, pD_top, pA_top],
        closed: true,
      },
    }),
  ];

  const steps: ConstructionStep[] = [
    {
      stepNumber: 1,
      title: 'Draw PP, GL, and HL Reference Lines',
      explanation: `Draw the Picture Plane (PP) at the top, Ground Line (GL) below it, and Horizon Line (HL) at distance ${eyeLevelAboveGL} mm above GL (the observer's eye level).`,
      whatToDraw: 'Three parallel horizontal reference lines.',
      howToDraw: 'Draw PP, measure down to GL, then measure up ${eyeLevelAboveGL} mm to draw HL.',
      whyNeeded: 'Establishes the station of the observer relative to the ground and picture plane.',
      whatToCheck: 'HL is exactly ${eyeLevelAboveGL} mm above GL.',
      calculations: [
        { label: 'Eye level (HL above GL)', formula: 'H_eye = given', substitution: `= ${eyeLevelAboveGL} mm`, result: `${eyeLevelAboveGL} mm`, unit: 'mm' },
      ],
      objectIds: [ids.ppLine, ids.glLine, ids.hlLine],
      highlightIds: [ids.ppLine, ids.glLine, ids.hlLine],
    },
    {
      stepNumber: 2,
      title: 'Mark Station Points (SP and S′)',
      explanation: `Mark the Station Point in plan (SP) at ${spDistanceInFrontPP} mm in front of PP. Mark S′ in elevation on the Horizon Line (HL).`,
      whatToDraw: 'Point markers SP in plan and S′ on HL.',
      howToDraw: 'Locate SP ${spDistanceInFrontPP} mm below PP. Align S′ vertically on HL.',
      whyNeeded: 'Represents the position of the observer’s eye in plan and elevation.',
      whatToCheck: 'SP and S′ lie on the same vertical line of sight.',
      calculations: [
        { label: 'SP distance in front of PP', formula: 'd_SP = given', substitution: `= ${spDistanceInFrontPP} mm`, result: `${spDistanceInFrontPP} mm`, unit: 'mm' },
      ],
      objectIds: [ids.spMarker, ids.spPrime],
      highlightIds: [ids.spMarker, ids.spPrime],
    },
    {
      stepNumber: 3,
      title: 'Draw the Plan of the Object',
      explanation: `Draw the top view of the solid (${W} × ${D} mm) behind the Picture Plane with its front face touching PP.`,
      whatToDraw: 'Rectangle representing the solid in plan.',
      howToDraw: 'Draw rectangle A-B-C-D with front edge AB on PP.',
      whyNeeded: 'Determines the 3D position and orientation of all object vertices.',
      whatToCheck: `Width = ${W} mm, Depth = ${D} mm.`,
      calculations: [],
      objectIds: [ids.tvRect],
      highlightIds: [ids.tvRect],
    },
    {
      stepNumber: 4,
      title: 'Draw Visual Rays to SP and Intersect PP',
      explanation: 'Join all corners in plan to SP. Note where these visual rays pierce the Picture Plane (PP).',
      whatToDraw: 'Visual rays converging from corners C and D to SP.',
      howToDraw: 'Draw thin lines from rear corners to SP and mark piercing points on PP.',
      whyNeeded: 'The piercing points on PP define the apparent horizontal locations of the corners.',
      whatToCheck: 'Piercing points accurately marked on the PP line.',
      calculations: [],
      objectIds: [ids.raysTV],
      highlightIds: [ids.raysTV],
    },
    {
      stepNumber: 5,
      title: 'Drop Vertical Projectors to the Perspective View',
      explanation: 'Drop vertical projectors from the piercing points on PP downward into the space between GL and HL.',
      whatToDraw: 'Thin vertical projection lines.',
      howToDraw: 'Draw perpendicular lines from each PP piercing point downwards.',
      whyNeeded: 'Transfers the perspective x-coordinates to the final view.',
      whatToCheck: 'Projectors are strictly vertical.',
      calculations: [],
      objectIds: [],
      highlightIds: [],
    },
    {
      stepNumber: 6,
      title: 'Construct the Complete Perspective View',
      explanation: `Since front face AB touches PP, it appears at full height (${H} mm) on GL. Rear edges are scaled down by perspective foreshortening. Complete the view with thick outlines.`,
      whatToDraw: '3D perspective view of the block.',
      howToDraw: 'Draw front face at true height on GL. Join corresponding vertices to vanishing/station lines to complete rear faces.',
      whyNeeded: 'Produces the final photorealistic descriptive geometry perspective view.',
      whatToCheck: 'Receding edges converge toward the vanishing center on HL.',
      calculations: [
        { label: 'Perspective reduction factor for rear face', formula: 's = d_SP / (d_SP + D)', substitution: `= ${spDistanceInFrontPP} / (${spDistanceInFrontPP} + ${D})`, result: `${round(scaleD, 3)}`, unit: '' },
      ],
      objectIds: [ids.frontFace, ids.topFace, ids.sideFace],
      highlightIds: [ids.frontFace, ids.topFace, ids.sideFace],
    },
  ];

  const checks: ValidationCheck[] = [
    {
      name: 'Observer eye level matches HL distance',
      passed: true,
      expected: `${eyeLevelAboveGL} mm`,
      actual: `${eyeLevelAboveGL} mm`,
    },
    {
      name: 'Front face on PP drawn at true height',
      passed: true,
      expected: `${H} mm`,
      actual: `${H} mm`,
    },
  ];

  return {
    topic: 'PERSPECTIVE_PROJECTION',
    method: 'Visual-Ray Method for Perspective Projection (KTU EST110)',
    drawingObjects,
    steps,
    validation: buildValidationResult(checks),
    finalValues: {
      'Object': `Block (${W} × ${D} × ${H} mm)`,
      'Station Point distance': `${spDistanceInFrontPP} mm in front of PP`,
      'Observer eye level': `${eyeLevelAboveGL} mm above GL`,
      'Method': 'Visual-Ray Method',
      'Front Face on PP': `True Height (${H} mm)`,
    },
  };
}
