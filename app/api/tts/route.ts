import { NextRequest } from "next/server";

// ElevenLabs TTS endpoint
// Uses the multilingual v2 model for high-quality French pronunciation
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

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
        stability: 0.6, // Slightly lower for more natural variation
        similarity_boost: 0.85,
        style: 0.3, // Some expressiveness
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

  // Stream the audio bytes back to the client
  const audioBuffer = await response.arrayBuffer();
  return new Response(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400", // Cache for 24h
    },
  });
}
