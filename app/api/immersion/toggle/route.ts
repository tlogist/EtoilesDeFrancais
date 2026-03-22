import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const { taskId, completed } = await request.json();

  await prisma.immersionTask.update({
    where: { id: taskId },
    data: { completed },
  });

  return Response.json({ success: true });
}
