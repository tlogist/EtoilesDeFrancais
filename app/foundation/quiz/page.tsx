import { prisma } from "@/lib/db";
import { QuizClient } from "./quiz-client";

export default async function QuizPage() {
  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });
  const words = await prisma.vocabWord.findMany({
    where: { week: { lte: user?.currentWeek || 1 } },
  });

  return (
    <QuizClient
      words={words.map((w) => ({ french: w.french, english: w.english }))}
      week={user?.currentWeek || 1}
    />
  );
}
