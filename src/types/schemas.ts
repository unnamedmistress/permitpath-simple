import { z } from 'zod';

export const aiRequirementSchema = z.object({
  category: z.enum(['document', 'drawing', 'inspection', 'fee', 'license', 'insurance']),
  title: z.string().min(1),
  description: z.string().min(1),
  isRequired: z.boolean(),
  actionType: z.string().min(1).optional(),
  sourceUrl: z.string().url().optional(),
  minimumCriteria: z.string().min(1).optional(),
  whoCanHelp: z.string().min(1).optional(),
  plainLanguageWhy: z.string().min(1).optional(),
  acceptedFormats: z.array(z.string().min(1)).optional(),
  allowsMultipleUploads: z.boolean().optional(),
  goodUploadExample: z.string().min(1).optional()
});

export const aiJobAnalysisSchema = z.object({
  requirements: z.array(aiRequirementSchema),
  estimatedTimeline: z.string().optional(),
  estimatedCost: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).optional()
});

export const aiDocumentValidationSchema = z.object({
  isValid: z.boolean().optional(),
  issues: z.array(z.string()).optional()
});

export type AiRequirement = z.infer<typeof aiRequirementSchema>;
export type AiJobAnalysis = z.infer<typeof aiJobAnalysisSchema>;
export type AiDocumentValidation = z.infer<typeof aiDocumentValidationSchema>;
