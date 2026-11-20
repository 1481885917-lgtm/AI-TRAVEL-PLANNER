import OpenAI from "openai";

export const OPENAI_TIMEOUT_MS = 45000;
const MAX_COMPLETION_TOKENS = 8000;

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

// gpt-5+ 与 o 系列用 reasoning_effort / max_completion_tokens，不接受 temperature
function isReasoningModel(model: string) {
  return /^(gpt-5|gpt-6|o1|o3|o4)/.test(model);
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

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const body: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ]
  };

  if (isReasoningModel(model)) {
    body.max_completion_tokens = MAX_COMPLETION_TOKENS;
    // "minimal" is valid for gpt-5+ but missing from this SDK version's ReasoningEffort union
    body.reasoning_effort = "minimal" as unknown as OpenAI.ReasoningEffort;
  } else {
    body.max_tokens = MAX_COMPLETION_TOKENS;
    body.temperature = 0.4;
  }

  try {
    const response = await openai.chat.completions.create(body, {
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: 0
    });

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
