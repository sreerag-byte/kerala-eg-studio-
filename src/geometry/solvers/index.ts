// ============================================================
// Kerala EG Studio — Master Geometry Solver Dispatcher
// Dispatches structured question data to the verified mathematical solvers.
// ============================================================

import type { SolverSolution, ExtractedQuestionData } from '../types';
import { solvePointProjection, type PointProjectionInput } from './points';
import { solveLineProjection, type LineProjectionInput } from './lines';
import {
  solvePrismProjection, solvePyramidProjection, solveRoundSolidProjection,
  type PrismInput, type PyramidInput, type RoundSolidInput,
} from './solids';
import { solveSolidsInclinedBothPlanes, type SolidsInclinedInput } from './solids_inclined';
import { solvePlaneProjection, type PlaneProjectionInput } from './planes';
import { solveSectionOfSolid, type SectionPrismInput } from './sections';
import { solveDevelopmentOfSurface, type DevelopmentInput } from './development';
import { solveIsometricView, type IsometricInput } from './isometric';
import { solvePerspectiveProjection, type PerspectiveInput } from './perspective';
import { solveOrthographicThreeViews, type OrthographicInput } from './orthographic_views';
import { solveEngineeringCurve, type CurveInput } from './curves';
import { parseQuestionRuleBased } from './parser';

export {
  solvePointProjection,
  solveLineProjection,
  solvePlaneProjection,
  solvePrismProjection,
  solvePyramidProjection,
  solveRoundSolidProjection,
  solveSolidsInclinedBothPlanes,
  solveSectionOfSolid,
  solveDevelopmentOfSurface,
  solveIsometricView,
  solvePerspectiveProjection,
  solveOrthographicThreeViews,
  solveEngineeringCurve,
  parseQuestionRuleBased,
};

