import OpenAI from 'openai';

import { IntentAnalysis } from '@/types';

const structures = [
  'deck',
  'fence',
  'electrical',
  'plumbing',
  'hvac',
  'addition',
  'renovation',
  'garage',
  'ev charger',
  'water heater',
] as const;

export function analyzeIntentHeuristic(description: string): IntentAnalysis {
  const raw = description.trim();
  const lower = raw.toLowerCase();

  let action = 'build';
  if (lower.includes('install')) action = 'install';
  if (lower.includes('replace')) action = 'replace';
  if (lower.includes('repair')) action = 'repair';
  if (lower.includes('remove')) action = 'remove';

  let structure = 'project';
  for (const value of structures) {
    if (lower.includes(value)) {
      structure = value;
      break;
    }
  }

  const sizeMatch = raw.match(/(\d+)\s*(sq\s?ft|sqft|square\s?feet|sf)/i);
  const size = sizeMatch ? Number.parseInt(sizeMatch[1], 10) : undefined;

  let confidence = 62;
  if (structure !== 'project') confidence += 16;
  if (size) confidence += 8;
  if (raw.length > 40) confidence += 10;

  return {
    action,
    structure,
    size,
    confidence: Math.min(96, confidence),
    raw,
  };
}

export async function analyzeIntentWithOpenAI(description: string, apiKey: string): Promise<IntentAnalysis> {
  const client = new OpenAI({ apiKey });

  const result = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content:
          'Extract permit intent as compact JSON with keys: action, structure, location, size, confidence. Confidence is 0-100.',
      },
      {
        role: 'user',
        content: description,
      },
    ],
  });

  const text = result.output_text;
  const parsed = JSON.parse(text) as Partial<IntentAnalysis>;

  return {
    action: parsed.action ?? 'build',
    structure: parsed.structure ?? 'project',
    location: parsed.location,
    size: parsed.size,
    confidence: parsed.confidence ?? 70,
    raw: description,
  };
}
