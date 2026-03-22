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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import Link from "next/link";

interface GrammarRule {
  id: string;
  title: string;
  shortcut: string;
  explanation: string;
  examples: string[];
  week: number;
}

export function GrammarClient({
  rules,
  currentWeek,
}: {
  rules: GrammarRule[];
  currentWeek: number;
}) {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [altExplanation, setAltExplanation] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState<string | null>(null);

  const weeks = [1, 2, 3, 4, 5];

  async function explainDifferently(rule: GrammarRule) {
    setLoading(rule.id);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Explain this French grammar rule in a completely different way than: "${rule.shortcut}"\n\nRule: ${rule.title}\nOriginal explanation: ${rule.explanation}\n\nGive me a fresh analogy, metaphor, or pattern to remember it.`,
          systemPrompt:
            "You are a French grammar expert. Explain grammar using memorable shortcuts, analogies, and patterns. Be concise (3-4 sentences max). Don't repeat the original explanation.",
          useSmartModel: true,
        }),
      });
      const data = await res.json();
      setAltExplanation((prev) => ({ ...prev, [rule.id]: data.text }));
    } catch {
      setAltExplanation((prev) => ({
        ...prev,
        [rule.id]: "Could not generate alternative explanation.",
      }));
    }
    setLoading(null);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grammar Shortcuts</h1>
          <p className="text-sm text-muted-foreground">
            Practical rules with memory tricks
          </p>
        </div>
        <Link href="/grammar/reference">
          <Button variant="outline" size="sm" className="gap-1">
            <BookOpen className="h-3 w-3" /> Cheat Sheet
          </Button>
        </Link>
      </div>

      <Tabs defaultValue={`week${currentWeek}`}>
        <TabsList className="w-full">
          {weeks.map((w) => (
            <TabsTrigger
              key={w}
              value={`week${w}`}
              disabled={w > currentWeek}
              className="flex-1"
            >
              W{w}
              {w > currentWeek && " 🔒"}
            </TabsTrigger>
          ))}
        </TabsList>

        {weeks.map((w) => (
          <TabsContent key={w} value={`week${w}`} className="space-y-3 mt-4">
            {rules
              .filter((r) => r.week === w)
              .map((rule) => {
                const isExpanded = expandedRule === rule.id;
                return (
                  <Card key={rule.id}>
                    <button
                      onClick={() =>
                        setExpandedRule(isExpanded ? null : rule.id)
                      }
                      className="w-full text-left"
                    >
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            {rule.title}
                          </CardTitle>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          {rule.shortcut}
                        </CardDescription>
                      </CardHeader>
                    </button>

                    {isExpanded && (
                      <CardContent className="pt-0 px-4 pb-4 space-y-3">
                        <p className="text-sm">{rule.explanation}</p>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Examples
                          </p>
                          {rule.examples.map((ex, i) => (
                            <p key={i} className="text-sm text-muted-foreground">
                              {ex}
                            </p>
                          ))}
                        </div>

                        {altExplanation[rule.id] && (
                          <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="py-3 px-4">
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                Alternative Explanation
                              </p>
                              <p className="text-sm">
                                {altExplanation[rule.id]}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => explainDifferently(rule)}
                            disabled={loading === rule.id}
                          >
                            <Sparkles className="h-3 w-3" />
                            {loading === rule.id
                              ? "Thinking..."
                              : "Explain Differently"}
                          </Button>
                          <Link href={`/grammar/${rule.id}`}>
                            <Button variant="outline" size="sm">
                              Practice
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
