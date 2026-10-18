// ============================================================
// Kerala EG Studio — Core Geometry Types
// All drawing objects are represented as structured data.
// This file contains NO React, NO AI calls, NO side effects.
// ============================================================

/** 2D point in drawing space (mm from origin). */
export interface Point2D {
  x: number;
  y: number;
}

/** Line segment defined by two 2D points. */
export interface Line2D {
  start: Point2D;
  end: Point2D;
}

/** BIS line style conventions for engineering drawings. */
export type LineStyle =
  | 'VISIBLE'        // Thick continuous — object outlines
  | 'HIDDEN'         // Dashed — hidden edges
  | 'CONSTRUCTION'   // Thin dotted/light — temporary construction
  | 'PROJECTION'     // Thin continuous — projectors between views
  | 'DIMENSION'      // Thin with arrowheads
  | 'EXTENSION'      // Thin continuous — extension lines
  | 'CENTRE'         // Chain (long-short dash) — axes/centre lines
  | 'CUTTING_PLANE'  // Chain with arrows at ends — section plane
  | 'HATCHING'       // Thin, 45-degree pattern — section fill
  | 'REFERENCE';     // XY reference line

/** A drawable element in the engineering drawing. */
export interface DrawingObject {
  id: string;
  type:
    | 'LINE'
    | 'CIRCLE'
    | 'ARC'
    | 'POLYGON'
    | 'ELLIPSE'
    | 'POLYLINE'
    | 'POINT_MARKER'
    | 'TEXT'
    | 'DIMENSION_LINEAR'
    | 'DIMENSION_ANGULAR'
    | 'HATCHING_REGION'
    | 'ARROW';
  lineStyle: LineStyle;
  lineWidth: number;         // mm (converted to px by renderer)
  color: string;
  fillColor?: string;
  label?: string;
  labelOffset?: Point2D;     // offset from geometry for label placement
  visible: boolean;
  constructionStage: number; // which step introduces this object (1-based)
  highlighted: boolean;
  /** Geometry payload — type-specific. */
  geometry: LineGeometry | CircleGeometry | ArcGeometry | PolygonGeometry
           | EllipseGeometry | PolylineGeometry | PointMarkerGeometry
           | TextGeometry | DimLinearGeometry | DimAngularGeometry
           | HatchingRegionGeometry | ArrowGeometry;
}

export interface LineGeometry {
  kind: 'LINE';
  start: Point2D;
  end: Point2D;
}

export interface CircleGeometry {
  kind: 'CIRCLE';
  center: Point2D;
  radius: number; // mm
}

export interface ArcGeometry {
  kind: 'ARC';
  center: Point2D;
  radius: number;
  startAngleDeg: number;  // measured from +x axis, counter-clockwise
  endAngleDeg: number;
}

export interface PolygonGeometry {
  kind: 'POLYGON';
  vertices: Point2D[];
  closed: boolean;
}

export interface EllipseGeometry {
  kind: 'ELLIPSE';
  center: Point2D;
  semiMajor: number; // mm
  semiMinor: number; // mm
  rotationDeg: number; // rotation of major axis from +x, degrees
}

export interface PolylineGeometry {
  kind: 'POLYLINE';
  points: Point2D[];
}

export interface PointMarkerGeometry {
  kind: 'POINT_MARKER';
  position: Point2D;
  size: number; // mm — cross-hair or dot size
}

export interface TextGeometry {
  kind: 'TEXT';
  position: Point2D;
  content: string;
  fontSize: number; // mm
  anchor: 'START' | 'MIDDLE' | 'END';
  italic?: boolean;
}

export interface DimLinearGeometry {
  kind: 'DIM_LINEAR';
  start: Point2D;
  end: Point2D;
  offset: number; // perpendicular distance from line to dimension baseline (mm)
  value?: number; // if not given, computed from geometry
  unit: 'mm' | 'cm';
}

export interface DimAngularGeometry {
  kind: 'DIM_ANGULAR';
  vertex: Point2D;
  ray1End: Point2D;
  ray2End: Point2D;
  radius: number; // arc radius for annotation
  valueDeg?: number;
}

export interface HatchingRegionGeometry {
  kind: 'HATCHING';
  vertices: Point2D[];       // polygon boundary
  angleDeg: number;          // hatch line angle (45 for standard section)
  spacingMm: number;         // spacing between hatch lines
}

