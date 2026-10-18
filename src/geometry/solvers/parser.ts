// ============================================================
// Kerala EG Studio — Rule-Based Natural Language Question Parser
// Deterministic fallback & instant parser for standard KTU/Kerala questions
// Works offline and without API keys!
// ============================================================

import type { ExtractedQuestionData, QuestionParameter, TopicId } from '../types';

export function parseQuestionRuleBased(text: string): ExtractedQuestionData {
  const lower = text.toLowerCase();
  const params: QuestionParameter[] = [];
  const ambiguities: string[] = [];
  const missing: string[] = [];

  let topic: TopicId = 'UNSUPPORTED';
  let method = 'Standard Geometric Construction';

  // 1. Check for Projection of Points
  const isPoint = (lower.includes('point') || (lower.includes('hp') && lower.includes('vp') && !lower.includes('line') && !lower.includes('prism') && !lower.includes('solid')));

  if (isPoint && (lower.includes('above hp') || lower.includes('below hp') || lower.includes('in front') || lower.includes('behind'))) {
    topic = 'PROJECTION_OF_POINTS';
    method = 'Direct Orthographic Projection (First-Angle)';

    // Extract point label
    const labelMatch = text.match(/point\s+([A-Za-z])/i);
    const label = labelMatch ? labelMatch[1].toUpperCase() : 'A';
    params.push({ name: 'label', value: label, given: true, confidence: 0.95 });

    // Distance relative to HP
    const aboveHp = text.match(/(\d+(?:\.\d+)?)\s*(?:mm|cm)?\s*above\s*(?:the\s*)?hp/i);
    const belowHp = text.match(/(\d+(?:\.\d+)?)\s*(?:mm|cm)?\s*below\s*(?:the\s*)?hp/i);
    const onHp = lower.includes('on hp') || lower.includes('in hp');

    let heightAboveHP = 0;
    if (aboveHp) heightAboveHP = parseFloat(aboveHp[1]);
    else if (belowHp) heightAboveHP = -parseFloat(belowHp[1]);
    else if (onHp) heightAboveHP = 0;
    else missing.push('Distance relative to HP');

    params.push({ name: 'heightAboveHP', value: heightAboveHP, unit: 'mm', given: !!(aboveHp || belowHp || onHp), confidence: 0.9 });

    // Distance relative to VP
    const inFrontVp = text.match(/(\d+(?:\.\d+)?)\s*(?:mm|cm)?\s*in\s*front\s*(?:of\s*)?(?:the\s*)?vp/i);
    const behindVp = text.match(/(\d+(?:\.\d+)?)\s*(?:mm|cm)?\s*behind\s*(?:the\s*)?vp/i);
    const onVp = lower.includes('on vp') || lower.includes('in vp');

    let depthInFrontVP = 0;
    if (inFrontVp) depthInFrontVP = parseFloat(inFrontVp[1]);
    else if (behindVp) depthInFrontVP = -parseFloat(behindVp[1]);
    else if (onVp) depthInFrontVP = 0;
    else missing.push('Distance relative to VP');

    params.push({ name: 'depthInFrontVP', value: depthInFrontVP, unit: 'mm', given: !!(inFrontVp || behindVp || onVp), confidence: 0.9 });

    return {
      rawText: text,
      topic,
      confidence: missing.length === 0 ? 0.95 : 0.6,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  // 2. Check for Straight Lines
  if (lower.includes('line') || (lower.includes('true length') && !lower.includes('prism'))) {
    topic = 'PROJECTION_OF_LINES';
    method = 'Rotating-Line (Rabatment) Method';

    // True Length
    const tlMatch = text.match(/(?:true length|length|long)(?:\s*(?:of|is|:))?\s*(\d+(?:\.\d+)?)\s*(?:mm|cm)?/i)
      || text.match(/(\d+(?:\.\d+)?)\s*mm\s*long/i);
    const trueLength = tlMatch ? parseFloat(tlMatch[1]) : 80;
    params.push({ name: 'trueLength', value: trueLength, unit: 'mm', given: !!tlMatch, confidence: 0.9 });

    // End A coordinates
    const aAbove = text.match(/(?:end\s*a|a)\s*(?:is)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*above\s*hp/i);
    const aBelow = text.match(/(?:end\s*a|a)\s*(?:is)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*below\s*hp/i);
    const heightA = aAbove ? parseFloat(aAbove[1]) : aBelow ? -parseFloat(aBelow[1]) : 20;
    params.push({ name: 'heightA', value: heightA, unit: 'mm', given: !!(aAbove || aBelow), confidence: 0.85 });

    const aFront = text.match(/(?:end\s*a|a)\s*(?:is)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*in\s*front\s*(?:of\s*)?vp/i);
    const aBehind = text.match(/(?:end\s*a|a)\s*(?:is)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*behind\s*vp/i);
    const depthA = aFront ? parseFloat(aFront[1]) : aBehind ? -parseFloat(aBehind[1]) : 25;
    params.push({ name: 'depthA', value: depthA, unit: 'mm', given: !!(aFront || aBehind), confidence: 0.85 });

    // Inclinations
    const thetaMatch = text.match(/(?:inclined\s*(?:at)?\s*)?(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)?\s*(?:to|with)\s*(?:the\s*)?hp/i);
    const phiMatch = text.match(/(?:inclined\s*(?:at)?\s*)?(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)?\s*(?:to|with)\s*(?:the\s*)?vp/i);

    const thetaDeg = thetaMatch ? parseFloat(thetaMatch[1]) : 30;
    const phiDeg = phiMatch ? parseFloat(phiMatch[1]) : 45;

    params.push({ name: 'thetaDeg', value: thetaDeg, unit: '°', given: !!thetaMatch, confidence: 0.9 });
    params.push({ name: 'phiDeg', value: phiDeg, unit: '°', given: !!phiMatch, confidence: 0.9 });

    params.push({ name: 'labelA', value: 'A', given: true, confidence: 1 });
    params.push({ name: 'labelB', value: 'B', given: true, confidence: 1 });
    params.push({ name: 'showTraces', value: lower.includes('trace'), given: true, confidence: 0.9 });

    return {
      rawText: text,
      topic,
      confidence: 0.9,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  // 3. Sections of Solids
  if (lower.includes('section') || lower.includes('cutting plane') || lower.includes('true shape')) {
    topic = 'SECTIONS_OF_SOLIDS';
    method = 'Auxiliary View Method for True Shape of Section';

    const sideMatch = text.match(/(?:side|base)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i) || text.match(/(\d+(?:\.\d+)?)\s*mm\s*side/i);
    const heightMatch = text.match(/(?:height|axis)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i) || text.match(/(\d+(?:\.\d+)?)\s*mm\s*height/i);
    const angleMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)\s*to\s*hp/i);

    const baseSide = sideMatch ? parseFloat(sideMatch[1]) : 40;
    const height = heightMatch ? parseFloat(heightMatch[1]) : 70;
    const cuttingAngleDeg = angleMatch ? parseFloat(angleMatch[1]) : 45;

    params.push({ name: 'baseSide', value: baseSide, unit: 'mm', given: !!sideMatch, confidence: 0.9 });
    params.push({ name: 'height', value: height, unit: 'mm', given: !!heightMatch, confidence: 0.9 });
    params.push({ name: 'cuttingAngleDeg', value: cuttingAngleDeg, unit: '°', given: !!angleMatch, confidence: 0.9 });
    params.push({ name: 'cutPointOnAxisHeight', value: height / 2, unit: 'mm', given: false, confidence: 0.7 });

    return {
      rawText: text,
      topic,
      confidence: 0.85,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  // 4. Development of Surfaces
  if (lower.includes('develop') || lower.includes('development')) {
    topic = 'DEVELOPMENT_OF_SURFACES';
    method = 'Parallel-Line Development';

    const sideMatch = text.match(/(\d+(?:\.\d+)?)\s*mm\s*side/i) || text.match(/(?:side|base|diameter)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);
    const heightMatch = text.match(/(\d+(?:\.\d+)?)\s*mm\s*(?:height|long)/i) || text.match(/(?:height|axis)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);

    const baseDimension = sideMatch ? parseFloat(sideMatch[1]) : 40;
    const height = heightMatch ? parseFloat(heightMatch[1]) : 65;

    params.push({ name: 'solidType', value: lower.includes('cylinder') ? 'CYLINDER' : 'PRISM', given: true, confidence: 0.9 });
    params.push({ name: 'baseDimension', value: baseDimension, unit: 'mm', given: !!sideMatch, confidence: 0.9 });
    params.push({ name: 'height', value: height, unit: 'mm', given: !!heightMatch, confidence: 0.9 });
    params.push({ name: 'sides', value: lower.includes('hexagonal') ? 6 : lower.includes('triangular') ? 3 : 4, given: true, confidence: 0.85 });

    return {
      rawText: text,
      topic,
      confidence: 0.85,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  // 5. Isometric View / Projection
  if (lower.includes('isometric') || lower.includes('pictorial')) {
    const isProjection = lower.includes('projection');
    topic = isProjection ? 'ISOMETRIC_PROJECTION' : 'ISOMETRIC_VIEW';
    method = isProjection ? 'Isometric Projection (Scale 0.816)' : 'Isometric View (1:1 True Scale)';

    const dims = text.match(/(\d+(?:\.\d+)?)\s*(?:mm)?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);
    let L = 60, B = 40, H = 30;
    if (dims) {
      L = parseFloat(dims[1]);
      B = parseFloat(dims[2]);
      H = parseFloat(dims[3]);
    }

    params.push({ name: 'length', value: L, unit: 'mm', given: !!dims, confidence: 0.9 });
    params.push({ name: 'breadth', value: B, unit: 'mm', given: !!dims, confidence: 0.9 });
    params.push({ name: 'height', value: H, unit: 'mm', given: !!dims, confidence: 0.9 });
    params.push({ name: 'isProjection', value: isProjection, given: true, confidence: 0.95 });

    return {
      rawText: text,
      topic,
      confidence: 0.9,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  // 6. Solids in Simple Position
  if (lower.includes('prism') || lower.includes('cylinder') || lower.includes('pyramid') || lower.includes('cone')) {
    topic = 'PROJECTION_OF_SOLIDS';
    method = 'Orthographic Projection — Simple Position (Axis ⊥ HP)';

    const sideMatch = text.match(/(\d+(?:\.\d+)?)\s*mm\s*side/i) || text.match(/(?:side|base)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);
    const heightMatch = text.match(/(\d+(?:\.\d+)?)\s*mm\s*(?:height|long)/i) || text.match(/(?:height|axis)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);

    const sideLength = sideMatch ? parseFloat(sideMatch[1]) : 35;
    const height = heightMatch ? parseFloat(heightMatch[1]) : 65;
    const sides: 3 | 4 | 6 = lower.includes('hexagonal') ? 6 : lower.includes('triangular') ? 3 : 4;

    const isCone = lower.includes('cone');
    const isCyl = lower.includes('cylinder');
    const isPyr = lower.includes('pyramid');
    const solidKind = isCone ? 'CONE' : isCyl ? 'CYLINDER' : isPyr ? 'PYRAMID' : 'PRISM';

    // Check for 3-Stage Solid (inclined to both HP and VP)
    const hasHp = lower.includes('hp');
    const hasVp = lower.includes('vp');
    const isThreeStage = (hasHp && hasVp && lower.includes('inclined')) || lower.includes('3 stage') || lower.includes('3-stage') || lower.includes('three stage');

    if (isThreeStage) {
      const thetaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)?\s*(?:to|with)\s*(?:the\s*)?hp/i);
      const betaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)?\s*(?:to|with)\s*(?:the\s*)?vp/i);
      const thetaHP = thetaMatch ? parseFloat(thetaMatch[1]) : 45;
      const betaVP = betaMatch ? parseFloat(betaMatch[1]) : 30;

      params.push({ name: 'isThreeStage', value: true, given: true, confidence: 0.95 });
      params.push({ name: 'solidType', value: isPyr ? 'SQUARE_PYRAMID' : 'HEXAGONAL_PRISM', given: true, confidence: 0.9 });
      params.push({ name: 'baseSide', value: sideLength, unit: 'mm', given: !!sideMatch, confidence: 0.9 });
      params.push({ name: 'axisHeight', value: height, unit: 'mm', given: !!heightMatch, confidence: 0.9 });
      params.push({ name: 'thetaHP', value: thetaHP, unit: '°', given: !!thetaMatch, confidence: 0.9 });
      params.push({ name: 'betaVP', value: betaVP, unit: '°', given: !!betaMatch, confidence: 0.9 });

      return {
        rawText: text,
        topic,
        confidence: 0.9,
        parameters: params,
        missingParameters: missing,
        ambiguities,
        method: '3-Stage Projection Method (Solids Inclined to both HP and VP)',
      };
    }

    params.push({ name: 'solidKind', value: solidKind, given: true, confidence: 0.95 });
    params.push({ name: 'sides', value: sides, given: true, confidence: 0.9 });
    params.push({ name: 'sideLength', value: sideLength, unit: 'mm', given: !!sideMatch, confidence: 0.9 });
    params.push({ name: 'diameter', value: sideLength, unit: 'mm', given: !!sideMatch, confidence: 0.9 });
    params.push({ name: 'height', value: height, unit: 'mm', given: !!heightMatch, confidence: 0.9 });

    return {
      rawText: text,
      topic,
      confidence: 0.85,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  // 7. Projection of Planes (Lamina / Plate)
  if (lower.includes('plane') || lower.includes('plate') || lower.includes('lamina')) {
    topic = 'PROJECTION_OF_PLANES';
    method = 'Change-of-Position / Two-Stage Orthographic Projection';

    let shape: 'TRIANGLE' | 'SQUARE' | 'PENTAGON' | 'HEXAGON' | 'CIRCLE' = 'HEXAGON';
    if (lower.includes('triang')) shape = 'TRIANGLE';
    else if (lower.includes('square')) shape = 'SQUARE';
    else if (lower.includes('pentagon')) shape = 'PENTAGON';
    else if (lower.includes('hexagon')) shape = 'HEXAGON';
    else if (lower.includes('circle') || lower.includes('circular')) shape = 'CIRCLE';

    const sideMatch = text.match(/(\d+(?:\.\d+)?)\s*mm\s*(?:side|diameter)/i)
      || text.match(/(?:side|diameter)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);
    const angleMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)\s*to\s*hp/i);

    const dimension = sideMatch ? parseFloat(sideMatch[1]) : 30;
    const thetaDeg = angleMatch ? parseFloat(angleMatch[1]) : 45;

    params.push({ name: 'shape', value: shape, given: true, confidence: 0.9 });
    params.push({ name: 'dimension', value: dimension, unit: 'mm', given: !!sideMatch, confidence: 0.9 });
    params.push({ name: 'inclinationToHPDeg', value: thetaDeg, unit: '°', given: !!angleMatch, confidence: 0.9 });
    params.push({ name: 'edgeOnHP', value: lower.includes('edge on hp') || lower.includes('side on hp'), given: true, confidence: 0.85 });

    return {
      rawText: text,
      topic,
      confidence: 0.9,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  // 8. Perspective Projection
  if (lower.includes('perspective') || lower.includes('picture plane') || lower.includes('station point')) {
    topic = 'PERSPECTIVE_PROJECTION';
    method = 'Visual-Ray Method (KTU EST110)';

    const dims = text.match(/(\d+(?:\.\d+)?)\s*(?:mm)?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);
    let W = 40, D = 30, H = 50;
    if (dims) {
      W = parseFloat(dims[1]);
      D = parseFloat(dims[2]);
      H = parseFloat(dims[3]);
    }

    params.push({ name: 'width', value: W, unit: 'mm', given: !!dims, confidence: 0.9 });
    params.push({ name: 'depth', value: D, unit: 'mm', given: !!dims, confidence: 0.9 });
    params.push({ name: 'height', value: H, unit: 'mm', given: !!dims, confidence: 0.9 });
    params.push({ name: 'spDistanceInFrontPP', value: 60, unit: 'mm', given: false, confidence: 0.7 });
    params.push({ name: 'eyeLevelAboveGL', value: 40, unit: 'mm', given: false, confidence: 0.7 });

    return {
      rawText: text,
      topic,
      confidence: 0.85,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  // 9. 3-View Orthographic Conversion
  if (lower.includes('orthographic') || lower.includes('three view') || lower.includes('3 view') || (lower.includes('front view') && lower.includes('top view') && lower.includes('side view'))) {
    topic = 'ORTHOGRAPHIC_CONVERSION';
    method = 'Three-View Orthographic Projection with 45° Miter Line';

    const dims = text.match(/(\d+(?:\.\d+)?)\s*(?:mm)?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);
    let L = 60, H = 45, W = 40;
    if (dims) {
      L = parseFloat(dims[1]);
      H = parseFloat(dims[2]);
      W = parseFloat(dims[3]);
    }

    params.push({ name: 'length', value: L, unit: 'mm', given: !!dims, confidence: 0.9 });
    params.push({ name: 'height', value: H, unit: 'mm', given: !!dims, confidence: 0.9 });
    params.push({ name: 'width', value: W, unit: 'mm', given: !!dims, confidence: 0.9 });

    return {
      rawText: text,
      topic,
      confidence: 0.9,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  // 10. Engineering Curves (Involute & Cycloid)
  if (lower.includes('involute') || lower.includes('cycloid') || lower.includes('rolling circle') || lower.includes('tangent and normal')) {
    topic = 'ENGINEERING_CURVES';
    const isCycloid = lower.includes('cycloid') || lower.includes('rolling');
    method = `${isCycloid ? 'Cycloid' : 'Involute'} with Normal and Tangent Construction`;

    const dMatch = text.match(/(\d+(?:\.\d+)?)\s*mm\s*(?:diameter|circle)/i)
      || text.match(/(?:diameter)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);
    const diameter = dMatch ? parseFloat(dMatch[1]) : 45;

    params.push({ name: 'curveType', value: isCycloid ? 'CYCLOID' : 'INVOLUTE', given: true, confidence: 0.95 });
    params.push({ name: 'diameter', value: diameter, unit: 'mm', given: !!dMatch, confidence: 0.9 });

    return {
      rawText: text,
      topic,
      confidence: 0.9,
      parameters: params,
      missingParameters: missing,
      ambiguities,
      method,
    };
  }

  return {
    rawText: text,
    topic: 'UNSUPPORTED',
    confidence: 0.2,
    parameters: [],
    missingParameters: ['Could not identify specific engineering graphics topic from text.'],
    ambiguities: ['Ensure the problem mentions points, lines, planes, solids, sections, development, isometric, perspective, 3 views, or curves.'],
  };
}
