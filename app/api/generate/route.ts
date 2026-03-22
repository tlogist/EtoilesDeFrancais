import { anthropic, FAST_MODEL, SMART_MODEL } from "@/lib/claude";

export async function POST(request: Request) {
  const { prompt, systemPrompt, useSmartModel } = await request.json();

  const response = await anthropic.messages.create({
    model: useSmartModel ? SMART_MODEL : FAST_MODEL,
    max_tokens: 1024,
    system: systemPrompt || "",
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  return Response.json({ text });
}
