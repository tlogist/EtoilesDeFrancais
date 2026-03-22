"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus } from "lucide-react";

interface Topic {
  id: string;
  label: string;
  emoji: string;
}

interface ConversationSummary {
  id: string;
  topic: string;
  createdAt: string;
  messageCount: number;
}

export function ConversationListClient({
  topics,
  conversations,
  week,
}: {
  topics: Topic[];
  conversations: ConversationSummary[];
  week: number;
}) {
  const router = useRouter();

  async function startConversation(topicId: string) {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topicId }),
    });
    const data = await res.json();
    router.push(`/conversation/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conversation Practice</h1>
        <p className="text-sm text-muted-foreground">
          Chat with your AI French partner
        </p>
      </div>

      {/* Topic Picker */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Start a New Conversation
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => startConversation(topic.id)}
              className="text-left"
            >
              <Card className="hover:bg-accent/50 transition-colors h-full">
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <span className="text-xl">{topic.emoji}</span>
                  <span className="text-sm font-medium">{topic.label}</span>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation History */}
      {conversations.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent Conversations
          </h2>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link key={conv.id} href={`/conversation/${conv.id}`}>
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{conv.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.createdAt).toLocaleDateString()} &middot;{" "}
                          {conv.messageCount} messages
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
