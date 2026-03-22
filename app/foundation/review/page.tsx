import { prisma } from "@/lib/db";
import { ReviewClient } from "./review-client";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const now = new Date();

  // Get words due for review (nextReview <= now)
  const dueProgress = await prisma.vocabProgress.findMany({
    where: {
      userId: "default-user",
      nextReview: { lte: now },
    },
    include: { word: true },
    take: 20,
    orderBy: { nextReview: "asc" },
  });

  // If no due reviews, get words the user has seen at least once
  let reviewWords;
  if (dueProgress.length > 0) {
    reviewWords = dueProgress.map((p) => ({
      id: p.word.id,
      french: p.word.french,
      english: p.word.english,
      pronunciation: p.word.pronunciation,
      category: p.word.category,
      repetitions: p.repetitions,
    }));
  } else {
    // Fall back to all words from user's current week for practice
    const user = await prisma.user.findUnique({
      where: { id: "default-user" },
    });
    const words = await prisma.vocabWord.findMany({
      where: { week: { lte: user?.currentWeek || 1 } },
      take: 10,
    });
    reviewWords = words.map((w) => ({
      id: w.id,
      french: w.french,
      english: w.english,
      pronunciation: w.pronunciation,
      category: w.category,
      repetitions: 0,
    }));
  }

  return (
    <ReviewClient
      words={reviewWords}
      totalDue={dueProgress.length}
    />
  );
}
