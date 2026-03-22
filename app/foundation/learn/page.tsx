import { prisma } from "@/lib/db";
import { LearnClient } from "./learn-client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function LearnPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category;
  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });

  const whereClause = {
    week: { lte: user?.currentWeek || 1 },
    ...(category ? { category } : {}),
  };

  const words = await prisma.vocabWord.findMany({
    where: whereClause,
    orderBy: { category: "asc" },
  });

  // Get existing progress to filter out already-learned words
  const progress = await prisma.vocabProgress.findMany({
    where: { userId: "default-user" },
  });
  const learnedIds = new Set(
    progress.filter((p) => p.repetitions > 0).map((p) => p.wordId)
  );

  // Show unlearned words first, then mix in learned ones
  const unlearned = words.filter((w) => !learnedIds.has(w.id));
  const toLearn = unlearned.length > 0 ? unlearned.slice(0, 5) : words.slice(0, 5);

  return (
    <LearnClient
      words={toLearn.map((w) => ({
        id: w.id,
        french: w.french,
        english: w.english,
        pronunciation: w.pronunciation,
        category: w.category,
      }))}
      totalUnlearned={unlearned.length}
    />
  );
}
