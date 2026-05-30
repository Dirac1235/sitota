import { GoogleGenAI } from '@google/genai';

/**
 * Reusable Unified Google Gen AI Service
 * Built utilizing the latest official SDK (@google/genai) and models:
 * - nano-banana-pro-preview: State-of-the-art native image generation and editing model
 * - gemini-2.5-flash: Recommended model for light and fast content generation
 */

// Initialize client lazily to handle missing API keys gracefully at initialization
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in your environment variables.');
  }
  return new GoogleGenAI({ apiKey });
}

interface ImageGenerationOptions {
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  numberOfImages?: number;
}

interface ImageGenerationResult {
  success: boolean;
  imageBytes?: string; // Base64 data string
  error?: string;
  code?: string;
}

/**
 * Generates a photorealistic studio rendering of a customized product using Gemini Nano Banana Pro
 */
export async function generateVisualRender(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResult> {
  console.log(`[Gemini Service] Starting Nano Banana image generation with prompt: "${prompt.slice(0, 100)}..."`);
  
  try {
    const ai = getGenAIClient();

    // Call the official unified SDK content generator using the state-of-the-art nano-banana model!
    const response = await ai.models.generateContent({
      model: 'nano-banana-pro-preview',
      contents: prompt,
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Bytes = part?.inlineData?.data;
    
    if (base64Bytes) {
      console.log('[Gemini Service] Nano Banana image successfully generated.');
      return {
        success: true,
        imageBytes: base64Bytes, // returns base64 bytes directly
      };
    }

    return {
      success: false,
      error: 'The Nano Banana model did not return any image data in the response parts.',
      code: 'EMPTY_RESPONSE',
    };

  } catch (error: any) {
    console.error('[Gemini Service] Nano Banana Image Generation Failed:', error);
    
    // Parse Google Gen AI API specific error responses
    const message = error.message || '';
    const status = error.status || '';

    // Handle credentials issues
    if (message.includes('API key') || message.includes('key not valid') || status === 401) {
      return {
        success: false,
        error: 'Authentication failed. Please verify that your GEMINI_API_KEY is valid.',
        code: 'INVALID_API_KEY',
      };
    }

    // Handle safety / content filter exceptions
    if (message.includes('safety') || message.includes('blocked') || message.includes('policy')) {
      return {
        success: false,
        error: 'The request was flagged and blocked by Google content safety policies.',
        code: 'SAFETY_BLOCK',
      };
    }

    // Handle rate-limits
    if (status === 429 || message.includes('quota') || message.includes('rate limit')) {
      return {
        success: false,
        error: 'The system has temporarily reached its rate limits. Please retry shortly.',
        code: 'RATE_LIMIT_EXCEEDED',
      };
    }

    return {
      success: false,
      error: message || 'An unexpected error occurred in the image generation pipeline.',
      code: 'GENERATION_ERROR',
    };
  }
}

/**
 * Analyzes configuration choices and generates a descriptive, tailored one-line rendering summary using Gemini 2.5 Flash
 */
export async function generateContentSummary(prompt: string): Promise<string | null> {
  try {
    const ai = getGenAIClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || null;
  } catch (err) {
    console.error('[Gemini Service] Content Summary Generation Failed:', err);
    return null;
  }
}

/**
 * Parses and describes an uploaded brand asset (PNG/JPG) using Gemini 2.5 Flash Vision capabilities
 */
export async function describeBrandAsset(base64Data: string, mimeType: string): Promise<string | null> {
  try {
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: "Describe this uploaded brand logo in detail. What are its exact shapes, icons, text, symbols, and primary colors? Keep it extremely brief, under 12 words, without intro remarks. E.g. 'a red circular target symbol' or 'a blue modern lowercase 'a' text icon'."
        },
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        }
      ]
    });

    return response.text?.trim() || null;
  } catch (err) {
    console.error('[Gemini Service] Brand Asset Description Failed:', err);
    return null;
  }
}
