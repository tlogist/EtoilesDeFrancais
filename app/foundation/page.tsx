import { prisma } from "@/lib/db";
import { FoundationClient } from "./foundation-client";

export const dynamic = "force-dynamic";

async function getCategories(currentWeek: number) {
  const words = await prisma.vocabWord.findMany({
    where: { week: { lte: currentWeek } },
    orderBy: { category: "asc" },
  });

  // Group by category with progress info
  const categories = new Map<
    string,
    { name: string; total: number; week: number }
  >();

  for (const word of words) {
    const existing = categories.get(word.category);
    if (existing) {
      existing.total += 1;
    } else {
      categories.set(word.category, {
        name: word.category,
        total: 1,
        week: word.week,
      });
    }
  }

  // Get mastery counts
  const progress = await prisma.vocabProgress.findMany({
    where: { userId: "default-user" },
    include: { word: true },
  });

  const mastered = new Map<string, number>();
  for (const p of progress) {
    if (p.repetitions >= 3) {
      const cat = p.word.category;
      mastered.set(cat, (mastered.get(cat) || 0) + 1);
    }
  }

  return Array.from(categories.entries()).map(([key, val]) => ({
    id: key,
    name: key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    total: val.total,
    mastered: mastered.get(key) || 0,
    week: val.week,
  }));
}

export default async function FoundationPage() {
  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });
  const categories = await getCategories(user?.currentWeek || 1);

  return <FoundationClient categories={categories} currentWeek={user?.currentWeek || 1} />;
}
