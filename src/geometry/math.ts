// ============================================================
// Kerala EG Studio — Core Math Utilities
// Pure functions: no React, no side effects, fully testable.
// ============================================================

import type { Point2D } from './types';

/** Convert degrees to radians. */
export const degToRad = (deg: number): number => (deg * Math.PI) / 180;

/** Convert radians to degrees. */
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

/** Euclidean distance between two 2D points. */
export const distance = (a: Point2D, b: Point2D): number =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

/** Euclidean distance in 3D. */
export const distance3D = (
  x: number, y: number, z: number
): number => Math.sqrt(x ** 2 + y ** 2 + z ** 2);

/** Angle of line from a to b, in degrees, measured from +x axis. */
export const angleDeg = (a: Point2D, b: Point2D): number =>
  radToDeg(Math.atan2(b.y - a.y, b.x - a.x));

/** Translate a point by (dx, dy). */
export const translate = (p: Point2D, dx: number, dy: number): Point2D =>
  ({ x: p.x + dx, y: p.y + dy });

/** Rotate a point around an origin by angleDeg degrees (CCW). */
export const rotatePoint = (
  p: Point2D,
  origin: Point2D,
  angleDegrees: number
): Point2D => {
  const r = degToRad(angleDegrees);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return {
    x: origin.x + dx * Math.cos(r) - dy * Math.sin(r),
    y: origin.y + dx * Math.sin(r) + dy * Math.cos(r),
  };
};

/** Mirror a point across a horizontal line y = lineY. */
export const mirrorY = (p: Point2D, lineY: number): Point2D =>
  ({ x: p.x, y: 2 * lineY - p.y });

/** Mirror a point across a vertical line x = lineX. */
export const mirrorX = (p: Point2D, lineX: number): Point2D =>
  ({ x: 2 * lineX - p.x, y: p.y });

/** Clamp a value within [min, max]. */
export const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val));

/** Round to n decimal places. */
export const round = (val: number, decimals = 2): number =>
  Math.round(val * 10 ** decimals) / 10 ** decimals;

/** Linear interpolation between a and b at parameter t in [0,1]. */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * clamp(t, 0, 1);

/** Linearly interpolate between two 2D points. */
export const lerpPoint = (a: Point2D, b: Point2D, t: number): Point2D => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

/** Check if two numbers are equal within tolerance. */
export const approxEqual = (a: number, b: number, tol = 0.01): boolean =>
  Math.abs(a - b) <= tol;

/** Generate a unique ID for drawing objects. */
let _idCounter = 0;
export const newId = (prefix = 'obj'): string =>
  `${prefix}_${++_idCounter}`;

/** Reset ID counter (for testing). */
export const resetIdCounter = (): void => { _idCounter = 0; };

// ============================================================
// Engineering Graphics–specific math
// ============================================================

/**
 * Given a line's 3D endpoint displacement components
 * (horizontal plan-projection length, height difference, and
 * frontal VP-projection length), compute the true length.
 * This is NOT the general 3D distance formula —
 * it uses the orthographic projection decomposition:
 *   L² = l_HP² + h²
 * where l_HP is plan length and h is height difference.
 * Equivalently, L² = l_VP² + d²
 * where l_VP is elevation length and d is depth difference.
 *
 * For a complete check use all three:
 *   L² = Δx² + Δy² + Δz² (true 3D distance)
 */
export const trueLengthFrom3D = (
  deltaX: number, // difference in VP direction (depth)
  deltaY: number, // difference in height (above/below HP)
  deltaZ: number  // difference in HP direction (left/right on plan)
): number => Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);

/**
 * True inclination to HP (theta): angle of line with HP.
 * theta = arcsin(Δheight / TrueLength)
 * OR equivalently arctan(Δheight / planProjectionLength)
 */
export const inclinationToHP = (
  heightDiff: number,
  trueLength: number
): number => radToDeg(Math.asin(Math.abs(heightDiff) / trueLength));

/**
 * True inclination to VP (phi): angle of line with VP.
 * phi = arcsin(ΔdepthFromVP / TrueLength)
 */
export const inclinationToVP = (
  depthDiff: number,
  trueLength: number
): number => radToDeg(Math.asin(Math.abs(depthDiff) / trueLength));

/**
 * Apparent inclination in elevation (alpha_e):
 * angle of the front-view line with XY.
 * alpha_e = arctan(Δheight / planProjectionLength)
 * NOTE: This is NOT the same as true inclination to HP.
 */
