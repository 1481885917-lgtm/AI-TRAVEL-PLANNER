import OpenAI from "openai";

export const OPENAI_TIMEOUT_MS = 30000;

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {})
  });

  return client;
}

export async function generateJsonWithOpenAI<T>(
  system: string,
  prompt: string,
  fallback: T
): Promise<{ data: T; usedFallback: boolean }> {
  const openai = getOpenAIClient();

  if (!openai) {
    return { data: fallback, usedFallback: true };
  }

  try {
    const response = await openai.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ],
        temperature: 0.4
      },
      { timeout: OPENAI_TIMEOUT_MS, maxRetries: 0 }
    );

    const content = response.choices[0]?.message.content;
    if (!content) {
      return { data: fallback, usedFallback: true };
    }

    try {
      return { data: JSON.parse(content) as T, usedFallback: false };
    } catch {
      return { data: fallback, usedFallback: true };
    }
  } catch {
    return { data: fallback, usedFallback: true };
  }
}
