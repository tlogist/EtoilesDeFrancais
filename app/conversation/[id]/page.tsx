import { prisma } from "@/lib/db";
import { ChatClient } from "./chat-client";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });

  const messages = JSON.parse(conversation.messages) as Array<{
    role: "user" | "assistant";
    content: string;
  }>;

  return (
    <ChatClient
      conversationId={id}
      topic={conversation.topic}
      initialMessages={messages}
      week={user?.currentWeek || 1}
    />
  );
}
