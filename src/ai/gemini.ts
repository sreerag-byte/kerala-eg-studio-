// ============================================================
// Kerala EG Studio — Gemini AI Integration
// Used for: question understanding, image interpretation, tutoring.
// Never used for geometry calculations.
// ============================================================

import type { ExtractedQuestionData, TopicId } from '../geometry/types';

// ── API configuration ────────────────────────────────────────
// API key is read from the Vite environment variable.
// NEVER hardcode the key here.
const API_KEY = (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_GEMINI_API_KEY ?? '';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-2.0-flash';

interface GeminiTextPart {
  text: string;
}

interface GeminiInlineData {
  inlineData: {
    mimeType: string;
    data: string; // base64
  };
}

type GeminiPart = GeminiTextPart | GeminiInlineData;

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates: Array<{
    content: { parts: GeminiTextPart[] };
    finishReason: string;
  }>;
}

async function callGemini(contents: GeminiContent[]): Promise<string> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please add your API key in Curriculum Settings.');
  }

  const url = `${GEMINI_API_BASE}/models/${MODEL}:generateContent?key=${API_KEY}`;
  const body = {
    contents,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data: GeminiResponse = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API.');
  return text;
}

// ── Prompts ───────────────────────────────────────────────────
const EXTRACTION_SYSTEM_PROMPT = `You are an Engineering Graphics expert assistant for Kerala engineering colleges.
Your task is to analyze an engineering graphics question and extract all relevant parameters.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "topic": "<one of: PROJECTION_OF_POINTS | PROJECTION_OF_LINES | PROJECTION_OF_PLANES | PROJECTION_OF_SOLIDS | SECTIONS_OF_SOLIDS | DEVELOPMENT_OF_SURFACES | ISOMETRIC_VIEW | ISOMETRIC_PROJECTION | PERSPECTIVE_PROJECTION | ENGINEERING_CURVES | ORTHOGRAPHIC_CONVERSION | CAD_DRAWING | UNSUPPORTED>",
  "confidence": <0.0 to 1.0>,
  "transcribedQuestion": "<full question text>",
  "method": "<suggested construction method>",
  "parameters": [
    { "name": "<param name>", "value": "<value>", "unit": "<mm|degrees|etc>", "given": true, "confidence": 0.95 }
  ],
  "missingParameters": ["<list of missing/ambiguous values that would affect the solution>"],
  "ambiguities": ["<list of unclear statements in the question>"],
  "suggestedSolverInputs": {}
}

Rules:
- Extract ALL dimensions (true length, heights, depths, angles, radii, side lengths).
- Identify ALL orientation details (quadrant, inclination to HP/VP, axis direction).
- Flag ANY angle that could be confusion between true inclination and apparent inclination.
- Flag if the question specifies first-angle or third-angle projection.
- Flag missing quadrant info for points and lines.
- Confidence must be < 0.7 if any ambiguity affects the solution materially.`;

/**
 * Extract structured data from a typed question string.
 */
export async function extractFromText(questionText: string): Promise<ExtractedQuestionData> {
  const prompt = `${EXTRACTION_SYSTEM_PROMPT}\n\nQuestion:\n${questionText}`;
  
  try {
    const response = await callGemini([
      { role: 'user', parts: [{ text: prompt }] },
    ]);

    const json = JSON.parse(response.trim());
    return mapGeminiResponse(questionText, json);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Could not parse AI response. Please try rephrasing the question.');
    }
    throw err;
  }
}

/**
 * Extract structured data from an uploaded image (base64).
 */
export async function extractFromImage(
  base64Data: string,
  mimeType: string
): Promise<ExtractedQuestionData> {
  const parts: GeminiPart[] = [
    { inlineData: { mimeType, data: base64Data } },
    { text: EXTRACTION_SYSTEM_PROMPT + '\n\nAnalyze the engineering graphics question in this image.' },
  ];

  try {
    const response = await callGemini([
      { role: 'user', parts },
    ]);

    const json = JSON.parse(response.trim());
    return mapGeminiResponse('[Extracted from image]', json);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Could not parse AI response from image. Please verify the image is clear and contains an engineering graphics question.');
    }
    throw err;
  }
}

/** Map raw Gemini JSON response to ExtractedQuestionData. */
function mapGeminiResponse(
  rawText: string,
  json: Record<string, unknown>
): ExtractedQuestionData {
  return {
    rawText: typeof json.transcribedQuestion === 'string' ? json.transcribedQuestion : rawText,
    topic: (json.topic as TopicId) ?? 'UNSUPPORTED',
    confidence: typeof json.confidence === 'number' ? json.confidence : 0.5,
    parameters: Array.isArray(json.parameters) ? json.parameters as ExtractedQuestionData['parameters'] : [],
    missingParameters: Array.isArray(json.missingParameters) ? json.missingParameters as string[] : [],
    ambiguities: Array.isArray(json.ambiguities) ? json.ambiguities as string[] : [],
    method: typeof json.method === 'string' ? json.method : undefined,
  };
}

/**
 * Get a tutoring explanation for a construction step.
 */
export async function getTutoringExplanation(
  topic: string,
  stepTitle: string,
  stepExplanation: string,
  studentQuestion?: string
): Promise<string> {
  const prompt = `You are an Engineering Graphics tutor at a Kerala engineering college.
Topic: ${topic}
Current step: ${stepTitle}
Step explanation: ${stepExplanation}
${studentQuestion ? `Student question: ${studentQuestion}` : 'Provide a simple, clear explanation of this step as you would explain it at a drawing board.'}

Keep the answer under 200 words. Use simple language suitable for a first-year engineering student.`;

  return callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
}

/**
 * Generate a practice question for a given topic and difficulty.
 */
export async function generatePracticeQuestion(
  topic: string,
  difficulty: 'BASIC' | 'MEDIUM' | 'ADVANCED',
  curriculumNote?: string
): Promise<string> {
  const prompt = `Generate one engineering graphics practice question for Kerala engineering students.
Topic: ${topic}
Difficulty: ${difficulty}
${curriculumNote ?? ''}

Requirements:
- Give specific numerical values (exact mm and degrees)
- Match Kerala/KTU examination style
- Include all necessary data to solve the problem completely
- Output only the question text, no solution.`;

  return callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
}

/**
 * Check if the API key is configured (without making a network call).
 */
export function isApiKeyConfigured(): boolean {
  return !!API_KEY && API_KEY.trim().length > 10;
}
