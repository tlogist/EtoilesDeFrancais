"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, RotateCcw, GraduationCap } from "lucide-react";

interface Category {
  id: string;
  name: string;
  total: number;
  mastered: number;
  week: number;
}

export function FoundationClient({
  categories,
  currentWeek,
}: {
  categories: Category[];
  currentWeek: number;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vocabulary</h1>
        <p className="text-sm text-muted-foreground">
          Master the 100 most-used French words
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/foundation/learn" className="flex-1">
          <Button className="w-full gap-2">
            <BookOpen className="h-4 w-4" />
            Learn New
          </Button>
        </Link>
        <Link href="/foundation/review" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Review
          </Button>
        </Link>
        <Link href="/foundation/quiz">
          <Button variant="outline" size="icon">
            <GraduationCap className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Category Grid */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const percent =
            cat.total > 0 ? Math.round((cat.mastered / cat.total) * 100) : 0;
          const locked = cat.week > currentWeek;

          return (
            <Link
              key={cat.id}
              href={locked ? "#" : `/foundation/learn?category=${cat.id}`}
            >
              <Card
                className={
                  locked
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-accent/50 transition-colors"
                }
              >
                <CardContent className="flex items-center gap-4 py-4 px-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{cat.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        Week {cat.week}
                      </Badge>
                      {locked && (
                        <span className="text-xs text-muted-foreground">
                          🔒
                        </span>
                      )}
                    </div>
                    <Progress value={percent} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {cat.mastered}/{cat.total} mastered
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {percent}%
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
