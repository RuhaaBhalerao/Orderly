import { validateAiResponseSafe, AiAnalysisResponse } from '../types/aiAnalysis';

/**
 * Maximum text length to send to OpenRouter (tokens)
 * This is a safety limit to prevent excessive token usage and timeouts
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
 * Truncates extracted text to a safe length
 * Handles truncation at word boundaries to avoid cutting mid-word
 */
function truncateText(text: string, maxLength: number): { text: string; truncated: boolean } {
  if (text.length <= maxLength) {
    return { text, truncated: false };
  }

  // Find the last space within the limit
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const finalLength = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;

  return {
    text: text.substring(0, finalLength).trim(),
    truncated: true,
  };
}

/**
 * Analyzes a contract using OpenRouter API
 * Sends extracted text to the AI model and returns structured analysis
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
    // Validate inputs
    if (!extractedText || extractedText.trim().length === 0) {
      return {
        success: false,
        error: 'No extracted text provided for analysis',
      };
    }

    // Check environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL;

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      return {
        success: false,
        error: 'AI service not configured. Please set OPENROUTER_API_KEY in environment variables.',
      };
    }

    if (!model) {
      console.error('OPENROUTER_MODEL not configured');
      return {
        success: false,
        error: 'AI model not configured. Please set OPENROUTER_MODEL in environment variables.',
      };
    }

    console.log(`[AI Service] Starting analysis with model: ${model}`);

    // Truncate text if necessary
    const { text: truncatedText, truncated } = truncateText(extractedText, MAX_TEXT_LENGTH);

    if (truncated) {
      console.warn(
        `[AI Service] Contract text truncated from ${extractedText.length} to ${truncatedText.length} characters`
      );
    }

    // Prepare the request payload
    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Please analyze the following contract and return structured analysis:\n\n${truncatedText}`,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent/deterministic responses
      max_tokens: 2048, // Should be enough for the response
    };

    console.log(`[AI Service] Sending request to OpenRouter (${model})...`);

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      const statusCode = response.status;
      const errorMessage = errorData.error?.message || response.statusText;

      console.error(`[AI Service] OpenRouter API error (${statusCode}):`, errorMessage);

      // Handle specific error codes
      if (statusCode === 429) {
        return {
          success: false,
          error: 'AI service is currently rate-limited. Please try again in a moment.',
        };
      }

      if (statusCode === 401 || statusCode === 403) {
        return {
          success: false,
          error: 'AI service authentication failed. Please check API configuration.',
        };
      }

      if (statusCode >= 500) {
        return {
          success: false,
          error: 'AI service is temporarily unavailable. Please try again later.',
        };
      }

      return {
        success: false,
        error: `AI service error: ${errorMessage}`,
      };
    }

    // Parse response
    const responseData = await response.json() as any;
    console.log('[AI Service] Received response from OpenRouter');

    // Extract the model's response
    const aiResponseText =
      responseData.choices?.[0]?.message?.content || responseData.result?.choices?.[0]?.text;

    if (!aiResponseText) {
      console.error('[AI Service] No content in API response');
      return {
        success: false,
        error: 'Received empty response from AI service',
      };
    }

    console.log('[AI Service] Parsing AI response...');

    // Parse JSON from response
    // The AI might return text with JSON embedded, so we try to extract it
    let jsonData: unknown;

    try {
      // Try direct JSON parse first
      jsonData = JSON.parse(aiResponseText);
    } catch {
      // If that fails, try to find JSON in the response
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          jsonData = JSON.parse(jsonMatch[0]);
        } catch {
          console.error('[AI Service] Failed to parse JSON from response:', aiResponseText.substring(0, 200));
          return {
            success: false,
            error: 'Failed to parse AI response as JSON',
          };
        }
      } else {
        console.error('[AI Service] No JSON found in response:', aiResponseText.substring(0, 200));
        return {
          success: false,
          error: 'AI response did not contain valid JSON',
        };
      }
    }

    // Validate response structure
    const validation = validateAiResponseSafe(jsonData);

    if (!validation.success) {
      console.error('[AI Service] Response validation failed:', validation.error);
      return {
        success: false,
        error: `Invalid AI response structure: ${validation.error}`,
      };
    }

    console.log('[AI Service] Analysis complete and validated');

    return {
      success: true,
      analysis: validation.data,
      textTruncated: truncated,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Service] Unexpected error:', errorMessage);
    return {
      success: false,
      error: `Unexpected error during analysis: ${errorMessage}`,
    };
  }
}

/**
 * Formats analysis result for response
 * Converts database-stored analysis to API response format
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
 * System prompt for conversational chat about contracts
 * Different from analysis prompt - focused on answering specific questions
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
 * Generates a conversational AI response to a user question about a contract
 * Used for the chat Q&A functionality
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
    // Validate inputs
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

    // Check environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL;

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      return {
        success: false,
        error: 'AI service not configured. Please set OPENROUTER_API_KEY in environment variables.',
      };
    }

    if (!model) {
      console.error('OPENROUTER_MODEL not configured');
      return {
        success: false,
        error: 'AI model not configured. Please set OPENROUTER_MODEL in environment variables.',
      };
    }

    console.log(`[Chat AI] Generating response with model: ${model}`);

    // Truncate contract text to fit in context window
    // Leave space for: system prompt + summary + question + response
    // Estimate: system=500 tokens, summary=200, question=100, response=500 = 1300 tokens reserved
    // Model limit: 2048 tokens, so ~750 tokens available for contract text (~3000 chars)
    const CONTRACT_CONTEXT_LIMIT = 30000; // ~7500 tokens
    const { text: truncatedText, truncated } = truncateText(contractText, CONTRACT_CONTEXT_LIMIT);

    if (truncated) {
      console.warn(`[Chat AI] Contract text truncated from ${contractText.length} to ${truncatedText.length} characters`);
    }

    // Build the user message with contract context
    const userMessageContent = contractSummary
      ? `Contract Summary:\n${contractSummary}\n\nFull Contract Text:\n${truncatedText}\n\nQuestion:\n${userQuestion}`
      : `Contract Text:\n${truncatedText}\n\nQuestion:\n${userQuestion}`;

    // Prepare the API request
    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: CHAT_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessageContent,
        },
      ],
      temperature: 0.5, // Slightly higher than analysis for more natural conversation
      max_tokens: 1024, // Reasonable limit for chat response
    };

    console.log('[Chat AI] Sending request to OpenRouter...');

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      const statusCode = response.status;
      const errorMessage = errorData.error?.message || response.statusText;

      console.error(`[Chat AI] OpenRouter API error (${statusCode}):`, errorMessage);

      if (statusCode === 429) {
        return {
          success: false,
          error: 'AI service is currently rate-limited. Please try again in a moment.',
        };
      }

      if (statusCode === 401 || statusCode === 403) {
        return {
          success: false,
          error: 'AI service authentication failed. Please check API configuration.',
        };
      }

      if (statusCode >= 500) {
        return {
          success: false,
          error: 'AI service is temporarily unavailable. Please try again later.',
        };
      }

      return {
        success: false,
        error: `AI service error: ${errorMessage}`,
      };
    }

    // Parse response
    const responseData = await response.json() as any;
    console.log('[Chat AI] Received response from OpenRouter');

    // Extract the assistant's message
    const aiResponseText = responseData.choices?.[0]?.message?.content;

    if (!aiResponseText) {
      console.error('[Chat AI] No content in API response');
      return {
        success: false,
        error: 'Received empty response from AI service',
      };
    }

    console.log('[Chat AI] Response generated successfully');

    return {
      success: true,
      response: aiResponseText,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Chat AI] Unexpected error:', errorMessage);
    return {
      success: false,
      error: `Unexpected error during chat: ${errorMessage}`,
    };
  }
}
