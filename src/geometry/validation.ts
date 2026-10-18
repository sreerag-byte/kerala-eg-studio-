// ============================================================
// Kerala EG Studio — Geometry Validation
// Independent checks run after solving, before display.
// ============================================================

import { approxEqual, round, trueLengthFrom3D, degToRad } from './math';
import type { ValidationResult, ValidationCheck } from './types';

/**
 * Validate that true length satisfies L² = Δx² + Δy² + Δz².
 * Used for 3D line problems where endpoint coordinates are known.
 */
export function validateTrueLength3D(
  computedLength: number,
  dx: number,
  dy: number,
  dz: number,
  tol = 0.05
): ValidationCheck {
  const expected = trueLengthFrom3D(dx, dy, dz);
  return {
    name: 'True length check (L² = Δx² + Δy² + Δz²)',
    passed: approxEqual(computedLength, expected, tol),
    expected: `${round(expected, 2)} mm`,
    actual: `${round(computedLength, 2)} mm`,
    tolerance: tol,
  };
}

/**
 * Validate plan projection length: l_plan = L × cos(θ)
 */
export function validatePlanLength(
  computedPlan: number,
  trueLength: number,
  thetaDeg: number,
  tol = 0.05
): ValidationCheck {
  const expected = trueLength * Math.cos(degToRad(thetaDeg));
  return {
    name: `Plan projection length check (l = L·cos θ)`,
    passed: approxEqual(computedPlan, expected, tol),
    expected: `${round(expected, 2)} mm`,
    actual: `${round(computedPlan, 2)} mm`,
    tolerance: tol,
  };
}

/**
 * Validate elevation projection length: l_elev = L × cos(φ)
 */
export function validateElevationLength(
  computedElev: number,
  trueLength: number,
  phiDeg: number,
  tol = 0.05
): ValidationCheck {
  const expected = trueLength * Math.cos(degToRad(phiDeg));
  return {
    name: `Elevation projection length check (l = L·cos φ)`,
    passed: approxEqual(computedElev, expected, tol),
    expected: `${round(expected, 2)} mm`,
    actual: `${round(computedElev, 2)} mm`,
    tolerance: tol,
  };
}

/**
 * Validate that the combination of θ (inclination to HP) and φ (inclination to VP)
 * satisfies: cos²θ + cos²φ ≤ 1.
 */
export function validateThetaPhiConstraint(
  thetaDeg: number,
  phiDeg: number
): ValidationCheck {
  const sin2t = Math.sin(degToRad(thetaDeg)) ** 2;
  const sin2p = Math.sin(degToRad(phiDeg)) ** 2;
  const sum = sin2t + sin2p;
  return {
    name: 'θ–φ constraint (sin²θ + sin²φ ≤ 1)',
    passed: sum <= 1 + 1e-6,
    expected: '≤ 1.0000',
    actual: round(sum, 4).toString(),
  };
}

/**
 * Validate that a projected point is at the correct perpendicular distance
 * from the XY reference line in the elevation view.
 * For a point above HP by h mm, its elevation must be h mm above XY.
 */
export function validateElevationDistance(
  actualDistFromXY: number,
  expectedHeight: number,
  tol = 0.5
): ValidationCheck {
  return {
    name: `Elevation distance from XY`,
    passed: approxEqual(Math.abs(actualDistFromXY), Math.abs(expectedHeight), tol),
    expected: `${round(Math.abs(expectedHeight), 2)} mm from XY`,
    actual: `${round(Math.abs(actualDistFromXY), 2)} mm from XY`,
    tolerance: tol,
  };
}

/**
 * Validate that a plan (top-view) point is at the correct distance from XY.
 * For a point in front of VP by d mm, plan is d mm below XY (1st angle).
 */
export function validatePlanDistance(
  actualDistFromXY: number,
  expectedDepth: number,
  tol = 0.5
): ValidationCheck {
  return {
    name: `Plan distance from XY`,
    passed: approxEqual(Math.abs(actualDistFromXY), Math.abs(expectedDepth), tol),
    expected: `${round(Math.abs(expectedDepth), 2)} mm from XY`,
    actual: `${round(Math.abs(actualDistFromXY), 2)} mm from XY`,
    tolerance: tol,
  };
}

/** Build a ValidationResult from an array of checks. */
export function buildValidationResult(checks: ValidationCheck[]): ValidationResult {
  return {
    passed: checks.every((c) => c.passed),
    checks,
  };
}
