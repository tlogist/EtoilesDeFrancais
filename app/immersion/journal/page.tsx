"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";

const JOURNAL_PROMPTS = [
  "Describe your day in French (use je suis, j'ai, je vais...)",
  "Write about your favorite food and why you like it",
  "Describe the weather today and what you plan to do",
  "Write about a friend or family member",
  "What did you learn in French this week?",
  "Describe your morning routine",
  "Write about a place you want to visit in France",
];

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [correction, setCorrection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pick a prompt based on the day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const prompt = JOURNAL_PROMPTS[dayOfYear % JOURNAL_PROMPTS.length];

  async function submitForCorrection() {
    if (!entry.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Please review this French journal entry from a learner:\n\n"${entry}"\n\nProvide corrections and encouragement.`,
          systemPrompt: `You are a supportive French writing tutor reviewing a journal entry from a learner.

RULES:
1. First, acknowledge what the student did well (even small things)
2. Then list corrections as: "Original -> Corrected" with a brief explanation
3. Suggest 1-2 ways to make a sentence sound more natural/native
4. End with an encouraging note about their progress
5. Keep your response concise and focused on the most important improvements`,
          useSmartModel: true,
        }),
      });
      const data = await res.json();
      setCorrection(data.text);
      setSubmitted(true);

      // Record progress
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "immersion",
          activity: "journal",
          timeSpent: 300,
        }),
      });
    } catch {
      setCorrection("Could not get corrections. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/immersion">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">French Journal</h1>
          <p className="text-sm text-muted-foreground">
            Write in French, get AI corrections
          </p>
        </div>
      </div>

      {/* Daily Prompt */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-3 px-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
            Today&apos;s Prompt
          </p>
          <p className="text-sm">{prompt}</p>
        </CardContent>
      </Card>

      {/* Writing Area */}
      <div className="space-y-3">
        <Textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Ecrivez ici en francais... (Write here in French...)"
          className="min-h-[150px] text-base"
          disabled={submitted}
        />

        {!submitted && (
          <Button
            onClick={submitForCorrection}
            disabled={!entry.trim() || loading}
            className="w-full gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? "Getting corrections..." : "Submit for Correction"}
          </Button>
        )}
      </div>

      {/* Corrections */}
      {correction && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Corrections & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-line">
            {correction}
          </CardContent>
        </Card>
      )}

      {submitted && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setEntry("");
            setCorrection(null);
            setSubmitted(false);
          }}
        >
          Write Another Entry
        </Button>
      )}
    </div>
  );
}
