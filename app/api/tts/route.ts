import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// ElevenLabs TTS endpoint
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

// Persistent cache directory — audio files survive server restarts
const CACHE_DIR = path.join(process.cwd(), ".tts-cache");

// Create a stable filename from text content
function getCacheKey(text: string, voiceId: string): string {
  const hash = createHash("md5").update(`${voiceId}:${text}`).digest("hex");
  return path.join(CACHE_DIR, `${hash}.mp3`);
}

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return Response.json(
      { error: "ElevenLabs not configured" },
      { status: 500 }
    );
  }

  // Check persistent disk cache first
  const cacheFile = getCacheKey(text, voiceId);
  try {
    const cached = await readFile(cacheFile);
    return new Response(cached, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000", // Cache forever — content won't change
        "X-TTS-Cache": "hit",
      },
    });
  } catch {
    // Cache miss — fetch from ElevenLabs
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      language_code: "fr",
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.85,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("ElevenLabs error:", response.status, errorText);
    return Response.json(
      { error: "TTS generation failed" },
      { status: response.status }
    );
  }

  const audioBuffer = await response.arrayBuffer();

  // Save to persistent cache
  try {
    if (!existsSync(CACHE_DIR)) {
      await mkdir(CACHE_DIR, { recursive: true });
    }
    await writeFile(cacheFile, Buffer.from(audioBuffer));
  } catch (err) {
    console.error("Failed to cache TTS audio:", err);
  }

  return new Response(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000",
      "X-TTS-Cache": "miss",
    },
  });
}
