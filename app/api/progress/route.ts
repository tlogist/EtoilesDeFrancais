import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// Default single-user ID for this personal app
const DEFAULT_USER_ID = "default-user";

// Ensure user exists
async function getOrCreateUser() {
  let user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });
  if (!user) {
    user = await prisma.user.create({
      data: { id: DEFAULT_USER_ID },
    });
  }
  return user;
}

export async function GET() {
  const user = await getOrCreateUser();

  const progress = await prisma.progress.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { date: "desc" },
    take: 50,
  });

  // Calculate streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Response.json({
    user: {
      currentWeek: user.currentWeek,
      currentDay: user.currentDay,
      streakDays: user.streakDays,
      lastActiveAt: user.lastActiveAt,
    },
    progress,
  });
}

export async function POST(request: NextRequest) {
  const { module, activity, score, timeSpent } = await request.json();

  await getOrCreateUser();

  // Record progress
  const entry = await prisma.progress.create({
    data: {
      userId: DEFAULT_USER_ID,
      module,
      activity,
      score,
      timeSpent: timeSpent || 0,
    },
  });

  // Update last active and streak
  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = user!.streakDays;
  if (user!.lastActiveAt) {
    const lastActive = new Date(user!.lastActiveAt);
    lastActive.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff === 1) {
      newStreak += 1;
    } else if (daysDiff > 1) {
      newStreak = 1; // Streak broken
    }
    // daysDiff === 0 means same day, streak stays
  } else {
    newStreak = 1; // First activity
  }

  await prisma.user.update({
    where: { id: DEFAULT_USER_ID },
    data: {
      streakDays: newStreak,
      lastActiveAt: new Date(),
    },
  });

  return Response.json({ entry, streak: newStreak });
}

// Advance week/day
export async function PATCH(request: NextRequest) {
  const { action } = await request.json();

  if (action === "advance-day") {
    const user = await getOrCreateUser();
    const newDay = user.currentDay + 1;
    const newWeek = Math.ceil(newDay / 7);

    await prisma.user.update({
      where: { id: DEFAULT_USER_ID },
      data: {
        currentDay: newDay,
        currentWeek: Math.min(newWeek, 5),
      },
    });

    return Response.json({ day: newDay, week: Math.min(newWeek, 5) });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
