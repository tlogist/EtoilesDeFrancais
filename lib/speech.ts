// TTS via ElevenLabs API (server-proxied) with client-side audio cache
// Falls back to Web Speech API if ElevenLabs is unavailable

// In-memory cache: text -> audio blob URL
// Prevents re-fetching the same word/phrase during a session
const audioCache = new Map<string, string>();

// Currently playing audio element (for stopping)
let currentAudio: HTMLAudioElement | null = null;

// Short text (3 words or fewer) uses Apple's Siri voice (free, instant).
// Longer text uses ElevenLabs (natural intonation matters for phrases/sentences).
function shouldUseSystemVoice(text: string): boolean {
  const wordCount = text.trim().split(/\s+/).length;
  return wordCount <= 3;
}

export async function speakFrench(text: string): Promise<void> {
  if (typeof window === "undefined") return;

  stopSpeaking();

  // Short words/phrases — use Apple's free Siri voice
  if (shouldUseSystemVoice(text)) {
    return speakWithSystemVoice(text);
  }

  // Longer text — use ElevenLabs for natural intonation
  // Check client-side cache first
  const cached = audioCache.get(text);
  if (cached) {
    return playAudioUrl(cached);
  }

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

    console.warn("ElevenLabs unavailable, falling back to system voice");
  } catch {
    console.warn("TTS fetch failed, falling back to system voice");
  }

  // Fallback if ElevenLabs fails
  return speakWithSystemVoice(text);
}

function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.preload = "auto";
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      reject(new Error("Audio playback failed"));
    };
    // Wait for enough data to be buffered before playing
    audio.oncanplaythrough = () => {
      audio.play().catch(reject);
    };
    // Kick off loading
    audio.load();
  });
}

// Preferred French voices in priority order:
// 1. Marie — Siri neural voice (female, fr-FR, highest quality)
// 2. Amélie — premium voice (female, fr-CA, good quality)
// 3. Thomas — compact voice (male, fr-FR, decent fallback)
// 4. Any fr-FR voice
const PREFERRED_VOICE_NAMES = ["Marie", "Amélie", "Thomas"];

// Cache the resolved voice so we don't search every time
let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceResolved = false;

function getFrenchVoice(): SpeechSynthesisVoice | null {
  if (voiceResolved) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Try preferred voices in order
  for (const name of PREFERRED_VOICE_NAMES) {
    const match = voices.find(
      (v) => v.name === name && v.lang.startsWith("fr")
    );
    if (match) {
      cachedVoice = match;
      voiceResolved = true;
      console.log(`Using French voice: ${match.name} (${match.voiceURI})`);
      return cachedVoice;
    }
  }

  // Fall back to any French voice, preferring fr-FR over fr-CA
  const frFR = voices.find((v) => v.lang === "fr-FR");
  const frAny = voices.find((v) => v.lang.startsWith("fr"));
  cachedVoice = frFR || frAny || null;
  voiceResolved = true;
  if (cachedVoice) {
    console.log(`Using French voice (fallback): ${cachedVoice.name}`);
  }
  return cachedVoice;
}

// Apple Siri / system voice via Web Speech API
function speakWithSystemVoice(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;

    const voice = getFrenchVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
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
