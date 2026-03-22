"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, BookOpen, Calendar, Trophy } from "lucide-react";

interface ProgressProps {
  user: { currentWeek: number; currentDay: number; streakDays: number };
  moduleStats: Record<
    string,
    { totalTime: number; count: number; avgScore: number | null }
  >;
  vocabStats: { total: number; mastered: number };
  recentActivity: Array<{
    module: string;
    activity: string;
    date: string;
    score: number | null;
    timeSpent: number;
  }>;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

export function ProgressClient({
  user,
  moduleStats,
  vocabStats,
  recentActivity,
}: ProgressProps) {
  const overallProgress = Math.round(
    ((user.currentDay - 1) / 35) * 100
  );
  const vocabPercent =
    vocabStats.total > 0
      ? Math.round((vocabStats.mastered / vocabStats.total) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <Calendar className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-2xl font-bold">
              {user.currentWeek}
            </span>
            <span className="text-xs text-muted-foreground">
              Week of 5
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <Flame className="h-5 w-5 text-orange-500 mb-1" />
            <span className="text-2xl font-bold">{user.streakDays}</span>
            <span className="text-xs text-muted-foreground">
              Day Streak
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <BookOpen className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-2xl font-bold">
              {vocabStats.mastered}
            </span>
            <span className="text-xs text-muted-foreground">
              Words Mastered
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <Trophy className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-2xl font-bold">{overallProgress}%</span>
            <span className="text-xs text-muted-foreground">
              Overall
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Vocabulary Mastery */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Vocabulary Mastery</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={vocabPercent} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            {vocabStats.mastered} of {vocabStats.total} words mastered (
            {vocabPercent}%)
          </p>
        </CardContent>
      </Card>

      {/* Module Stats */}
      {Object.keys(moduleStats).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Module Activity
          </h2>
          <div className="space-y-2">
            {Object.entries(moduleStats).map(([module, stats]) => (
              <Card key={module}>
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div>
                    <p className="text-sm font-medium capitalize">{module}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.count} sessions &middot;{" "}
                      {formatTime(stats.totalTime)}
                    </p>
                  </div>
                  {stats.avgScore !== null && (
                    <Badge variant="secondary">
                      {Math.round(stats.avgScore)}% avg
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent Activity
          </h2>
          <div className="space-y-1">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-1 text-sm"
              >
                <div>
                  <span className="capitalize">{activity.module}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    &middot; {activity.activity}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
