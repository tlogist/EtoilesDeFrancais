import { prisma } from "@/lib/db";
import { getDailyActivities } from "@/lib/curriculum";
import { DashboardClient } from "@/components/dashboard-client";

// Always re-fetch — progress changes on every visit
export const dynamic = "force-dynamic";

async function getUserData() {
  let user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });
  if (!user) {
    user = await prisma.user.create({
      data: { id: "default-user" },
    });
  }
  return user;
}

async function getPhraseOfTheDay() {
  const phrases = await prisma.phrase.findMany({
    where: { week: { lte: 1 } },
  });
  if (phrases.length === 0) return null;
  // Rotate daily based on day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return phrases[dayOfYear % phrases.length];
}

async function getTodayProgress() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.progress.findMany({
    where: {
      userId: "default-user",
      date: { gte: today },
    },
  });
}

export default async function DashboardPage() {
  const [user, phraseOfTheDay, todayProgress] = await Promise.all([
    getUserData(),
    getPhraseOfTheDay(),
    getTodayProgress(),
  ]);

  const activities = getDailyActivities(user.currentWeek, user.currentDay);
  const completedModules = new Set(todayProgress.map((p) => p.module));

  return (
    <DashboardClient
      user={{
        currentWeek: user.currentWeek,
        currentDay: user.currentDay,
        streakDays: user.streakDays,
      }}
      activities={activities}
      completedModules={Array.from(completedModules)}
      phraseOfTheDay={phraseOfTheDay}
    />
  );
}
