// TTS via ElevenLabs API (server-proxied) with client-side audio cache
// Falls back to Web Speech API if ElevenLabs is unavailable

// In-memory cache: text -> audio blob URL
// Prevents re-fetching the same word/phrase during a session
const audioCache = new Map<string, string>();

// Currently playing audio element (for stopping)
let currentAudio: HTMLAudioElement | null = null;

export async function speakFrench(text: string): Promise<void> {
  if (typeof window === "undefined") return;

  stopSpeaking();

  // Check cache first
  const cached = audioCache.get(text);
  if (cached) {
    return playAudioUrl(cached);
  }

  // Try ElevenLabs via our API route
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioCache.set(text, url);
      return playAudioUrl(url);
    }

    // If ElevenLabs fails, fall through to Web Speech API
    console.warn("ElevenLabs unavailable, falling back to system voice");
  } catch {
    console.warn("TTS fetch failed, falling back to system voice");
  }

  // Fallback: Web Speech API
  speakFrenchFallback(text);
}

function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      reject(new Error("Audio playback failed"));
    };
    audio.play().catch(reject);
  });
}

// Web Speech API fallback for when ElevenLabs is unavailable
function speakFrenchFallback(text: string): void {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 0.9;

  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(
    (v) => v.lang === "fr-FR" || v.lang.startsWith("fr")
  );
  if (frenchVoice) utterance.voice = frenchVoice;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
