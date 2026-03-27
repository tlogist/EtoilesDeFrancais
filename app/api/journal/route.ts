import { prisma } from "@/lib/db";

export async function GET() {
  const entries = await prisma.journalEntry.findMany({
    where: { userId: "default-user" },
    orderBy: { date: "desc" },
    take: 50,
  });

  return Response.json({ entries });
}

export async function POST(request: Request) {
  const { prompt, entry, correction } = await request.json();

  const saved = await prisma.journalEntry.create({
    data: {
      userId: "default-user",
      prompt,
      entry,
      correction,
    },
  });

  return Response.json({ id: saved.id });
}
