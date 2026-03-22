import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { GrammarPracticeClient } from "./grammar-practice-client";

interface Props {
  params: Promise<{ ruleId: string }>;
}

export default async function GrammarRulePage({ params }: Props) {
  const { ruleId } = await params;

  const rule = await prisma.grammarRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    notFound();
  }

  return (
    <GrammarPracticeClient
      rule={{
        id: rule.id,
        title: rule.title,
        shortcut: rule.shortcut,
        explanation: rule.explanation,
        examples: JSON.parse(rule.examples) as string[],
        week: rule.week,
      }}
    />
  );
}
