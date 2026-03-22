"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface QuizQuestion {
  type: "multiple_choice" | "fill_blank" | "complete_sentence";
  question: string;
  options?: string[];
  correct: string;
  explanation: string;
}

export function QuizClient({
  words,
  week,
}: {
  words: Array<{ french: string; english: string }>;
  week: number;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function generateQuiz() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a 10-question French vocabulary quiz for a Week ${week} learner. Use these words: ${words
            .slice(0, 20)
            .map((w) => `${w.french} = ${w.english}`)
            .join(", ")}

Mix question types: multiple_choice, fill_blank, complete_sentence.
Return JSON array: [{"type":"multiple_choice"|"fill_blank"|"complete_sentence","question":"...","options":["a","b","c","d"],"correct":"...","explanation":"..."}]
Return ONLY the JSON array.`,
          useSmartModel: true,
        }),
      });
      const data = await res.json();
      // Parse the JSON from Claude's response
      const jsonMatch = data.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        setQuestions(JSON.parse(jsonMatch[0]));
      }
    } catch {
      // Fallback: generate simple quiz from the words directly
      const fallback: QuizQuestion[] = words.slice(0, 10).map((w) => ({
        type: "fill_blank" as const,
        question: `What is the French word for "${w.english}"?`,
        correct: w.french,
        explanation: `${w.french} = ${w.english}`,
      }));
      setQuestions(fallback);
    }
    setLoading(false);
  }

  function checkAnswer(selectedAnswer?: string) {
    const q = questions[currentIndex];
    const userAnswer = (selectedAnswer || answer).toLowerCase().trim();
    const correct = q.correct.toLowerCase().trim();
    if (userAnswer === correct) {
      setScore((s) => s + 1);
    }
    setShowResult(true);
  }

  function nextQuestion() {
    if (currentIndex >= questions.length - 1) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setShowResult(false);
    }
  }

  // Start screen
  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 text-center space-y-6">
        <h1 className="text-2xl font-bold">Weekly Quiz</h1>
        <p className="text-muted-foreground">
          Test your knowledge of Week {week} vocabulary
        </p>
        <Button
          onClick={generateQuiz}
          disabled={loading}
          size="lg"
          className="gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Generating Quiz..." : "Start Quiz"}
        </Button>
        <div>
          <Link href="/foundation">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Done screen
  if (done) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 text-center space-y-6">
        <h1 className="text-2xl font-bold">Quiz Complete!</h1>
        <div className="text-6xl font-bold">
          {percent >= 80 ? "🌟" : percent >= 50 ? "👍" : "💪"}
        </div>
        <p className="text-xl">
          {score}/{questions.length} correct ({percent}%)
        </p>
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

  const q = questions[currentIndex];

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quiz</h1>
        <Badge variant="secondary">
          {currentIndex + 1}/{questions.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{q.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.type === "multiple_choice" && q.options ? (
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt) => (
                <Button
                  key={opt}
                  variant={
                    showResult
                      ? opt.toLowerCase() === q.correct.toLowerCase()
                        ? "default"
                        : "outline"
                      : "outline"
                  }
                  className="justify-start text-left h-auto py-3"
                  onClick={() => !showResult && checkAnswer(opt)}
                  disabled={showResult}
                >
                  {opt}
                  {showResult &&
                    opt.toLowerCase() === q.correct.toLowerCase() && (
                      <CheckCircle2 className="h-4 w-4 ml-auto text-green-500" />
                    )}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={showResult}
                onKeyDown={(e) =>
                  e.key === "Enter" && !showResult && checkAnswer()
                }
              />
              {!showResult && (
                <Button onClick={() => checkAnswer()}>Check</Button>
              )}
            </div>
          )}

          {showResult && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                {(answer || "").toLowerCase().trim() ===
                q.correct.toLowerCase().trim() ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm">
                  Correct answer: <strong>{q.correct}</strong>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{q.explanation}</p>
              <Button onClick={nextQuestion} className="w-full">
                {currentIndex >= questions.length - 1
                  ? "See Results"
                  : "Next Question"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
