const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callGroq(messages: GroqMessage[], model = 'llama-3.3-70b-versatile'): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

export interface PhotoVerificationResult {
  isValid: boolean;
  message: string;
  issues: string[];
}

/**
 * Verify a photo using Groq vision model.
 * Checks: has a face, is passport-style, good quality, appropriate for school ID.
 */
export async function verifyIDCardPhoto(
  imageBase64: string,
  photoType: 'student' | 'father' | 'mother'
): Promise<PhotoVerificationResult> {
  const labelMap = { student: 'a child (student)', father: 'a male adult (father)', mother: 'a female adult (mother)' };

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are a school ID card photo validator. Analyze the image and check:
1. Contains exactly one clear human face
2. Face is reasonably centered and visible
3. Image is not blurry or too dark
4. Image is appropriate for a school ID card (no offensive content)
5. The person appears to be ${labelMap[photoType]}

Respond in JSON format only:
{"isValid": true/false, "issues": ["issue1", "issue2"], "message": "brief summary"}

If the photo is acceptable, return isValid:true with an empty issues array.
If there are problems, list them clearly in simple English that a parent can understand.`,
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: `Verify this ${photoType} photo for a school ID card.` },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    },
  ];

  try {
    const response = await callGroq(messages, 'llama-3.2-90b-vision-preview');
    // Parse JSON from response (may have markdown wrapping)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isValid: parsed.isValid ?? false,
        message: parsed.message || '',
        issues: parsed.issues || [],
      };
    }
    return { isValid: true, message: 'Photo appears acceptable.', issues: [] };
  } catch (error) {
    console.warn('Photo verification failed, allowing upload:', error);
    // Don't block upload if verification fails
    return { isValid: true, message: 'Verification skipped.', issues: [] };
  }
}

/**
 * Chat with the school assistant (for voice chatbot).
 */
export async function chatWithAssistant(
  userMessage: string,
  conversationHistory: GroqMessage[] = []
): Promise<string> {
  const systemMessage: GroqMessage = {
    role: 'system',
    content: `You are a helpful voice assistant for First Step School (FSPS), a preschool and primary school located in Saurabh Vihar, Badarpur, New Delhi - 110044.

School Information:
- Name: First Step School (First Step Public School / FSPS)
- Address: Saurabh Vihar, Badarpur, New Delhi - 110044
- Phone: +91-9311872001, +91-9717267473
- Classes: Pre Nursery, Nursery, LKG, UKG, Class 1st
- Timing: 8:30 AM to 1:30 PM (Summer), 9:00 AM to 2:00 PM (Winter)
- Admission: Open throughout the year, age-appropriate enrollment
- Fee: Varies by class, contact school for current fee structure
- Transport: Available for nearby areas
- Website features: Online ID cards, homework sharing, attendance tracking, parent feedback

Guidelines:
- Keep responses SHORT and conversational (2-3 sentences max) since this is a voice interface
- Be warm, friendly, and helpful
- If you don't know something specific, suggest contacting the school directly
- Always respond in the same language the user speaks (Hindi or English)
- Do NOT share any student/parent personal information (PII)
- For admission queries, suggest visiting the school or calling the numbers above`,
  };

  const messages: GroqMessage[] = [
    systemMessage,
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: userMessage },
  ];

  return callGroq(messages);
}
