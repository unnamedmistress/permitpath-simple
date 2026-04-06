/**
 * Photo-to-Scope Analyzer
 *
 * Accepts a photo of a home/construction project and returns:
 *   - Detected job type (mapped to SimplifiedJobTypeGrid IDs)
 *   - AI-generated scope-of-work paragraph
 *   - Short job description
 *
 * Uses the same /api/ai/chat endpoint as every other AI feature in this app,
 * sending the image as a base64 data-URL inside the message content array
 * (OpenAI Vision / gpt-4o-mini multimodal format).
 */

import type { PhotoScopeRequest, PhotoScopeResult, DetectedJobInfo } from '@/types/photoScope';

// ─── Supported job type IDs (must match SimplifiedJobTypeGrid) ────────────────

const KNOWN_JOB_TYPES = [
  { id: 'ROOF_REPLACEMENT',  label: 'Roof',             keywords: ['roof', 'shingle', 'flashing', 'gutter', 'fascia'] },
  { id: 'BATHROOM_REMODEL',  label: 'Bathroom',         keywords: ['bathroom', 'toilet', 'shower', 'tub', 'vanity', 'tile'] },
  { id: 'WATER_HEATER',      label: 'Water Heater',     keywords: ['water heater', 'water tank', 'hot water'] },
  { id: 'AC_HVAC',           label: 'AC / HVAC',        keywords: ['ac', 'hvac', 'air conditioner', 'hvac unit', 'heat pump', 'ductwork'] },
  { id: 'WINDOW_DOOR',       label: 'Windows & Doors',  keywords: ['window', 'door', 'sliding glass', 'french door', 'impact window'] },
  { id: 'INTERIOR_PAINT',    label: 'Interior Paint',   keywords: ['paint', 'interior', 'wall', 'ceiling'] },
  { id: 'DECK_PATIO',        label: 'Deck or Patio',    keywords: ['deck', 'patio', 'lanai', 'pergola', 'screened enclosure'] },
  { id: 'FENCE',             label: 'Fence',            keywords: ['fence', 'gate', 'privacy fence', 'chain link'] },
  { id: 'ELECTRICAL_PANEL',  label: 'Electrical Panel', keywords: ['electrical', 'panel', 'breaker', 'wiring', 'ev charger'] },
  { id: 'PLUMBING',          label: 'Plumbing',         keywords: ['plumbing', 'pipe', 'drain', 'sewer', 'water line'] },
  { id: 'ADDITION',          label: 'Addition',         keywords: ['addition', 'room addition', 'sunroom', 'enclosed porch'] },
  { id: 'KITCHEN_REMODEL',   label: 'Kitchen Remodel',  keywords: ['kitchen', 'cabinet', 'countertop', 'cooktop', 'backsplash'] },
] as const;

const KNOWN_JOB_IDS = KNOWN_JOB_TYPES.map(j => j.id);

// ─── Utilities ────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

