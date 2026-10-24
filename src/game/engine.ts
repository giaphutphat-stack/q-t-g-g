/**
 * Pure helper logic for the IELTS Closed-Loop Learning & AI Question Engine
 */

export interface AiConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

export const DEFAULT_AI_CONFIG: AiConfig = {
  endpoint: 'https://www.inroi.shop/v1/chat/completions',
  apiKey: 'sk-20269220b06bff3898023f8b671cc6cd1fea493f855bab2c7cffc3754fa7138e',
  model: 'gpt-6.1-sol',
};

/**
 * Normalizes user-provided API endpoint:
 * - Strips accidental Markdown link syntax like [url](url)
 * - Appends /v1/chat/completions if missing
 */
export function normalizeEndpoint(rawUrl: string): string {
  if (!rawUrl) return DEFAULT_AI_CONFIG.endpoint;
  let cleaned = rawUrl.trim();
  // Strip markdown [text](url) if pasted
  const mdMatch = cleaned.match(/\((https?:\/\/[^)]+)\)/);
  if (mdMatch) {
    cleaned = mdMatch[1].trim();
  }
  cleaned = cleaned.replace(/^\[+|\]+$/g, '').replace(/\/+$/, '');
  if (!cleaned.endsWith('/chat/completions')) {
    if (cleaned.endsWith('/v1')) {
      cleaned += '/chat/completions';
    } else {
      cleaned += '/v1/chat/completions';
    }
  }
  return cleaned;
}

/**
 * Strips markdown code fences (```json ... ```) and parses JSON safely
 */
export function cleanAndParseJSON<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response text');
  }
  let text = rawText.trim();
  // Remove ```json and ``` fences
  text = text.replace(/^```(?:json|javascript|js)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // If there is surrounding prose, extract the outermost JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(text) as T;
}

/**
 * Identifies the user's top weakness diagnostic tag from tag counts
 */
export function getTopWeaknessTag(tagCounts: Record<string, number>): string {
  const entries = Object.entries(tagCounts).filter(([, count]) => count > 0);
  if (entries.length === 0) return '#同义替换未认出';
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
