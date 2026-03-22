"use client";

import { useState } from "react";
import { Mic, Square, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startRecording, stopRecording } from "@/lib/audio";

export function RecordButton() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggleRecord() {
    if (recording) {
      try {
        const url = await stopRecording();
        setAudioUrl(url);
        setRecording(false);
      } catch {
        setError("Failed to stop recording");
        setRecording(false);
      }
    } else {
      try {
        setError(null);
        await startRecording();
        setRecording(true);
      } catch {
        setError("Microphone access denied");
      }
    }
  }

  function handlePlayback() {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={recording ? "destructive" : "outline"}
        size="sm"
        onClick={handleToggleRecord}
        className="gap-2"
      >
        {recording ? (
          <>
            <Square className="h-3 w-3" /> Stop
          </>
        ) : (
          <>
            <Mic className="h-3 w-3" /> Record
          </>
        )}
      </Button>
      {audioUrl && (
        <Button variant="ghost" size="sm" onClick={handlePlayback}>
          <Play className="h-3 w-3 mr-1" /> Play
        </Button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