/** Generate a reduced-size thumbnail (max 400px wide) for display */
async function generateThumbnail(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('image/')) return undefined;
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      const scale = Math.min(1, MAX / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(undefined); };
    img.src = url;
  });
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(jurisdiction: string): string {
  const jobList = KNOWN_JOB_TYPES.map(j => `  - "${j.id}" → ${j.label}`).join('\n');

  return `You are an expert Florida building permit assistant.
A homeowner has uploaded a photo of their home or project.
Your job is to identify what type of permit work is visible and generate a scope of work.

Jurisdiction: ${jurisdiction}

Valid job type IDs (use EXACTLY one of these):
${jobList}

Return ONLY valid JSON — no markdown, no extra text:
{
  "primary": {
    "jobTypeId": "ROOF_REPLACEMENT",
    "jobTypeLabel": "Roof",
    "confidence": 0.92,
    "reasoning": "The photo shows damaged asphalt shingles on a residential roof."
  },
  "alternatives": [
    {
      "jobTypeId": "WINDOW_DOOR",
      "jobTypeLabel": "Windows & Doors",
      "confidence": 0.15,
      "reasoning": "Some windows visible but not the primary concern."
    }
  ],
  "scopeOfWork": "Replace existing asphalt shingle roof on single-family residential structure. Work includes removal of existing shingles, inspection and replacement of damaged decking as needed, installation of new 30-year architectural shingles with appropriate underlayment and drip edge per Florida Building Code.",
  "shortDescription": "Full roof replacement — asphalt shingles",
  "notes": "Impact-rated shingles may be required per Pinellas wind zone requirements."
}

Rules:
- confidence is 0.0-1.0
- alternatives array can be empty [] if only one clear choice
- scopeOfWork should be 2-3 sentences, professional tone, mention Florida Building Code
- shortDescription is ≤ 80 characters
- notes is optional — only include if there is something permit-relevant worth flagging
- If the image is unclear or not home/construction related, use your best guess with low confidence`;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function buildFallback(file: File, id: string): PhotoScopeResult {
  return {
    id,
    primary: {
      jobTypeId: 'ROOF_REPLACEMENT',
      jobTypeLabel: 'Roof',
      confidence: 0.3,
      reasoning: 'Could not analyse photo — using default. Please select your job type manually.',
    },
    alternatives: [],
    scopeOfWork: 'Please describe the scope of work for your project.',
    shortDescription: 'Permit project',
    notes: 'Photo analysis was unavailable. Job type pre-selected as a default — please confirm.',
    fallback: true,
    analyzedAt: new Date().toISOString(),
    file: { name: file.name, type: file.type, sizeKb: Math.round(file.size / 1024) },
  };
}

/** Ensure the jobTypeId from AI is a known value. Fall back to closest keyword match. */
function normalizeJobTypeId(raw: string): string {
  if ((KNOWN_JOB_IDS as readonly string[]).includes(raw)) return raw;
  const lower = raw.toLowerCase();
  for (const jt of KNOWN_JOB_TYPES) {
    if (jt.keywords.some(k => lower.includes(k))) return jt.id;
  }
  return 'ROOF_REPLACEMENT';
}

function normalizeDetected(raw: any): DetectedJobInfo {
  const id = normalizeJobTypeId(raw?.jobTypeId ?? '');
  const jt = KNOWN_JOB_TYPES.find(j => j.id === id);
  return {
    jobTypeId: id,
    jobTypeLabel: raw?.jobTypeLabel ?? jt?.label ?? id,
    confidence: typeof raw?.confidence === 'number' ? raw.confidence : 0.7,
    reasoning: raw?.reasoning ?? '',
  };
}

// ─── Main Function ────────────────────────────────────────────────────────────

export async function analyzePhoto(request: PhotoScopeRequest): Promise<PhotoScopeResult> {
  const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const jurisdiction = request.jurisdiction ?? 'Pinellas County, FL';

  const [base64DataUrl, thumbnailUrl] = await Promise.all([
    fileToBase64(request.file).catch(() => null),
    generateThumbnail(request.file),
  ]);

  if (!base64DataUrl) {
    return buildFallback(request.file, id);
  }

  const prompt = buildPrompt(jurisdiction);

  const visionMessage = {
    role: 'user' as const,
    content: JSON.stringify([
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: base64DataUrl, detail: 'high' } },
    ]),
  };

  let rawContent: string | null = null;
  try {
    const { chatWithAI } = await import('./ai-backend');
    const result = await chatWithAI([visionMessage], { jurisdiction });
    if (result.fallback || !result.message?.content) {
      return { ...buildFallback(request.file, id), thumbnailUrl };
    }
    rawContent = result.message.content.trim();
  } catch {
    return { ...buildFallback(request.file, id), thumbnailUrl };
  }

  let parsed: any;
  try {
    const clean = rawContent
      .replace(/^```(?:json)?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();
    parsed = JSON.parse(clean);
  } catch {
    return { ...buildFallback(request.file, id), thumbnailUrl };
  }

  const primary = normalizeDetected(parsed.primary);
  const alternatives: DetectedJobInfo[] = Array.isArray(parsed.alternatives)
    ? parsed.alternatives.slice(0, 2).map(normalizeDetected)
    : [];

  return {
    id,
    primary,
    alternatives,
    scopeOfWork: typeof parsed.scopeOfWork === 'string'
      ? parsed.scopeOfWork
      : 'Residential permit project — scope to be confirmed.',
    shortDescription: typeof parsed.shortDescription === 'string'
      ? parsed.shortDescription.slice(0, 80)
      : primary.jobTypeLabel,
    notes: typeof parsed.notes === 'string' ? parsed.notes : undefined,
    fallback: false,
    analyzedAt: new Date().toISOString(),
    thumbnailUrl,
    file: { name: request.file.name, type: request.file.type, sizeKb: Math.round(request.file.size / 1024) },
  };
}
