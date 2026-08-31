import { validateAiResponseSafe, AiAnalysisResponse } from '../types/aiAnalysis';

/**
 * Maximum text length to send to AI models (tokens)
 * Roughly 1 token ≈ 4 characters
 */
const MAX_TEXT_LENGTH = 100000; // ~25,000 tokens

/**
 * System prompt for contract analysis
 * Instructs the AI to analyze contracts professionally and return structured JSON
 */
const SYSTEM_PROMPT = `You are an expert contract analyst specializing in procurement and vendor agreements. 
Your task is to analyze contracts and extract key information in a structured format.

IMPORTANT RULES:
1. Analyze ONLY the provided contract text. Never invent information.
2. Return null for any field you cannot find in the contract.
3. Clearly distinguish facts (found in contract) from recommendations (your professional advice).
4. Identify potentially risky clauses and explain why they may be risky.
5. Use business-friendly language. Be concise.
6. Do NOT provide legal advice.
7. Do NOT claim certainty when the contract doesn't provide enough information.

Your response must be valid JSON matching this exact structure:
{
  "summary": "string or null",
  "contractType": "string or null",
  "vendor": "string or null",
  "effectiveDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null",
  "riskLevel": "Low | Medium | High | null",
  "keyTerms": ["string"],
  "risks": [
    {
      "title": "string",
      "severity": "Low | Medium | High",
      "description": "string"
    }
  ],
  "recommendations": ["string"]
}

Return ONLY valid JSON. Do not include explanatory text before or after the JSON.`;

/**
 * System prompt for conversational chat about contracts
 */
const CHAT_SYSTEM_PROMPT = `You are a helpful procurement contract assistant. Your role is to answer questions about contracts using ONLY the information provided to you.

IMPORTANT RULES:
1. Answer ONLY using the provided contract content. Never invent information or use outside knowledge.
2. If the contract does not contain the answer to a question, clearly state: "The contract does not contain this information."
3. Quote relevant contract sections when possible to support your answer.
4. Explain clauses in business-friendly language.
5. Do NOT provide legal advice - say "Please consult with legal counsel" if the question is about legal implications.
6. Be concise but thorough.
7. If asked about something outside the contract's scope, redirect to what information IS available.

You are helping a procurement professional understand their contracts quickly and accurately.`;

/**
 * Truncates extracted text to a safe length
 */
function truncateText(text: string, maxLength: number): { text: string; truncated: boolean } {
  if (text.length <= maxLength) {
    return { text, truncated: false };
  }

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const finalLength = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;

  return {
    text: text.substring(0, finalLength).trim(),
    truncated: true,
  };
}

/**
 * Calls LLM via OpenRouter or Google Gemini API depending on available credentials
 */
async function callLLM(
  systemPrompt: string,
  userContent: string,
  temperature = 0.3,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it';

  // Option 1: OpenRouter API if key provided
  if (openRouterKey && openRouterKey.startsWith('sk-or-')) {
    console.log(`[AI Service] Calling OpenRouter (${model})...`);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      throw new Error(errorData.error?.message || `OpenRouter API error (${response.status})`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || data.result?.choices?.[0]?.text;
    if (!content) throw new Error('Empty content from OpenRouter');
    return content;
  }

  // Option 2: Google Gemini API if GEMINI_API_KEY provided
  if (geminiKey && geminiKey.length > 10) {
    console.log('[AI Service] Calling Google Gemini API directly...');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    
    const generationConfig: any = {
      temperature,
      maxOutputTokens: maxTokens,
    };
    if (jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    let response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${userContent}` }
            ]
          }
        ],
        generationConfig
      })
    });

    if (!response.ok) {
      console.warn(`[AI Service] gemini-2.5-flash failed (${response.status}), trying gemini-1.5-flash fallback...`);
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${userContent}` }]
            }
          ],
          generationConfig
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty text from Gemini API');
    return text;
  }

  throw new Error('No valid AI API key configured (neither OPENROUTER_API_KEY nor GEMINI_API_KEY).');
}

/**
 * Analyzes a contract using AI service
 */
