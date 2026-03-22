import { prisma } from "@/lib/db";
import { calculateSM2, type Difficulty } from "@/lib/spaced-repetition";

export async function POST(request: Request) {
  const { wordId, difficulty } = (await request.json()) as {
    wordId: string;
    difficulty: Difficulty;
  };

  // Get or create progress record
  let progress = await prisma.vocabProgress.findUnique({
    where: {
      userId_wordId: {
        userId: "default-user",
        wordId,
      },
    },
  });

  if (!progress) {
    progress = await prisma.vocabProgress.create({
      data: {
        userId: "default-user",
        wordId,
      },
    });
  }

  // Calculate new SM-2 values
  const result = calculateSM2(
    {
      easeFactor: progress.easeFactor,
      interval: progress.interval,
      repetitions: progress.repetitions,
    },
    difficulty
  );

  // Update progress
  const updated = await prisma.vocabProgress.update({
    where: { id: progress.id },
    data: {
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReview: result.nextReview,
    },
  });

  return Response.json({ success: true, nextReview: updated.nextReview });
}
