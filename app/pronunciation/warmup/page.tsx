"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/audio/speak-button";
import { RecordButton } from "@/components/audio/record-button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const WARMUP_EXERCISES = [
  {
    title: "Nasal Vowels",
    instruction: "Listen and repeat each word 3 times, focusing on sending air through your nose.",
    words: ["Bon", "Vin", "France", "Enfant", "Chanson"],
  },
  {
    title: "The French R",
    instruction: "Gargle gently, then try to say these words with that same throat vibration.",
    words: ["Regarder", "Rouge", "Paris", "Merci", "Tres bien"],
  },
  {
    title: "U vs OU",
    instruction: "Alternate between U (lips rounded tight) and OU (lips rounded loose).",
    words: ["Tu", "Tout", "Rue", "Roue", "Vu", "Vous"],
  },
  {
    title: "Rhythm Practice",
    instruction: "Say each phrase with equal-length syllables, stressing only the last.",
    words: ["Bonjour", "Merci beaucoup", "S'il vous plait", "Excusez-moi", "Au revoir"],
  },
  {
    title: "Connected Speech",
    instruction: "Say these phrases as smoothly as possible, linking words together.",
    words: ["Comment allez-vous ?", "Je suis content", "Il est alle au cinema", "Qu'est-ce que c'est ?"],
  },
];

export default function WarmupPage() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [done, setDone] = useState(false);

  const exercise = WARMUP_EXERCISES[currentExercise];
  const progressPercent = Math.round(
    (currentExercise / WARMUP_EXERCISES.length) * 100
  );

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="text-xl font-bold">Warm-up Complete!</h2>
        <p className="text-muted-foreground">
          Great job! Your mouth is warmed up for French.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/pronunciation">
            <Button variant="outline">Back to Sounds</Button>
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
      <div className="flex items-center gap-3">
        <Link href="/pronunciation">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Daily Warm-up</h1>
          <p className="text-sm text-muted-foreground">5 minutes</p>
        </div>
      </div>

      <Progress value={progressPercent} className="h-1.5" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {currentExercise + 1}. {exercise.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {exercise.instruction}
          </p>

          <div className="space-y-2">
            {exercise.words.map((word) => (
              <div
                key={word}
                className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3"
              >
                <span className="text-lg font-medium">{word}</span>
                <SpeakButton text={word} />
              </div>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">
              Try recording yourself:
            </p>
            <RecordButton />
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full gap-2"
        onClick={async () => {
          if (currentExercise >= WARMUP_EXERCISES.length - 1) {
            await fetch("/api/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                module: "pronunciation",
                activity: "warmup",
                timeSpent: 300,
              }),
            });
            setDone(true);
          } else {
            setCurrentExercise((i) => i + 1);
          }
        }}
      >
        {currentExercise >= WARMUP_EXERCISES.length - 1
          ? "Finish Warm-up"
          : "Next Exercise"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
