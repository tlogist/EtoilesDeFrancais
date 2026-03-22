"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakFrench } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  text: string;
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

export function SpeakButton({
  text,
  size = "icon",
  className,
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSpeak() {
    if (speaking || loading) return;

    setLoading(true);
    try {
      setSpeaking(true);
      setLoading(false);
      await speakFrench(text);
    } catch {
      // Silently fail — audio is non-critical
    }
    setSpeaking(false);
    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleSpeak}
      disabled={loading || speaking}
      className={cn(speaking && "text-primary", className)}
      aria-label={`Listen to "${text}"`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className={cn("h-4 w-4", speaking && "animate-pulse")} />
      )}
    </Button>
  );
}
