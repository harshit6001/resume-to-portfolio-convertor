import OpenAI from "openai";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") return null;
  return new OpenAI({ apiKey });
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
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return null;
  }
}
