import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const { topic } = await request.json();

  const conversation = await prisma.conversation.create({
    data: {
      userId: "default-user",
      topic,
      messages: "[]",
      corrections: "[]",
    },
  });

  return Response.json({ id: conversation.id });
}
