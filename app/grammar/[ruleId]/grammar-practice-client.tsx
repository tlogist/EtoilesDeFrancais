"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface GrammarRule {
  id: string;
  title: string;
  shortcut: string;
  explanation: string;
  examples: string[];
  week: number;
}

interface Exercise {
  question: string;
  answer: string;
  hint: string;
}

export function GrammarPracticeClient({ rule }: { rule: GrammarRule }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  async function generateExercises() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create 5 fill-in-the-blank exercises for this French grammar rule:
Title: ${rule.title}
Rule: ${rule.shortcut}
Explanation: ${rule.explanation}

IMPORTANT RULES FOR EXERCISES:
- Each exercise should have exactly ONE blank (shown as ___) that the student fills in
- The answer must be a specific word or short phrase the student types — NEVER a pattern like "ne...pas"
- For negation: show the sentence with one missing word, e.g. "Je ___ mange pas." (answer: "ne") or "Je ne mange ___." (answer: "pas")
- For conjugation: "Je ___ content." (answer: "suis")
- For articles: "Je bois ___ café." (answer: "du")
- The answer should be 1-3 words maximum, something concrete the student can type

Return JSON: [{"question":"Complete: Je ___ mange pas de viande.","answer":"ne","hint":"first part of the negation sandwich"}]
Return ONLY the JSON array.`,
          useSmartModel: true,
        }),
      });
      const data = await res.json();
      const jsonMatch = data.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        setExercises(JSON.parse(jsonMatch[0]));
      }
    } catch {
      setExercises([
        {
          question: "Practice exercise could not be generated. Try again.",
          answer: "",
          hint: "",
        },
      ]);
    }
    setLoading(false);
  }

  function checkAnswer() {
    const correct =
      userAnswer.toLowerCase().trim() ===
      exercises[currentIndex].answer.toLowerCase().trim();
    if (correct) setScore((s) => s + 1);
    setShowResult(true);
  }

  async function next() {
    // Record progress when finishing all exercises
    if (currentIndex >= exercises.length - 1) {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "grammar",
          activity: "practice",
          score: Math.round((score / exercises.length) * 100),
          timeSpent: 600,
        }),
      });
    }
    setShowResult(false);
    setUserAnswer("");
    setCurrentIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/grammar">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{rule.title}</h1>
          <p className="text-sm text-muted-foreground">{rule.shortcut}</p>
        </div>
      </div>

      {/* Rule Card */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <p className="text-sm">{rule.explanation}</p>
          <div className="space-y-1">
            {rule.examples.map((ex, i) => (
              <p key={i} className="text-sm text-muted-foreground italic">
                {ex}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Section */}
      {exercises.length === 0 ? (
        <Button
          onClick={generateExercises}
          disabled={loading}
          className="w-full gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Generating..." : "Start Practice Exercises"}
        </Button>
      ) : currentIndex < exercises.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Exercise {currentIndex + 1} of {exercises.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg">{exercises[currentIndex].question}</p>
            {exercises[currentIndex].hint && (
              <p className="text-sm text-muted-foreground">
                Hint: {exercises[currentIndex].hint}
              </p>
            )}
            <div className="flex gap-2">
              <Input
                value={userAnswer}
                onChange={(e) => !showResult && setUserAnswer(e.target.value)}
                placeholder="Your answer..."
                readOnly={showResult}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (showResult) {
                      next();
                    } else {
                      checkAnswer();
                    }
                  }
                }}
              />
              {!showResult && (
                <Button onClick={checkAnswer}>Check</Button>
              )}
            </div>
            {showResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {userAnswer.toLowerCase().trim() ===
                  exercises[currentIndex].answer.toLowerCase().trim() ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-lg">
                    Answer: <strong>{exercises[currentIndex].answer}</strong>
                  </span>
                </div>
                <Button onClick={next} className="w-full">
                  {currentIndex >= exercises.length - 1
                    ? "Done"
                    : "Next Exercise"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Practice Complete!</h2>
          <p>
            Score: {score}/{exercises.length}
          </p>
          <Link href="/grammar">
            <Button>Back to Grammar</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
