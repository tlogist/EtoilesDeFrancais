"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/audio/speak-button";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";

interface Word {
  id: string;
  french: string;
  english: string;
  pronunciation: string;
  category: string;
}

export function LearnClient({
  words,
  totalUnlearned,
}: {
  words: Word[];
  totalUnlearned: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [examples, setExamples] = useState<string | null>(null);
  const [loadingExamples, setLoadingExamples] = useState(false);

  const word = words[currentIndex];
  const isLast = currentIndex >= words.length - 1;

  if (!word) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 text-center space-y-4">
        <h2 className="text-xl font-bold">All caught up!</h2>
        <p className="text-muted-foreground">
          You&apos;ve seen all available words. Try reviewing!
        </p>
        <Link href="/foundation/review">
          <Button>
            <RotateCcw className="h-4 w-4 mr-2" /> Review Words
          </Button>
        </Link>
      </div>
    );
  }

  async function loadExamples() {
    setLoadingExamples(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Give me 3 practical example sentences using the French word "${word.french}" (${word.english}). For each, write the French sentence and English translation.`,
          systemPrompt:
            "You are a French vocabulary assistant. Give 3 concise example sentences showing real-world usage. Format: numbered list, each with French and (English translation).",
        }),
      });
      const data = await res.json();
      setExamples(data.text);
    } catch {
      setExamples("Failed to load examples. Try again.");
    }
    setLoadingExamples(false);
  }

  function nextWord() {
    setFlipped(false);
    setExamples(null);
    setCurrentIndex((i) => Math.min(i + 1, words.length - 1));
  }

  // Record that user has seen this word
  async function markSeen() {
    await fetch("/api/vocab/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: word.id, difficulty: "good" }),
    });

    // Record module progress on last word so dashboard shows completion
    if (isLast) {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "foundation",
          activity: "learn",
          timeSpent: 300,
        }),
      });
    }

    nextWord();
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Learn New Words</h1>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} of {words.length} &middot; {totalUnlearned} words
            remaining
          </p>
        </div>
        <Link href="/foundation">
          <Button variant="ghost" size="sm">
            Done
          </Button>
        </Link>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(!flipped)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setFlipped(!flipped)}
        className="w-full text-left cursor-pointer"
      >
        <Card className="min-h-[250px] flex items-center justify-center hover:bg-accent/30 transition-all">
          <CardContent className="text-center py-8">
            {!flipped ? (
              <div className="space-y-3">
                <p className="text-3xl font-bold">{word.french}</p>
                <p className="text-sm text-muted-foreground">
                  Tap to reveal
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-3xl font-bold">{word.french}</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm text-muted-foreground italic">
                    /{word.pronunciation}/
                  </p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <SpeakButton text={word.french} />
                  </div>
                </div>
                <p className="text-xl">{word.english}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions (shown after flip) */}
      {flipped && (
        <div className="space-y-3">
          {/* Examples */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={loadExamples}
            disabled={loadingExamples}
          >
            <Sparkles className="h-4 w-4" />
            {loadingExamples
              ? "Loading..."
              : examples
              ? "Reload Examples"
              : "Show Example Sentences"}
          </Button>

          {examples && (
            <Card>
              <CardContent className="py-3 text-sm whitespace-pre-line">
                {examples}
              </CardContent>
            </Card>
          )}

          {/* Next */}
          <Button className="w-full gap-2" onClick={markSeen}>
            {isLast ? "Finish" : "Next Word"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
