import { prisma } from "@/lib/db";
import { updateLearnerProfile } from "@/lib/learner-profile";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const { messages, endSession } = await request.json();

  await prisma.conversation.update({
    where: { id },
    data: {
      messages: JSON.stringify(messages),
    },
  });

  // Update learner profile when the session ends
  if (endSession && messages.length >= 4) {
    updateLearnerProfile(messages).catch((err) =>
      console.error("Profile update failed:", err)
    );
  }

  return Response.json({ success: true });
}

export async function GET(request: Request, { params }: Props) {
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(conversation);
}
