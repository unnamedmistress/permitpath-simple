import OpenAI from 'openai';

type UploadRecord = {
  imageRef: string;
  filename: string;
  contentType: string;
  dataUrl?: string;
};

type UploadMap = Map<string, UploadRecord>;

type AnalysisResult = {
  permitTypes: string[];
  applicationLinks: Array<{ label: string; url: string }>;
  estimatedCostRange: string;
  estimatedTimeline: string;
  nextSteps: string[];
  confidence: number;
  disclaimer: string;
};

function getUploadMap(): UploadMap {
  const globalStore = globalThis as typeof globalThis & { __permitAssistantUploads?: UploadMap };
  if (!globalStore.__permitAssistantUploads) {
    globalStore.__permitAssistantUploads = new Map();
  }
  return globalStore.__permitAssistantUploads;
}

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function countSyllables(rawWord: string): number {
  let word = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function calculateReadingLevel(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
  if (!sentences.length || !words.length) return 0;
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  return Math.max(0, Math.min(18, Math.round(0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59)));
}

function averageSentenceWords(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  return sentences.length ? words.length / sentences.length : words.length;
}

function simplifyToGrade4(result: AnalysisResult): AnalysisResult {
  const simplifyLine = (line: string) =>
    line
      .replace(/\bobtain\b/gi, 'get')
      .replace(/\bcomplete\b/gi, 'fill out')
      .replace(/\bsubmit\b/gi, 'send')
      .replace(/\bjurisdiction\b/gi, 'permit office');

  return {
    ...result,
    permitTypes: result.permitTypes.map(simplifyLine),
    estimatedCostRange: simplifyLine(result.estimatedCostRange),
    estimatedTimeline: simplifyLine(result.estimatedTimeline),
    nextSteps: result.nextSteps.map(simplifyLine),
    disclaimer: 'This is guidance. County rules can change.'
  };
}

function getFallbackLinks(jurisdiction: string): Array<{ label: string; url: string }> {
  const map: Record<string, Array<{ label: string; url: string }>> = {
    PINELLAS_COUNTY: [{ label: 'Pinellas County permit portal', url: 'https://aca-prod.accela.com/pinellas/Default.aspx' }],
    ST_PETERSBURG: [{ label: 'St. Petersburg permit portal', url: 'https://stpe-egov.aspgov.com/Click2GovBP/index.html' }],
    CLEARWATER: [{ label: 'Clearwater permit page', url: 'https://www.myclearwater.com/Business-Development/Permits-and-Inspections' }],
    LARGO: [{ label: 'Largo permit page', url: 'https://www.largo.com/building/' }],
    PALM_HARBOR: [{ label: 'Pinellas County permit portal', url: 'https://aca-prod.accela.com/pinellas/Default.aspx' }]
  };
  return map[jurisdiction] || map.PINELLAS_COUNTY;
}

function fallbackResult(jurisdiction: string): AnalysisResult {
  return {
    permitTypes: ['Building permit'],
    applicationLinks: getFallbackLinks(jurisdiction),
    estimatedCostRange: '$150 to $900',
    estimatedTimeline: 'About 1 to 4 weeks',
    nextSteps: ['Call the permit desk', 'Fill out the permit form', 'Upload clear job photos'],
    confidence: 0.55,
    disclaimer: 'This is guidance. County rules can change.'
  };
}

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const description = String(req.body?.description || '').trim();
  const jurisdiction = String(req.body?.jurisdiction || 'PINELLAS_COUNTY');
  const address = String(req.body?.address || '').trim();
  const imageRefs = Array.isArray(req.body?.imageRefs) ? req.body.imageRefs.slice(0, 5) : [];

  if (!description) {
    return res.status(400).json({ error: 'description is required' });
  }

  const uploads = getUploadMap();
  const imageRecords = imageRefs
    .map((ref: string) => uploads.get(String(ref)))
    .filter((record: UploadRecord | undefined): record is UploadRecord => Boolean(record && record.dataUrl));

  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json(fallbackResult(jurisdiction));
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const imageParts = imageRecords.map((record) => ({
      type: 'image_url' as const,
      image_url: { url: record.dataUrl as string }
    }));

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a permit helper. Return JSON with keys permitTypes[], applicationLinks[], estimatedCostRange, estimatedTimeline, nextSteps[], confidence. Keep reading level grade 4 or lower. Use short action bullets.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this permit job.\nDescription: ${description}\nJurisdiction: ${jurisdiction}\nAddress: ${address || 'Unknown'}\nGive practical permit guidance and plain words.`
            },
            ...imageParts
          ]
        }
      ]
    });

    const raw = response.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw) as Partial<AnalysisResult>;

    let result: AnalysisResult = {
      permitTypes: Array.isArray(parsed.permitTypes) && parsed.permitTypes.length ? parsed.permitTypes : ['Building permit'],
      applicationLinks:
        Array.isArray(parsed.applicationLinks) && parsed.applicationLinks.length
          ? parsed.applicationLinks.filter((link) => typeof link?.url === 'string')
          : getFallbackLinks(jurisdiction),
      estimatedCostRange: parsed.estimatedCostRange || '$150 to $900',
      estimatedTimeline: parsed.estimatedTimeline || 'About 1 to 4 weeks',
      nextSteps: Array.isArray(parsed.nextSteps) && parsed.nextSteps.length ? parsed.nextSteps : ['Call the permit desk', 'Fill out the permit form'],
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.7,
      disclaimer: 'This is guidance. County rules can change.'
    };

    const readingCorpus = `${result.permitTypes.join('. ')}. ${result.estimatedCostRange}. ${result.estimatedTimeline}. ${result.nextSteps.join('. ')}`;
    const grade = calculateReadingLevel(readingCorpus);
    const avgSentenceLength = averageSentenceWords(readingCorpus);
    if (grade > 4 || avgSentenceLength > 12) {
      result = simplifyToGrade4(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Permit Assistant Analyze] Error:', error);
    return res.status(200).json(fallbackResult(jurisdiction));
  }
}
