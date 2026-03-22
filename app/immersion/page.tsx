import { prisma } from "@/lib/db";
import { ImmersionClient } from "./immersion-client";

export const dynamic = "force-dynamic";

export default async function ImmersionPage() {
  const user = await prisma.user.findUnique({
    where: { id: "default-user" },
  });
  const currentWeek = user?.currentWeek || 1;
  const currentDay = user?.currentDay || 1;

  const tasks = await prisma.immersionTask.findMany({
    orderBy: [{ week: "asc" }, { day: "asc" }],
  });

  return (
    <ImmersionClient
      tasks={tasks.map((t) => ({
        id: t.id,
        week: t.week,
        day: t.day,
        title: t.title,
        description: t.description,
        type: t.type,
        resourceUrl: t.resourceUrl,
        durationMins: t.durationMins,
        completed: t.completed,
      }))}
      currentWeek={currentWeek}
      currentDay={currentDay}
    />
  );
}
