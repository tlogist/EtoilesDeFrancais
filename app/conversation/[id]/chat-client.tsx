"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpeakButton } from "@/components/audio/speak-button";
import { Send, Lightbulb, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatClient({
  conversationId,
  topic,
  initialMessages,
  week,
}: {
  conversationId: string;
  topic: string;
  initialMessages: Message[];
  week: number;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-start conversation with a greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      sendToAssistant([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // End session: save conversation with profile update flag
  const endSession = useCallback(async () => {
    if (sessionEnded || messages.length < 4) return;
    setSessionEnded(true);
    // Use sendBeacon for reliability during page unload
    const payload = JSON.stringify({ messages, endSession: true });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `/api/conversations/${conversationId}`,
        new Blob([payload], { type: "application/json" })
      );
    } else {
      await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
    }
  }, [messages, conversationId, sessionEnded]);

  // Trigger profile update when leaving the page
  useEffect(() => {
    const handleUnload = () => endSession();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [endSession]);

  async function sendToAssistant(currentMessages: Message[]) {
    setStreaming(true);

    // If no messages yet, add a system-like first user message
    const toSend =
      currentMessages.length === 0
        ? [{ role: "user" as const, content: `Let's practice! Topic: ${topic}. Please start the conversation in French. If you already know my name and details from the learner profile, don't ask for them again — greet me by name and pick up from where we are in our learning journey.` }]
        : currentMessages;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toSend,
          week,
          topic,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      let assistantText = "";
      const decoder = new TextDecoder();

      // Add placeholder assistant message
      setMessages((prev) => [
        ...(currentMessages.length === 0 ? [] : prev),
        { role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            assistantText += parsed.text;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantText,
              };
              return updated;
            });
          } catch {
            // Skip unparseable chunks
          }
        }
      }

      // Save to database
      const allMessages =
        currentMessages.length === 0
          ? [{ role: "assistant", content: assistantText }]
          : [...currentMessages, { role: "assistant", content: assistantText }];

      await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      // Record conversation progress (once per session, after user's first real exchange)
      if (currentMessages.length >= 2) {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            module: "conversation",
            activity: "chat",
            timeSpent: 600,
          }),
        });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble responding. Please try again.",
        },
      ]);
    }

    setStreaming(false);
  }

  async function handleSend() {
    if (!input.trim() || streaming) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    inputRef.current?.focus();

    await sendToAssistant(newMessages);
  }

  async function handleHint() {
    if (streaming) return;
    const hintMessage: Message = {
      role: "user",
      content: "Can you give me a hint for what to say next?",
    };
    const newMessages = [...messages, hintMessage];
    setMessages(newMessages);
    await sendToAssistant(newMessages);
  }

  // Parse corrections from assistant messages
  function parseMessage(content: string) {
    const parts = content.split("---");
    const mainText = parts[0].trim();
    const corrections = parts.length > 1 ? parts.slice(1).join("---").trim() : null;
    return { mainText, corrections };
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/conversation" onClick={() => endSession()}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-sm font-semibold">
            {topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </h1>
          <p className="text-xs text-muted-foreground">Week {week}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const { mainText, corrections } = isUser
            ? { mainText: msg.content, corrections: null }
            : parseMessage(msg.content);

          return (
            <div
              key={i}
              className={cn(
                "flex",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-wrap">{mainText}</p>
                {mainText && (
                  <div className="mt-1">
                    <SpeakButton
                      text={mainText}
                      size="sm"
                      className={cn("h-6 w-6", isUser ? "opacity-80" : "opacity-60")}
                    />
                  </div>
                )}
                {corrections && (
                  <div className="mt-2 pt-2 border-t border-border/40 text-sm text-muted-foreground whitespace-pre-wrap">
                    {corrections}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {streaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3 space-y-2">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type in French..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || streaming}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-xs"
          onClick={handleHint}
          disabled={streaming}
        >
          <Lightbulb className="h-3 w-3" />
          Need a hint?
        </Button>
      </div>
    </div>
  );
}
