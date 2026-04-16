// src/services/llmProvider.ts
// ============================================================
// SINGLE FILE TO CHANGE WHEN SWITCHING LLM PROVIDERS
// Currently: Groq (llama-3.3-70b-versatile)
// To switch: Change PROVIDER config + the provider-specific call
// ============================================================

// ─── PROVIDER CONFIG (change this block to switch LLM) ───────
const PROVIDER = 'groq' as const;
const MODEL = 'llama-3.3-70b-versatile';
const VISION_MODEL = 'llama-3.2-90b-vision-preview';
const MAX_TOKENS = 4096;
// ──────────────────────────────────────────────────────────────

// API key from environment — NEVER expose in frontend bundle
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface LLMResponse {
  text: string;
  usage?: { inputTokens: number; outputTokens: number };
}

async function callGroq(body: Record<string, unknown>): Promise<LLMResponse> {
  if (!API_KEY) {
    throw new Error('GROQ API key not configured. Set VITE_GROQ_API_KEY in .env');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    usage: {
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
    },
  };
}

export const llm = {
  /**
   * Text-only completion (planning, reports, syllabus extraction)
   */
  async complete(systemPrompt: string, userMessage: string): Promise<LLMResponse> {
    return callGroq({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
  },

  /**
   * Vision completion (photo validation, work analysis)
   */
  async completeWithVision(
    systemPrompt: string,
    imageBase64: string,
    userMessage: string
  ): Promise<LLMResponse> {
    return callGroq({
      model: VISION_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            { type: 'text', text: userMessage },
          ],
        },
      ],
    });
  },

  /**
   * Parse JSON from LLM response (handles markdown fences)
   */
  parseJSON<T>(response: LLMResponse): T {
    let text = response.text.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    return JSON.parse(text) as T;
  },

  /** Current provider info */
  getProviderInfo() {
    return { provider: PROVIDER, model: MODEL, visionModel: VISION_MODEL };
  },
};
