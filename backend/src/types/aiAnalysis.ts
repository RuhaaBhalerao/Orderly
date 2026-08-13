import { z } from 'zod';

/**
 * AI Risk object schema
 */
export const AiRiskSchema = z.object({
  title: z.string().describe('Risk title'),
  severity: z.enum(['Low', 'Medium', 'High']).describe('Risk severity level'),
  description: z.string().describe('Risk description'),
});

export type AiRisk = z.infer<typeof AiRiskSchema>;

/**
 * AI Analysis Response schema
 * Validates the structured response from OpenRouter
 */
export const AiAnalysisSchema = z.object({
  summary: z.string().nullable().describe('AI-generated contract summary'),
  contractType: z.string().nullable().describe('Identified contract type'),
  vendor: z.string().nullable().describe('Identified vendor name'),
  effectiveDate: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Date must be in YYYY-MM-DD format'
    )
    .describe('Effective date in YYYY-MM-DD format'),
  expiryDate: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Date must be in YYYY-MM-DD format'
    )
    .describe('Expiry date in YYYY-MM-DD format'),
  riskLevel: z
    .enum(['Low', 'Medium', 'High'])
    .nullable()
    .describe('Overall risk level'),
  keyTerms: z
    .array(z.string())
    .describe('Key terms found in contract'),
  risks: z
    .array(AiRiskSchema)
    .describe('Identified risks in contract'),
  recommendations: z
    .array(z.string())
    .describe('AI recommendations for contract review'),
});

export type AiAnalysisResponse = z.infer<typeof AiAnalysisSchema>;

/**
 * Validates AI response
 * Throws ZodError if validation fails
 */
export function validateAiResponse(data: unknown): AiAnalysisResponse {
  return AiAnalysisSchema.parse(data);
}

/**
 * Safely validates AI response
 * Returns result object instead of throwing
 */
export function validateAiResponseSafe(
  data: unknown
): { success: boolean; data?: AiAnalysisResponse; error?: string } {
  try {
    const validated = AiAnalysisSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    const message = error instanceof z.ZodError 
      ? error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ')
      : 'Invalid AI response format';
    return { success: false, error: message };
  }
}
