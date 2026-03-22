import { prisma } from "@/lib/db";
import { GrammarClient } from "./grammar-client";

export default async function GrammarPage() {
  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });
  const currentWeek = user?.currentWeek || 1;

  const rules = await prisma.grammarRule.findMany({
    orderBy: [{ week: "asc" }, { title: "asc" }],
  });

  return (
    <GrammarClient
      rules={rules.map((r) => ({
        id: r.id,
        title: r.title,
        shortcut: r.shortcut,
        explanation: r.explanation,
        examples: JSON.parse(r.examples) as string[],
        week: r.week,
      }))}
      currentWeek={currentWeek}
    />
  );
}
