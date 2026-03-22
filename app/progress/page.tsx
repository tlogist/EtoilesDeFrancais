import { prisma } from "@/lib/db";
import { ProgressClient } from "./progress-client";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });

  const progress = await prisma.progress.findMany({
    where: { userId: "default-user" },
    orderBy: { date: "desc" },
    take: 100,
  });

  // Calculate module-level stats
  const moduleStats = new Map<
    string,
    { totalTime: number; count: number; avgScore: number | null }
  >();
  for (const p of progress) {
    const stat = moduleStats.get(p.module) || {
      totalTime: 0,
      count: 0,
      avgScore: null,
    };
    stat.totalTime += p.timeSpent;
    stat.count += 1;
    if (p.score !== null) {
      stat.avgScore =
        stat.avgScore === null
          ? p.score
          : (stat.avgScore * (stat.count - 1) + p.score) / stat.count;
    }
    moduleStats.set(p.module, stat);
  }

  // Vocab mastery
  const vocabProgress = await prisma.vocabProgress.findMany({
    where: { userId: "default-user" },
  });
  const totalVocab = await prisma.vocabWord.count({
    where: { week: { lte: user?.currentWeek || 1 } },
  });
  const masteredVocab = vocabProgress.filter((p) => p.repetitions >= 3).length;

  return (
    <ProgressClient
      user={{
        currentWeek: user?.currentWeek || 1,
        currentDay: user?.currentDay || 1,
        streakDays: user?.streakDays || 0,
      }}
      moduleStats={Object.fromEntries(moduleStats)}
      vocabStats={{ total: totalVocab, mastered: masteredVocab }}
      recentActivity={progress.slice(0, 20).map((p) => ({
        module: p.module,
        activity: p.activity,
        date: p.date.toISOString(),
        score: p.score,
        timeSpent: p.timeSpent,
      }))}
    />
  );
}