export const apparentInclinationInElevation = (
  heightDiff: number,
  planProjectionLength: number
): number => radToDeg(Math.atan2(Math.abs(heightDiff), planProjectionLength));

/**
 * Apparent inclination in plan (alpha_p):
 * angle of the top-view line with XY.
 */
export const apparentInclinationInPlan = (
  depthDiff: number,
  elevationProjectionLength: number
): number =>
  radToDeg(Math.atan2(Math.abs(depthDiff), elevationProjectionLength));

/**
 * For a line inclined at theta to HP and phi to VP with true length L:
 *   plan length (horizontal trace of elevation) = L * cos(theta)
 *   elevation length = L * cos(phi)
 *   Constraint: cos²(theta) + cos²(phi) ≤ 1
 *              (both inclinations cannot be independent)
 * Returns true if the combination is geometrically possible.
 */
export const validateLineThetaPhi = (
  thetaDeg: number,
  phiDeg: number
): { valid: boolean; reason: string } => {
  const sinT = Math.sin(degToRad(thetaDeg));
  const sinP = Math.sin(degToRad(phiDeg));
  const sum = sinT ** 2 + sinP ** 2;
  if (sum > 1 + 1e-6) {
    return {
      valid: false,
      reason: `sin²(θ) + sin²(φ) = ${round(sum, 4)} > 1. The given inclinations are geometrically impossible for a straight line.`,
    };
  }
  return { valid: true, reason: 'Inclination combination is geometrically valid.' };
};

/**
 * Compute horizontal component h given true length L and inclination theta to HP.
 * h = L * cos(theta)  (plan projection length)
 */
export const planProjectionLength = (
  trueLength: number,
  thetaDeg: number
): number => trueLength * Math.cos(degToRad(thetaDeg));

/**
 * Compute vertical component v given true length L and inclination phi to VP.
 * v = L * cos(phi)  (elevation projection length)
 */
export const elevProjectionLength = (
  trueLength: number,
  phiDeg: number
): number => trueLength * Math.cos(degToRad(phiDeg));

/**
 * Isometric scale factor.
 * In an isometric PROJECTION, lengths are foreshortened by cos(35.26°) ≈ 0.8165.
 * In an isometric VIEW (commonly drawn without reduction), scale = 1.0.
 */
export const ISOMETRIC_SCALE_FACTOR = Math.cos(degToRad(35.264)); // ≈ 0.8165

/**
 * Isometric axis angles (from horizontal):
 * - Left axis: 150° from +x (30° from horizontal, going left-up)
 * - Right axis: 30° from +x (going right-up)
 * - Vertical axis: 90° (straight up)
 */
export const ISOMETRIC_AXES = {
  right: degToRad(30),   // right isometric axis
  left: degToRad(150),   // left isometric axis
  vertical: degToRad(90), // vertical axis
};

/**
 * Project a 3D isometric point to 2D SVG coordinates.
 * x3d: right, y3d: up, z3d: toward viewer (depth)
 */
export const isoProject = (
  x3d: number,
  y3d: number,
  z3d: number,
  scale = 1.0
): Point2D => {
  const px = (x3d - z3d) * Math.cos(degToRad(30)) * scale;
  const py = ((x3d + z3d) * Math.sin(degToRad(30)) - y3d) * scale;
  return { x: px, y: py };
};

/**
 * Returns N evenly-spaced points on a regular polygon inscribed in a circle.
 * Points start at topmost vertex (90° from +x axis).
 * center: polygon center; radius: circumradius; n: number of sides.
 */
export const regularPolygonVertices = (
  center: Point2D,
  circumradius: number,
  n: number,
  startAngleDeg = 90
): Point2D[] => {
  const verts: Point2D[] = [];
  for (let i = 0; i < n; i++) {
    const angle = degToRad(startAngleDeg + (360 / n) * i);
    verts.push({
      x: center.x + circumradius * Math.cos(angle),
      y: center.y - circumradius * Math.sin(angle), // SVG y is down
    });
  }
  return verts;
};

/**
 * Circumradius of a regular polygon given side length s and n sides:
 * R = s / (2 * sin(π/n))
 */
export const circumradiusFromSide = (s: number, n: number): number =>
  s / (2 * Math.sin(Math.PI / n));

/**
 * Inradius (apothem) of a regular polygon given side length s and n sides:
 * r = s / (2 * tan(π/n))
 */
export const inradiusFromSide = (s: number, n: number): number =>
  s / (2 * Math.tan(Math.PI / n));
