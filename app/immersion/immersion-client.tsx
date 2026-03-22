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
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Headphones,
  Video,
  PenLine,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";

interface ImmersionTask {
  id: string;
  week: number;
  day: number;
  title: string;
  description: string;
  type: string;
  resourceUrl: string | null;
  durationMins: number;
  completed: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  podcast: <Headphones className="h-4 w-4" />,
  youtube: <Video className="h-4 w-4" />,
  exercise: <PenLine className="h-4 w-4" />,
  drill: <Dumbbell className="h-4 w-4" />,
};

export function ImmersionClient({
  tasks,
  currentWeek,
  currentDay,
}: {
  tasks: ImmersionTask[];
  currentWeek: number;
  currentDay: number;
}) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(tasks.filter((t) => t.completed).map((t) => t.id))
  );

  // Group tasks by day
  const tasksByDay = new Map<number, ImmersionTask[]>();
  for (const task of tasks) {
    if (!tasksByDay.has(task.day)) tasksByDay.set(task.day, []);
    tasksByDay.get(task.day)!.push(task);
  }

  async function toggleComplete(taskId: string) {
    const newCompleted = new Set(completedIds);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedIds(newCompleted);

    // Persist to server
    await fetch("/api/immersion/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, completed: newCompleted.has(taskId) }),
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Immersion Plan</h1>
          <p className="text-sm text-muted-foreground">
            35-day structured French immersion
          </p>
        </div>
        <Link href="/immersion/journal">
          <Button size="sm" variant="outline" className="gap-1">
            <PenLine className="h-3 w-3" /> Journal
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {Array.from(tasksByDay.entries()).map(([day, dayTasks]) => {
          const isToday = day === currentDay;
          const isFuture = day > currentDay;
          const dayCompleted = dayTasks.every((t) => completedIds.has(t.id));

          return (
            <div key={day}>
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className={`text-sm font-semibold ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Day {day}
                  {isToday && " (Today)"}
                </h3>
                {dayCompleted && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>

              <div className="space-y-2">
                {dayTasks.map((task) => {
                  const isDone = completedIds.has(task.id);
                  return (
                    <Card
                      key={task.id}
                      className={
                        isFuture ? "opacity-50" : isDone ? "border-green-500/30 bg-green-500/5" : ""
                      }
                    >
                      <CardContent className="flex items-start gap-3 py-3 px-4">
                        <button
                          onClick={() => !isFuture && toggleComplete(task.id)}
                          className="mt-0.5 shrink-0"
                          disabled={isFuture}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              isDone ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs gap-1">
                              {typeIcons[task.type]}
                              {task.durationMins} min
                            </Badge>
                            {task.resourceUrl && (
                              <a
                                href={task.resourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary flex items-center gap-1 hover:underline"
                              >
                                Open <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
