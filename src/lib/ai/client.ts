import OpenAI from "openai";

function getOpenAIClient(): OpenAI | null {
  const isRouter = !!process.env.OPENROUTER_API_KEY;
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here" || apiKey === "your_openrouter_api_key_here") return null;

  const baseURL = isRouter ? "https://openrouter.ai/api/v1" : undefined;

  return new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: baseURL ? {
      "HTTP-Referer": "https://resume-to-portfolio.app",
      "X-Title": "Resume to Portfolio AI",
    } : undefined,
  });
}

export function isAIEnabled(): boolean {
  return getOpenAIClient() !== null;
}

export async function callOpenAI<T>(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.4
): Promise<T | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature,
    });

    let content = response.choices[0]?.message?.content;
    if (!content) return null;

    // OpenRouter / other models sometimes wrap the JSON in markdown blocks even with json_object enabled
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      content = match[1];
    }
    content = content.trim();

    return JSON.parse(content) as T;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return null;
  }
}
