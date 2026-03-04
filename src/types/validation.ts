import { z } from 'zod';

// Job validation schemas for API inputs
export const jobTypeSchema = z.enum([
  'RE_ROOFING',
  'ROOF_REPAIR',
  'AC_HVAC_CHANGEOUT',
  'WATER_HEATER',
  'ELECTRICAL_PANEL',
  'ELECTRICAL_REWIRING',
  'EV_CHARGER',
  'GENERATOR_INSTALL',
  'PLUMBING_MAIN_LINE',
  'SMALL_BATH_REMODEL',
  'KITCHEN_REMODEL',
  'WINDOW_DOOR_REPLACEMENT',
  'SIDING_EXTERIOR',
  'DECK_INSTALLATION',
  'FENCE_INSTALLATION',
  'POOL_BARRIER',
  'ROOM_ADDITION',
  'FOUNDATION_REPAIR'
]);

export const jurisdictionSchema = z.enum([
  'PINELLAS_COUNTY',
  'ST_PETERSBURG',
  'CLEARWATER',
  'LARGO',
  'PALM_HARBOR'
]);

// QuickStart schema - simplified flow
export const quickStartSchema = z.object({
  jobType: jobTypeSchema,
  address: z.string().min(5).max(200),
  jurisdiction: jurisdictionSchema.default('PINELLAS_COUNTY'),
  // Optional conditional fields based on job type
  buildingType: z.enum(['single-family', 'commercial']).optional(),
  isAlteringShape: z.boolean().optional(),
  isTankless: z.boolean().optional(),
  isGas: z.boolean().optional(),
  deckHeight: z.enum(['under-30in', 'over-30in']).optional(),
  isAttached: z.boolean().optional(),
  // Free text for NLP fallback
  description: z.string().max(500).optional(),
});

export const jobAnalysisRequestSchema = z.object({
  jobType: jobTypeSchema,
  jurisdiction: jurisdictionSchema,
  address: z.string().min(5).max(200),
  description: z.string().max(1000).optional().default(''),
  squareFootage: z.number().positive().optional(),
  yearBuilt: z.number().int().min(1900).max(2030).optional(),
});

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(2000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
  jobContext: z.object({
    jobType: z.string().optional(),
    jurisdiction: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
});

export const documentUploadSchema = z.object({
  jobId: z.string().uuid(),
  requirementId: z.string().optional(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
});

export const requirementStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'not_applicable']);

// Type exports
export type QuickStartInput = z.infer<typeof quickStartSchema>;
export type JobAnalysisRequest = z.infer<typeof jobAnalysisRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

// Validation helper functions
export function validateQuickStart(data: unknown): { success: true; data: QuickStartInput } | { success: false; errors: string[] } {
  const result = quickStartSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  };
}

export function validateChatRequest(data: unknown): { success: true; data: ChatRequest } | { success: false; errors: string[] } {
  const result = chatRequestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  };
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/\\/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100);
}