export function solveFromExtractedData(data: ExtractedQuestionData): SolverSolution {
  const pMap = new Map<string, any>();
  for (const p of data.parameters) {
    pMap.set(p.name, p.value);
  }

  switch (data.topic) {
    case 'PROJECTION_OF_POINTS': {
      const input: PointProjectionInput = {
        heightAboveHP: Number(pMap.get('heightAboveHP') ?? 20),
        depthInFrontVP: Number(pMap.get('depthInFrontVP') ?? 25),
        label: String(pMap.get('label') ?? 'A'),
      };
      return solvePointProjection(input);
    }

    case 'PROJECTION_OF_LINES': {
      const input: LineProjectionInput = {
        trueLength: Number(pMap.get('trueLength') ?? 80),
        labelA: String(pMap.get('labelA') ?? 'A'),
        labelB: String(pMap.get('labelB') ?? 'B'),
        heightA: Number(pMap.get('heightA') ?? 20),
        depthA: Number(pMap.get('depthA') ?? 25),
        thetaDeg: Number(pMap.get('thetaDeg') ?? 30),
        phiDeg: Number(pMap.get('phiDeg') ?? 45),
        showTraces: Boolean(pMap.get('showTraces') ?? false),
      };
      return solveLineProjection(input);
    }

    case 'PROJECTION_OF_PLANES': {
      const input: PlaneProjectionInput = {
        shape: (pMap.get('shape') as any) ?? 'HEXAGON',
        dimension: Number(pMap.get('dimension') ?? 30),
        inclinationToHPDeg: Number(pMap.get('inclinationToHPDeg') ?? 45),
        edgeOnHP: Boolean(pMap.get('edgeOnHP') ?? true),
      };
      return solvePlaneProjection(input);
    }

    case 'PROJECTION_OF_SOLIDS': {
      const isThreeStage = Boolean(pMap.get('isThreeStage')) || (pMap.has('thetaHP') && pMap.has('betaVP'));
      if (isThreeStage) {
        const input: SolidsInclinedInput = {
          solidType: (pMap.get('solidType') as any) || (String(pMap.get('solidKind')).includes('PRISM') ? 'HEXAGONAL_PRISM' : 'SQUARE_PYRAMID'),
          baseSide: Number(pMap.get('baseSide') || pMap.get('sideLength') || 35),
          axisHeight: Number(pMap.get('axisHeight') || pMap.get('height') || 65),
          thetaHP: Number(pMap.get('thetaHP') ?? 45),
          betaVP: Number(pMap.get('betaVP') ?? 30),
        };
        return solveSolidsInclinedBothPlanes(input);
      }

      const solidKind = String(pMap.get('solidKind') || pMap.get('solidType') || 'PRISM').toUpperCase();
      if (solidKind.includes('PYRAMID')) {
        const pyrInput: PyramidInput = {
          sides: Number(pMap.get('sides') ?? 4) as 3 | 4 | 6,
          sideLength: Number(pMap.get('sideLength') ?? 40),
          height: Number(pMap.get('height') ?? 70),
        };
        return solvePyramidProjection(pyrInput);
      } else if (solidKind.includes('CYLINDER') || solidKind.includes('CONE')) {
        const roundInput: RoundSolidInput = {
          type: solidKind.includes('CONE') ? 'CONE' : 'CYLINDER',
          diameter: Number(pMap.get('diameter') || pMap.get('sideLength') || 50),
          height: Number(pMap.get('height') ?? 70),
        };
        return solveRoundSolidProjection(roundInput);
      } else {
        const input: PrismInput = {
          sides: Number(pMap.get('sides') ?? 4) as 3 | 4 | 6,
          sideLength: Number(pMap.get('sideLength') ?? 35),
          height: Number(pMap.get('height') ?? 65),
        };
        return solvePrismProjection(input);
      }
    }

    case 'SECTIONS_OF_SOLIDS': {
      const input: SectionPrismInput = {
        baseSide: Number(pMap.get('baseSide') ?? 40),
        height: Number(pMap.get('height') ?? 70),
        cuttingAngleDeg: Number(pMap.get('cuttingAngleDeg') ?? 45),
        cutPointOnAxisHeight: Number(pMap.get('cutPointOnAxisHeight') ?? 35),
      };
      return solveSectionOfSolid(input);
    }

    case 'DEVELOPMENT_OF_SURFACES': {
      const input: DevelopmentInput = {
        solidType: (pMap.get('solidType') as any) ?? 'PRISM',
        baseDimension: Number(pMap.get('baseDimension') ?? 40),
        height: Number(pMap.get('height') ?? 65),
        sides: Number(pMap.get('sides') ?? 4),
      };
      return solveDevelopmentOfSurface(input);
    }

    case 'ISOMETRIC_VIEW':
    case 'ISOMETRIC_PROJECTION': {
      const isProj = data.topic === 'ISOMETRIC_PROJECTION' || Boolean(pMap.get('isProjection'));
      const input: IsometricInput = {
        length: Number(pMap.get('length') ?? 60),
        breadth: Number(pMap.get('breadth') ?? 40),
        height: Number(pMap.get('height') ?? 30),
        isProjection: isProj,
      };
      return solveIsometricView(input);
    }

    case 'PERSPECTIVE_PROJECTION': {
      const input: PerspectiveInput = {
        width: Number(pMap.get('width') ?? 40),
        depth: Number(pMap.get('depth') ?? 30),
        height: Number(pMap.get('height') ?? 50),
        spDistanceInFrontPP: Number(pMap.get('spDistanceInFrontPP') ?? 60),
        eyeLevelAboveGL: Number(pMap.get('eyeLevelAboveGL') ?? 40),
      };
      return solvePerspectiveProjection(input);
    }

    case 'ORTHOGRAPHIC_CONVERSION': {
      const input: OrthographicInput = {
        length: Number(pMap.get('length') ?? 60),
        height: Number(pMap.get('height') ?? 45),
        width: Number(pMap.get('width') ?? 40),
        stepLength: Number(pMap.get('stepLength') ?? 25),
        stepHeight: Number(pMap.get('stepHeight') ?? 20),
      };
      return solveOrthographicThreeViews(input);
    }

    case 'ENGINEERING_CURVES': {
      const input: CurveInput = {
        curveType: String(pMap.get('curveType') || '').toUpperCase().includes('CYCLOID') ? 'CYCLOID' : 'INVOLUTE',
        diameter: Number(pMap.get('diameter') ?? 45),
      };
      return solveEngineeringCurve(input);
    }

    default:
      throw new Error(`The topic '${data.topic}' is not yet supported for automated construction. Please try Points, Lines, Planes, Solids, Sections, Development, Isometric, Perspective, Orthographic 3-Views, or Curves.`);
  }
}
