"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SpeakButton } from "@/components/audio/speak-button";
import {
  Flame,
  BookOpen,
  MessageCircle,
  PenLine,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";

interface Activity {
  module: string;
  title: string;
  path: string;
  duration: number;
}

interface PhraseOfTheDay {
  french: string;
  english: string;
  context: string;
  category: string;
}

interface DashboardProps {
  user: { currentWeek: number; currentDay: number; streakDays: number };
  activities: Activity[];
  completedModules: string[];
  phraseOfTheDay: PhraseOfTheDay | null;
}

const moduleIcons: Record<string, React.ReactNode> = {
  foundation: <BookOpen className="h-4 w-4" />,
  conversation: <MessageCircle className="h-4 w-4" />,
  grammar: <PenLine className="h-4 w-4" />,
  pronunciation: <span className="text-sm">🗣</span>,
  immersion: <span className="text-sm">🌍</span>,
};

export function DashboardClient({
  user,
  activities,
  completedModules,
  phraseOfTheDay,
}: DashboardProps) {
  const completionPercent = activities.length
    ? Math.round((completedModules.length / activities.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Etoiles de Francais</h1>
          <p className="text-sm text-muted-foreground">
            Week {user.currentWeek}, Day {user.currentDay}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1.5">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-semibold text-orange-500">
            {user.streakDays}
          </span>
        </div>
      </div>

      {/* Daily Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Today&apos;s Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercent} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            {completedModules.length} of {activities.length} activities complete
          </p>
        </CardContent>
      </Card>

      {/* Today's Plan */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Today&apos;s Plan</h2>
        <div className="space-y-2">
          {activities.map((activity) => {
            const done = completedModules.includes(activity.module);
            return (
              <Link key={activity.module + activity.title} href={activity.path}>
                <Card
                  className={
                    done
                      ? "border-green-500/30 bg-green-500/5"
                      : "hover:bg-accent/50 transition-colors"
                  }
                >
                  <CardContent className="flex items-center gap-3 py-3 px-4">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.duration} min
                      </p>
                    </div>
                    <span className="text-muted-foreground">
                      {moduleIcons[activity.module]}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Phrase of the Day */}
      {phraseOfTheDay && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Phrase of the Day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">
                  {phraseOfTheDay.french}
                </p>
                <p className="text-sm text-muted-foreground">
                  {phraseOfTheDay.english}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {phraseOfTheDay.context}
                </p>
              </div>
              <SpeakButton text={phraseOfTheDay.french} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/conversation">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">Start Conversation</span>
            </Button>
          </Link>
          <Link href="/foundation/review">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Review Flashcards</span>
            </Button>
          </Link>
          <Link href="/immersion/journal">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <PenLine className="h-5 w-5" />
              <span className="text-xs">Journal Entry</span>
            </Button>
          </Link>
          <Link href="/grammar">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              <span className="text-xs">Grammar Lesson</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Module Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Modules</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "Vocab", href: "/foundation", icon: "📚" },
            { name: "Chat", href: "/conversation", icon: "💬" },
            { name: "Grammar", href: "/grammar", icon: "📝" },
            { name: "Immersion", href: "/immersion", icon: "🌍" },
            { name: "Sounds", href: "/pronunciation", icon: "🗣" },
            { name: "Phrases", href: "/phrases", icon: "🇫🇷" },
          ].map((mod) => (
            <Link key={mod.href} href={mod.href}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="flex flex-col items-center gap-1 py-4 px-2">
                  <span className="text-2xl">{mod.icon}</span>
                  <span className="text-xs font-medium">{mod.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
