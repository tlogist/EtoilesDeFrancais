// MediaRecorder helpers for recording user pronunciation
// Keeps the mic stream warm to eliminate startup delay

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let micStream: MediaStream | null = null;

// Pick a MIME type the browser actually supports
function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/wav",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

// Pre-acquire the mic so recording starts instantly
async function ensureMicStream(): Promise<MediaStream> {
  if (micStream && micStream.active) {
    return micStream;
  }
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return micStream;
}

export async function startRecording(): Promise<void> {
  const stream = await ensureMicStream();

  const mimeType = getSupportedMimeType();
  const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
  mediaRecorder = new MediaRecorder(stream, options);
  audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  // Don't resolve until the recorder has actually started capturing
  return new Promise((resolve) => {
    mediaRecorder!.onstart = () => resolve();
    mediaRecorder!.start();
  });
}

export function stopRecording(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error("No recording in progress"));
      return;
    }

    mediaRecorder.onstop = () => {
      const type = mediaRecorder?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunks, { type });
      const audioUrl = URL.createObjectURL(audioBlob);
      mediaRecorder = null;
      audioChunks = [];
      // Keep micStream alive for next recording
      resolve(audioUrl);
    };

    mediaRecorder.stop();
  });
}

// Call this when leaving the pronunciation page to release the mic
export function releaseMic(): void {
  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }
}

export function isRecording(): boolean {
  return mediaRecorder?.state === "recording";
}
