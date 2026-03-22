"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpeakButton } from "@/components/audio/speak-button";
import { RecordButton } from "@/components/audio/record-button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import type { PronunciationSound } from "@/lib/pronunciation-data";

interface SoundWithLock extends PronunciationSound {
  locked: boolean;
}

export function PronunciationClient({
  sounds,
  currentWeek,
}: {
  sounds: SoundWithLock[];
  currentWeek: number;
}) {
  const [expandedSound, setExpandedSound] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pronunciation</h1>
          <p className="text-sm text-muted-foreground">
            Master the sounds English speakers struggle with
          </p>
        </div>
        <Link href="/pronunciation/warmup">
          <Button size="sm">Warm-up</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {sounds.map((sound) => {
          const isExpanded = expandedSound === sound.id;
          return (
            <Card
              key={sound.id}
              className={sound.locked ? "opacity-50" : ""}
            >
              <button
                onClick={() =>
                  !sound.locked &&
                  setExpandedSound(isExpanded ? null : sound.id)
                }
                className="w-full text-left"
                disabled={sound.locked}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono font-bold text-primary">
                        {sound.ipa}
                      </span>
                      <div>
                        <CardTitle className="text-sm">{sound.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {sound.description.slice(0, 60)}...
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        W{sound.week}
                      </Badge>
                      {sound.locked ? (
                        <span>🔒</span>
                      ) : isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </button>

              {isExpanded && (
                <CardContent className="pt-0 px-4 pb-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      How to make this sound
                    </p>
                    <p className="text-sm">{sound.mouthPosition}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Closest English sound
                    </p>
                    <p className="text-sm">{sound.englishEquivalent}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Practice words
                    </p>
                    <div className="space-y-2">
                      {sound.practiceWords.map((word) => (
                        <div
                          key={word.french}
                          className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                        >
                          <div>
                            <span className="text-sm font-medium">
                              {word.french}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              /{word.phonetic}/ — {word.english}
                            </span>
                          </div>
                          <SpeakButton text={word.french} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Record yourself
                    </p>
                    <RecordButton />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