export interface ArrowGeometry {
  kind: 'ARROW';
  from: Point2D;
  to: Point2D;
  arrowSize: number; // mm
}

export interface ManualDraftingGuide {
  pencilGrade: '4H' | '3H' | '2H' | 'H' | 'HB';
  instrument: string; // e.g. "Mini-Drafter (Set horizontal blade on XY)", "Compass with 4H lead", "Divider"
  bisStandardLine: string; // e.g. "Type B — Continuous thin line (0.18 mm)", "Type A — Continuous thick line (0.35 mm)"
  technique: string; // Hands-on manual drafting instructions for drawing sheet
}

// ============================================================
// Construction step — the unit of the step-by-step player
// ============================================================
export interface ConstructionStep {
  stepNumber: number;       // 1-based
  title: string;
  /** Simple explanation for all students. */
  explanation: string;
  /** Teaching-mode expansion: what to draw. */
  whatToDraw: string;
  /** Teaching-mode expansion: how to draw it. */
  howToDraw: string;
  /** Teaching-mode expansion: why this step is needed. */
  whyNeeded: string;
  /** Teaching-mode expansion: what to check after this step. */
  whatToCheck: string;
  /** Manual drafting guide on paper with mini-drafter & pencils. */
  manualDrafting?: ManualDraftingGuide;
  /** Calculations performed in this step (LaTeX or plain text). */
  calculations: CalculationEntry[];
  /** IDs of DrawingObjects introduced OR modified in this step. */
  objectIds: string[];
  /** IDs of DrawingObjects highlighted (same as objectIds for newly drawn). */
  highlightIds: string[];
}

export interface CalculationEntry {
  label: string;
  formula: string;       // e.g. "L² = l² + h² + d²"
  substitution: string;  // e.g. "= 60² + 40² + 30² = 6100"
  result: string;        // e.g. "L = 78.1 mm"
  unit: string;
}

// ============================================================
// Complete solution produced by a geometry solver
// ============================================================
export interface SolverSolution {
  topic: TopicId;
  method: string;           // Human-readable method name
  drawingObjects: DrawingObject[];
  steps: ConstructionStep[];
  /** Validation results. */
  validation: ValidationResult;
  /** Final computed values (displayed in summary). */
  finalValues: Record<string, string>;
}

export interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  tolerance?: number;
}

// ============================================================
// Supported problem topics (tied to curriculum)
// ============================================================
export type TopicId =
  | 'PROJECTION_OF_POINTS'
  | 'PROJECTION_OF_LINES'
  | 'PROJECTION_OF_PLANES'
  | 'PROJECTION_OF_SOLIDS'
  | 'SECTIONS_OF_SOLIDS'
  | 'DEVELOPMENT_OF_SURFACES'
  | 'ISOMETRIC_VIEW'
  | 'ISOMETRIC_PROJECTION'
  | 'PERSPECTIVE_PROJECTION'
  | 'ENGINEERING_CURVES'
  | 'ORTHOGRAPHIC_CONVERSION'
  | 'CAD_DRAWING'
  | 'UNSUPPORTED';

// ============================================================
// Drawing canvas state (used by SVG renderer)
// ============================================================
export interface CanvasViewport {
  /** Scale: mm to SVG user units. */
  scale: number;
  /** Pan offset in SVG user units. */
  panX: number;
  panY: number;
}

export interface DrawingCanvasState {
  objects: DrawingObject[];
  currentStep: number;
  totalSteps: number;
  viewport: CanvasViewport;
  showConstructionLines: boolean;
  showHiddenLines: boolean;
  showDimensions: boolean;
  showLabels: boolean;
  showProjectors: boolean;
  draftingStyle?: 'CAD' | 'MANUAL_SHEET';
  projectionAngle: 'FIRST_ANGLE' | 'THIRD_ANGLE';
}

// ============================================================
// Question parsing result
// ============================================================
export interface ExtractedQuestionData {
  rawText: string;
  topic: TopicId;
  confidence: number;  // 0-1
  parameters: QuestionParameter[];
  missingParameters: string[];
  ambiguities: string[];
  method?: string;
}

export interface QuestionParameter {
  name: string;
  value: string | number | boolean;
  unit?: string;
  given: boolean;    // true = given, false = to be calculated
  confidence: number; // 0-1, for AI-extracted values
}
