import { prisma } from "@/lib/db";
import { PronunciationClient } from "./pronunciation-client";
import { PRONUNCIATION_SOUNDS } from "@/lib/pronunciation-data";

export default async function PronunciationPage() {
  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });
  const currentWeek = user?.currentWeek || 1;

  const sounds = PRONUNCIATION_SOUNDS.map((s) => ({
    ...s,
    locked: s.week > currentWeek,
  }));

  return <PronunciationClient sounds={sounds} currentWeek={currentWeek} />;
}
