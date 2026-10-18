// ============================================================
// Kerala EG Studio — Geometry Solvers Automated Test Suite
// Verifies mathematical precision, BIS conventions, and constraints
// ============================================================

import { describe, it, expect } from 'vitest';
import { solvePointProjection } from '../solvers/points';
import { solveLineProjection } from '../solvers/lines';
import { solvePrismProjection } from '../solvers/solids';
import { solveSectionOfSolid } from '../solvers/sections';
import { solveDevelopmentOfSurface } from '../solvers/development';
import { solveIsometricView } from '../solvers/isometric';
import { validateThetaPhiConstraint } from '../validation';

describe('Kerala EG Studio Geometry Solver Verification', () => {

  // 1. Projection of points in all quadrants
  describe('Projection of Points', () => {
    it('correctly projects a point in Quadrant 1 (above HP, in front of VP)', () => {
      const res = solvePointProjection({ heightAboveHP: 20, depthInFrontVP: 25, label: 'A' });
      expect(res.quadrant).toBe(1);
      // In SVG: XY at y=0, above HP is negative y (-20), in front of VP is positive y (+25)
      expect(res.elevationPos.y).toBe(-20);
      expect(res.planPos.y).toBe(25);
      expect(res.validation.passed).toBe(true);
    });

    it('correctly projects a point in Quadrant 2 (above HP, behind VP)', () => {
      const res = solvePointProjection({ heightAboveHP: 30, depthInFrontVP: -35, label: 'B' });
      expect(res.quadrant).toBe(2);
      expect(res.elevationPos.y).toBe(-30);
      expect(res.planPos.y).toBe(-35); // both above XY in elevation view plane
      expect(res.validation.passed).toBe(true);
    });

    it('correctly projects a point in Quadrant 3 (below HP, behind VP)', () => {
      const res = solvePointProjection({ heightAboveHP: -25, depthInFrontVP: -40, label: 'C' });
      expect(res.quadrant).toBe(3);
      expect(res.elevationPos.y).toBe(25); // below XY
      expect(res.planPos.y).toBe(-40);    // above XY
      expect(res.validation.passed).toBe(true);
    });

    it('correctly projects a point in Quadrant 4 (below HP, in front of VP)', () => {
      const res = solvePointProjection({ heightAboveHP: -15, depthInFrontVP: 30, label: 'D' });
      expect(res.quadrant).toBe(4);
      expect(res.elevationPos.y).toBe(15);
      expect(res.planPos.y).toBe(30);
      expect(res.validation.passed).toBe(true);
    });
  });

  // 2. Projection of Straight Lines
  describe('Projection of Straight Lines', () => {
    it('projects a line inclined to both HP and VP (KTU classic: L=80, θ=30°, φ=45°)', () => {
      const res = solveLineProjection({
        trueLength: 80,
        labelA: 'A',
        labelB: 'B',
        heightA: 20,
        depthA: 25,
        thetaDeg: 30,
        phiDeg: 45,
        showTraces: true,
      });

      // Plan length = L * cos(30°) = 80 * 0.8660 = 69.28 mm
      expect(res.planLength).toBeCloseTo(69.28, 1);
      // Elevation length = L * cos(45°) = 80 * 0.7071 = 56.57 mm
      expect(res.elevLength).toBeCloseTo(56.57, 1);
      expect(res.validation.passed).toBe(true);
      expect(res.steps.length).toBeGreaterThanOrEqual(4);
    });

    it('validates theta + phi geometric constraint (sin²θ + sin²φ <= 1)', () => {
      const validCheck = validateThetaPhiConstraint(30, 45);
      // sin²(30) + sin²(45) = 0.25 + 0.5 = 0.75 <= 1 (valid)
      expect(validCheck.passed).toBe(true);

      const invalidCheck = validateThetaPhiConstraint(60, 60);
      // sin²(60) + sin²(60) = 0.75 + 0.75 = 1.5 > 1 (geometrically impossible)
      expect(invalidCheck.passed).toBe(false);
    });
  });

  // 3. Projection of Solids
  describe('Projection of Solids', () => {
    it('projects a square prism in simple position', () => {
      const res = solvePrismProjection({ sides: 4, sideLength: 40, height: 70 });
      expect(res.validation.passed).toBe(true);
      expect(res.steps.length).toBe(4);
    });
  });

  // 4. Sections of Solids
  describe('Sections of Solids', () => {
    it('computes section and true shape of a square prism cut at 45°', () => {
      const res = solveSectionOfSolid({
        baseSide: 40,
        height: 70,
        cuttingAngleDeg: 45,
        cutPointOnAxisHeight: 35,
      });
      expect(res.validation.passed).toBe(true);
      expect(res.drawingObjects.some(o => o.lineStyle === 'CUTTING_PLANE')).toBe(true);
      expect(res.drawingObjects.some(o => o.lineStyle === 'HATCHING')).toBe(true);
    });
  });

  // 5. Development of Surfaces
  describe('Development of Surfaces', () => {
    it('correctly calculates perimeter stretch-out for a square prism', () => {
      const res = solveDevelopmentOfSurface({
        solidType: 'PRISM',
        baseDimension: 40,
        height: 65,
        sides: 4,
      });
      // 4 * 40 = 160 mm
      expect(res.validation.passed).toBe(true);
      expect(res.finalValues['Stretch-out length (Perimeter)']).toContain('160');
    });
  });

  // 6. Isometric Views
  describe('Isometric Views & Projections', () => {
    it('correctly distinguishes true scale (1:1) from isometric projection (0.816)', () => {
      const viewRes = solveIsometricView({ length: 60, breadth: 40, height: 30, isProjection: false });
      expect(viewRes.finalValues['Type']).toContain('Full Scale 1:1');

      const projRes = solveIsometricView({ length: 60, breadth: 40, height: 30, isProjection: true });
      expect(projRes.finalValues['Type']).toContain('0.816');
    });
  });

  // 7. Projection of Planes
  describe('Projection of Planes', () => {
    it('projects a regular hexagonal plane inclined at 45° to HP', async () => {
      const { solvePlaneProjection } = await import('../solvers/planes');
      const res = solvePlaneProjection({
        shape: 'HEXAGON',
        dimension: 30,
        inclinationToHPDeg: 45,
      });
      expect(res.validation.passed).toBe(true);
      expect(res.steps.length).toBe(5);
      expect(res.finalValues['Plane Shape']).toBe('Hexagon');
    });
  });

  // 8. Pyramid & Round Solids
  describe('Pyramids, Cylinders, and Cones', () => {
    it('projects a square pyramid in simple position', async () => {
      const { solvePyramidProjection } = await import('../solvers/solids');
      const res = solvePyramidProjection({ sides: 4, sideLength: 40, height: 70 });
      expect(res.validation.passed).toBe(true);
      expect(res.finalValues['Solid']).toBe('4-sided Pyramid');
    });

    it('projects a cylinder and cone', async () => {
      const { solveRoundSolidProjection } = await import('../solvers/solids');
      const cylRes = solveRoundSolidProjection({ type: 'CYLINDER', diameter: 50, height: 70 });
      expect(cylRes.validation.passed).toBe(true);

      const coneRes = solveRoundSolidProjection({ type: 'CONE', diameter: 50, height: 70 });
      expect(coneRes.validation.passed).toBe(true);
    });
  });

  // 9. Perspective Projection (KTU 2019 Scheme)
  describe('Perspective Projection', () => {
    it('constructs visual-ray perspective view of a block', async () => {
      const { solvePerspectiveProjection } = await import('../solvers/perspective');
      const res = solvePerspectiveProjection({
        width: 40,
        depth: 30,
        height: 50,
        spDistanceInFrontPP: 60,
        eyeLevelAboveGL: 40,
      });
      expect(res.validation.passed).toBe(true);
      expect(res.steps.length).toBe(6);
    });
  });

  // 10. 3-Stage Solids Projection (Inclined to both HP and VP)
  describe('3-Stage Solids Projection', () => {
    it('constructs complete 3-stage drawing of square pyramid inclined to HP and VP', async () => {
      const { solveSolidsInclinedBothPlanes } = await import('../solvers/solids_inclined');
      const res = solveSolidsInclinedBothPlanes({
        solidType: 'SQUARE_PYRAMID',
        baseSide: 35,
        axisHeight: 65,
        thetaHP: 45,
        betaVP: 30,
      });
      expect(res.validation.passed).toBe(true);
      expect(res.steps.length).toBe(7);
      expect(res.drawingObjects.length).toBeGreaterThan(15);
      expect(res.finalValues['Projection Sequence']).toContain('Stage 1');
    });
  });

  // 11. 3-View Orthographic Projection (Front, Top, Side with 45° Miter line)
  describe('3-View Orthographic Projection', () => {
    it('constructs Front View, Top View, and Side View with 45° miter line', async () => {
      const { solveOrthographicThreeViews } = await import('../solvers/orthographic_views');
      const res = solveOrthographicThreeViews({
        length: 60,
        height: 45,
        width: 40,
      });
      expect(res.validation.passed).toBe(true);
      expect(res.steps.length).toBe(7);
      expect(res.finalValues['Views Drawn']).toContain('Side View');
    });
  });

  // 12. Engineering Curves
  describe('Engineering Curves', () => {
    it('constructs Involute of a circle with normal and tangent', async () => {
      const { solveEngineeringCurve } = await import('../solvers/curves');
      const res = solveEngineeringCurve({ curveType: 'INVOLUTE', diameter: 40 });
      expect(res.validation.passed).toBe(true);
      expect(res.steps.length).toBe(5);
    });

    it('constructs Cycloid curve with normal and tangent', async () => {
      const { solveEngineeringCurve } = await import('../solvers/curves');
      const res = solveEngineeringCurve({ curveType: 'CYCLOID', diameter: 50 });
      expect(res.validation.passed).toBe(true);
      expect(res.finalValues['Generating Diameter']).toBe('50 mm');
    });
  });

});
