"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/audio/speak-button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface Word {
  id: string;
  french: string;
  english: string;
  pronunciation: string;
  category: string;
  repetitions: number;
}

type Difficulty = "again" | "hard" | "good" | "easy";

const difficultyStyles: Record<Difficulty, { label: string; color: string }> = {
  again: { label: "Again", color: "bg-red-500 hover:bg-red-600" },
  hard: { label: "Hard", color: "bg-orange-500 hover:bg-orange-600" },
  good: { label: "Good", color: "bg-blue-500 hover:bg-blue-600" },
  easy: { label: "Easy", color: "bg-green-500 hover:bg-green-600" },
};

export function ReviewClient({
  words,
  totalDue,
}: {
  words: Word[];
  totalDue: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<
    Array<{ word: string; difficulty: Difficulty }>
  >([]);
  const [done, setDone] = useState(false);

  const word = words[currentIndex];
  const progressPercent =
    words.length > 0 ? Math.round((currentIndex / words.length) * 100) : 100;

  async function handleRate(difficulty: Difficulty) {
    // Send rating to API
    await fetch("/api/vocab/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: word.id, difficulty }),
    });

    setResults((prev) => [
      ...prev,
      { word: word.french, difficulty },
    ]);

    if (currentIndex >= words.length - 1) {
      // Record module progress so dashboard shows completion
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "foundation",
          activity: "review",
          timeSpent: 300,
        }),
      });
      setDone(true);
    } else {
      setFlipped(false);
      setCurrentIndex((i) => i + 1);
    }
  }

  if (words.length === 0 || done) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="text-xl font-bold">
          {words.length === 0 ? "No reviews due" : "Review complete!"}
        </h2>
        {results.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Reviewed {results.length} words
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Link href="/foundation">
            <Button variant="outline">Back to Vocab</Button>
          </Link>
          <Link href="/">
            <Button>Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Review</h1>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} of {words.length}
            {totalDue > 0 && ` (${totalDue} due)`}
          </p>
        </div>
        <Link href="/foundation">
          <Button variant="ghost" size="sm">
            Done
          </Button>
        </Link>
      </div>

      <Progress value={progressPercent} className="h-1.5" />

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(!flipped)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setFlipped(!flipped)}
        className="w-full text-left cursor-pointer"
      >
        <Card className="min-h-[220px] flex items-center justify-center hover:bg-accent/30 transition-all">
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

      {/* Difficulty Buttons (shown after flip) */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(difficultyStyles) as [Difficulty, typeof difficultyStyles.again][]).map(
            ([key, val]) => (
              <Button
                key={key}
                onClick={() => handleRate(key)}
                className={`${val.color} text-white`}
              >
                {val.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
