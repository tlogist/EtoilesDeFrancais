import { prisma } from "@/lib/db";
import { ConversationListClient } from "./conversation-list-client";
import { getUnlockedContent } from "@/lib/curriculum";

export const dynamic = "force-dynamic";

const TOPIC_META: Record<string, { label: string; emoji: string }> = {
  "introducing-yourself": { label: "Introducing Yourself", emoji: "👋" },
  "basic-greetings": { label: "Basic Greetings", emoji: "🤝" },
  "at-the-cafe": { label: "At the Cafe", emoji: "☕" },
  "asking-directions": { label: "Asking Directions", emoji: "🗺" },
  "at-the-market": { label: "At the Market", emoji: "🛒" },
  "at-a-restaurant": { label: "At a Restaurant", emoji: "🍽" },
  "meeting-someone": { label: "Meeting Someone", emoji: "🙂" },
  "telling-a-story": { label: "Telling a Story", emoji: "📖" },
  "phone-call": { label: "Phone Call", emoji: "📱" },
  "making-plans": { label: "Making Plans", emoji: "📅" },
  "expressing-opinions": { label: "Expressing Opinions", emoji: "💭" },
  debate: { label: "Debate", emoji: "⚖" },
  storytelling: { label: "Storytelling", emoji: "✨" },
  "free-conversation": { label: "Free Conversation", emoji: "💬" },
};

export default async function ConversationPage() {
  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });
  const week = user?.currentWeek || 1;
  const unlocked = getUnlockedContent(week);

  const topics = unlocked.conversation.topics.map((t) => ({
    id: t,
    label: TOPIC_META[t]?.label || t,
    emoji: TOPIC_META[t]?.emoji || "💬",
  }));

  const conversations = await prisma.conversation.findMany({
    where: { userId: "default-user" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <ConversationListClient
      topics={topics}
      conversations={conversations.map((c) => ({
        id: c.id,
        topic: c.topic,
        createdAt: c.createdAt.toISOString(),
        messageCount: JSON.parse(c.messages).length,
      }))}
      week={week}
    />
  );
}
