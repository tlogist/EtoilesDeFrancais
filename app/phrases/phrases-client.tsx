"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpeakButton } from "@/components/audio/speak-button";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface Phrase {
  id: string;
  french: string;
  english: string;
  context: string;
  isSlang: boolean;
  week: number;
}

interface Category {
  id: string;
  name: string;
  phrases: Phrase[];
  locked: boolean;
  week: number;
}

export function PhrasesClient({
  categories,
  currentWeek,
}: {
  categories: Category[];
  currentWeek: number;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [contextDialogue, setContextDialogue] = useState<Record<string, string>>({});
  const [loadingContext, setLoadingContext] = useState<string | null>(null);

  async function showInContext(phrase: Phrase) {
    setLoadingContext(phrase.id);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a short dialogue (4 lines) using "${phrase.french}" (${phrase.english}) naturally. Format: A: ... (translation)\nB: ... (translation). Add a one-line Usage tip.`,
          systemPrompt:
            "You are a French phrase expert. Create realistic, short dialogues showing natural usage. Keep it at beginner-intermediate level.",
        }),
      });
      const data = await res.json();
      setContextDialogue((prev) => ({ ...prev, [phrase.id]: data.text }));
    } catch {
      setContextDialogue((prev) => ({
        ...prev,
        [phrase.id]: "Could not generate example.",
      }));
    }
    setLoadingContext(null);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Phrase Bank</h1>
        <p className="text-sm text-muted-foreground">
          Real phrases French people actually use
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isExpanded = expandedCategory === cat.id;
          return (
            <Card
              key={cat.id}
              className={cat.locked ? "opacity-50" : ""}
            >
              <button
                onClick={() =>
                  !cat.locked &&
                  setExpandedCategory(isExpanded ? null : cat.id)
                }
                className="w-full text-left"
                disabled={cat.locked}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">{cat.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {cat.phrases.length} phrases
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Week {cat.week}
                      </Badge>
                      {cat.locked ? (
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
                <CardContent className="pt-0 px-4 pb-4 space-y-3">
                  {cat.phrases.map((phrase) => (
                    <div
                      key={phrase.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{phrase.french}</p>
                            {phrase.isSlang && (
                              <Badge
                                variant="outline"
                                className="text-xs text-orange-500 border-orange-500/30"
                              >
                                Slang
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {phrase.english}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {phrase.context}
                          </p>
                        </div>
                        <SpeakButton text={phrase.french} />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => showInContext(phrase)}
                        disabled={loadingContext === phrase.id}
                      >
                        <Sparkles className="h-3 w-3" />
                        {loadingContext === phrase.id
                          ? "Loading..."
                          : "Use in context"}
                      </Button>

                      {contextDialogue[phrase.id] && (
                        <div className="bg-muted/50 rounded-lg p-3 text-xs whitespace-pre-line">
                          {contextDialogue[phrase.id]}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
