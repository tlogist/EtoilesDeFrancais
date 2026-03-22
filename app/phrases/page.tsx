import { prisma } from "@/lib/db";
import { PhrasesClient } from "./phrases-client";
import { getUnlockedContent } from "@/lib/curriculum";

export default async function PhrasesPage() {
  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });
  const currentWeek = user?.currentWeek || 1;
  const unlocked = getUnlockedContent(currentWeek);

  const phrases = await prisma.phrase.findMany({
    orderBy: [{ week: "asc" }, { category: "asc" }],
  });

  // Group by category
  const categories = new Map<
    string,
    Array<{
      id: string;
      french: string;
      english: string;
      context: string;
      isSlang: boolean;
      week: number;
    }>
  >();

  for (const phrase of phrases) {
    const cat = phrase.category;
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push({
      id: phrase.id,
      french: phrase.french,
      english: phrase.english,
      context: phrase.context,
      isSlang: phrase.isSlang,
      week: phrase.week,
    });
  }

  const categoryList = Array.from(categories.entries()).map(
    ([name, items]) => ({
      id: name,
      name: name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      phrases: items,
      locked: !unlocked.phrases.categories.includes(name),
      week: items[0]?.week || 1,
    })
  );

  return <PhrasesClient categories={categoryList} currentWeek={currentWeek} />;
}
