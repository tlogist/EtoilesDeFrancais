"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [resetting, setResetting] = useState(false);

  async function advanceDay() {
    await fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance-day" }),
    });
    window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Curriculum Progression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Manually advance to the next day if you&apos;ve completed
            today&apos;s activities.
          </p>
          <Button onClick={advanceDay} variant="outline" className="gap-2">
            Advance to Next Day
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Etoiles de Francais — Your 5-week French fluency journey
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by Claude AI for conversation practice, grammar
            explanations, journal corrections, and vocabulary context.
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary">v1.0</Badge>
            <Badge variant="secondary">PWA</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">PWA Installation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To install as an app on your iPhone:
          </p>
          <ol className="text-sm text-muted-foreground list-decimal list-inside mt-2 space-y-1">
            <li>Open this page in Safari</li>
            <li>Tap the Share button (square with arrow)</li>
            <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
            <li>Tap &quot;Add&quot;</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
