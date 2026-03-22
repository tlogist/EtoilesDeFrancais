// MediaRecorder helpers for recording user pronunciation

export interface RecordingState {
  isRecording: boolean;
  audioUrl: string | null;
  error: string | null;
}

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export async function startRecording(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start();
}

export function stopRecording(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error("No recording in progress"));
      return;
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);
      // Stop all tracks to release microphone
      mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder = null;
      audioChunks = [];
      resolve(audioUrl);
    };

    mediaRecorder.stop();
  });
}

export function isRecording(): boolean {
  return mediaRecorder?.state === "recording";
}
