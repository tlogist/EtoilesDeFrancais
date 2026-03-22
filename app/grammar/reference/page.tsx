import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function GrammarReferencePage() {
  const rules = await prisma.grammarRule.findMany({
    orderBy: [{ week: "asc" }, { title: "asc" }],
  });

  const grouped = rules.reduce((acc, rule) => {
    const week = rule.week;
    if (!acc[week]) acc[week] = [];
    acc[week].push(rule);
    return acc;
  }, {} as Record<number, typeof rules>);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/grammar">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Grammar Cheat Sheet</h1>
          <p className="text-sm text-muted-foreground">
            Quick reference for all rules
          </p>
        </div>
      </div>

      {Object.entries(grouped).map(([week, weekRules]) => (
        <div key={week}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Week {week}
          </h2>
          <div className="space-y-2">
            {weekRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm">{rule.title}</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-3">
                  <p className="text-xs text-primary font-medium">
                    {rule.shortcut}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
