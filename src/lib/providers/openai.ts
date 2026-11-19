import OpenAI from "openai";

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

export async function generateJsonWithOpenAI<T>(system: string, prompt: string, fallback: T): Promise<T> {
  const openai = getOpenAIClient();

  if (!openai) {
    return fallback;
  }

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    return fallback;
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}