export async function analyzeContract(
  extractedText: string
): Promise<{
  success: boolean;
  analysis?: AiAnalysisResponse;
  error?: string;
  textTruncated?: boolean;
}> {
  try {
    if (!extractedText || extractedText.trim().length === 0) {
      return {
        success: false,
        error: 'No extracted text provided for analysis',
      };
    }

    console.log('[AI Service] Starting contract analysis...');
    const { text: truncatedText, truncated } = truncateText(extractedText, MAX_TEXT_LENGTH);

    const userPrompt = `Please analyze the following contract and return structured analysis:\n\n${truncatedText}`;
    const aiResponseText = await callLLM(SYSTEM_PROMPT, userPrompt, 0.2, 4096, true);

    let cleanText = aiResponseText.trim();
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let jsonData: unknown;
    try {
      jsonData = JSON.parse(cleanText);
    } catch {
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          jsonData = JSON.parse(cleanText.substring(firstBrace, lastBrace + 1));
        } catch (e: any) {
          console.error('[AI Service] Substring JSON parse failed:', e.message, 'Raw text:', aiResponseText.substring(0, 300));
          return {
            success: false,
            error: 'Failed to parse AI response as JSON',
          };
        }
      } else {
        console.error('[AI Service] No braces found in text. Raw text:', aiResponseText.substring(0, 300));
        return {
          success: false,
          error: 'AI response did not contain valid JSON',
        };
      }
    }

    const validation = validateAiResponseSafe(jsonData);

    if (!validation.success) {
      console.error('[AI Service] Response validation failed:', validation.error);
      return {
        success: false,
        error: `Invalid AI response structure: ${validation.error}`,
      };
    }

    console.log('[AI Service] Contract analysis successful');
    return {
      success: true,
      analysis: validation.data,
      textTruncated: truncated,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Service] Analysis error:', errorMessage);
    return {
      success: false,
      error: `AI Service Error: ${errorMessage}`,
    };
  }
}

/**
 * Formats analysis result for response
 */
export function formatAnalysisResponse(analysis: {
  aiSummary: string | null;
  aiContractType: string | null;
  aiVendor: string | null;
  aiEffectiveDate: Date | null;
  aiExpiryDate: Date | null;
  aiRiskLevel: string | null;
  aiKeyTerms: string[];
  aiRisks: any;
  aiRecommendations: string[];
}): AiAnalysisResponse {
  return {
    summary: analysis.aiSummary,
    contractType: analysis.aiContractType,
    vendor: analysis.aiVendor,
    effectiveDate: analysis.aiEffectiveDate ? analysis.aiEffectiveDate.toISOString().split('T')[0] : null,
    expiryDate: analysis.aiExpiryDate ? analysis.aiExpiryDate.toISOString().split('T')[0] : null,
    riskLevel: analysis.aiRiskLevel as 'Low' | 'Medium' | 'High' | null,
    keyTerms: analysis.aiKeyTerms || [],
    risks: (analysis.aiRisks as any) || [],
    recommendations: analysis.aiRecommendations || [],
  };
}

/**
 * Generates a conversational AI response to a user question about a contract
 */
export async function generateChatResponse(
  userQuestion: string,
  contractText: string,
  contractSummary?: string
): Promise<{
  success: boolean;
  response?: string;
  error?: string;
}> {
  try {
    if (!userQuestion || userQuestion.trim().length === 0) {
      return {
        success: false,
        error: 'Question cannot be empty',
      };
    }

    if (!contractText || contractText.trim().length === 0) {
      return {
        success: false,
        error: 'No contract text available for analysis',
      };
    }

    console.log('[Chat AI] Generating response for question...');

    const CONTRACT_CONTEXT_LIMIT = 30000;
    const { text: truncatedText } = truncateText(contractText, CONTRACT_CONTEXT_LIMIT);

    const userMessageContent = contractSummary
      ? `Contract Summary:\n${contractSummary}\n\nFull Contract Text:\n${truncatedText}\n\nQuestion:\n${userQuestion}`
      : `Contract Text:\n${truncatedText}\n\nQuestion:\n${userQuestion}`;

    const responseText = await callLLM(CHAT_SYSTEM_PROMPT, userMessageContent, 0.4, 1024, false);

    return {
      success: true,
      response: responseText,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Chat AI] Unexpected error:', errorMessage);
    return {
      success: false,
      error: `AI Chat Error: ${errorMessage}`,
    };
  }
}
