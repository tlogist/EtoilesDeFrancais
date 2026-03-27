import { anthropic, SMART_MODEL } from "@/lib/claude";
import { getConversationPrompt } from "@/lib/prompts";
import { getLearnerProfile } from "@/lib/learner-profile";

export async function POST(request: Request) {
  const { messages, week, topic } = await request.json();

  // Load the learner profile so Claude knows about this student
  const learnerProfile = await getLearnerProfile();

  const systemPrompt = getConversationPrompt(
    week || 1,
    topic || "general",
    learnerProfile || undefined
  );

  // Convert our messages format to Anthropic format
  const anthropicMessages = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })
  );

  console.log("=== CHAT REQUEST ===");
  console.log("Profile loaded:", learnerProfile ? `${learnerProfile.length} chars` : "NONE");
  console.log("System prompt length:", systemPrompt.length);
  console.log("Messages count:", anthropicMessages.length);

  try {
    const stream = anthropic.messages.stream({
      model: SMART_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    // Return a streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (streamError) {
          console.error("Chat stream error:", streamError);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: "\n\n[Error: Connection to Claude was interrupted. Please try again.]" })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
