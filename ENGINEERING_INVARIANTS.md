# Engineering Invariants

## Architecture

- **Single-user app**: Uses hardcoded `"default-user"` ID throughout. No auth system. All API routes assume this user.
- **Server components for data, client components for interaction**: Pages that fetch data are server components (`page.tsx`). Interactive UIs are separate `*-client.tsx` files imported by the server page.
- **All data-fetching pages use `force-dynamic`**: Every server component page that reads from the database exports `export const dynamic = "force-dynamic"` to prevent Next.js from caching stale data between navigations. Without this, progress updates don't appear on the dashboard.
- **Prisma 6 with SQLite**: Using Prisma 6.x (not 7) because Prisma 7 requires a separate config file for SQLite URLs. The `url` lives directly in `schema.prisma`.
- **No nested `<button>` elements**: Flashcard wrappers use `<div role="button">` instead of `<button>` to avoid hydration errors when `SpeakButton` (a `<button>`) is rendered inside. Use `stopPropagation()` on the SpeakButton wrapper to prevent card flip when tapping the speaker icon.

## Claude API Integration

- **API key via ANTHROPIC_API_KEY**: The `.env.local` stores the Anthropic API key.
- **Two model tiers**: `FAST_MODEL` (`claude-haiku-4-5-20251001`) for vocab context, quick generation, and learner profile extraction. `SMART_MODEL` (`claude-sonnet-4-20250514`) for conversations, grammar explanations, journal corrections, quiz generation. These are defined in `lib/claude.ts`.
- **Streaming for chat only**: The `/api/chat` route streams responses via SSE. The `/api/generate` route returns complete responses.
- **System prompts in `lib/prompts.ts`**: All Claude system prompts are centralized. Week number is injected to control difficulty progression.
- **Error handling in chat**: The `/api/chat` route catches both initial API errors and mid-stream errors, logging them server-side and sending a user-visible error message through the stream rather than silently failing.

## Learner Profile

- **Persistent across conversations**: The `User.learnerProfile` field stores Claude-extracted observations about the learner (common mistakes, strengths, interests, personal details). Defined in `lib/learner-profile.ts`.
- **Updated at end of session**: Profile updates trigger when the user navigates away from a conversation (via `beforeunload` event or back button click), not during the conversation. The client sends `{ endSession: true }` in the PATCH request to signal this.
- **Injected into every conversation**: `getConversationPrompt()` accepts an optional `learnerProfile` parameter. The chat API route loads it from the database before each conversation.
- **Uses FAST_MODEL**: Profile extraction uses Haiku to keep costs low since it's a background operation.

## Text-to-Speech

- **Smart voice routing by text length**: Short text (3 words or fewer) uses Apple's Siri voice (free, instant). Longer text (4+ words) uses ElevenLabs for natural intonation. Logic is in `lib/speech.ts` via `shouldUseSystemVoice()`.
- **Apple voice preference order**: Marie (Siri neural, fr-FR) > Amelie (fr-CA) > Thomas (fr-FR) > any French voice. The resolved voice is cached so lookup happens once per session.
- **ElevenLabs forced to French**: The `/api/tts` route sends `language_code: "fr"` to prevent auto-detection from switching to Spanish or other languages on ambiguous text.
- **Two-layer caching for ElevenLabs**:
  1. **Server-side disk cache** (`.tts-cache/`): MD5 hash of `voiceId:text` → MP3 file. Survives server restarts. Same text never hits ElevenLabs API twice, ever. This is the primary cost-saving mechanism.
  2. **Client-side memory cache**: `Map<string, blobUrl>` in `lib/speech.ts`. Prevents re-fetching from our own API route during a session. Lost on page refresh (intentional — keeps browser memory bounded).
- **`speakFrench()` is async**: Returns a Promise that resolves when playback finishes. `SpeakButton` component handles loading/speaking states with spinner/pulse animation.
- **Audio buffering**: Uses `canplaythrough` event before calling `play()` to prevent first-play stutter.

## Audio Recording

- **Mic stays warm**: `lib/audio.ts` acquires the microphone stream once and reuses it across recordings to eliminate the hardware init delay on subsequent Record presses.
- **Auto-detects MIME type**: Uses `MediaRecorder.isTypeSupported()` to pick `audio/webm` (Chrome), `audio/mp4` (Safari), or whatever the browser supports — never hardcodes.
- **Waits for `onstart`**: `startRecording()` doesn't resolve until the MediaRecorder's `onstart` event fires, ensuring the UI only shows "recording" when audio is actually being captured.
- **Mic released on unmount**: The `RecordButton` component releases the mic stream when it unmounts (navigating away from the page).

## Progress Tracking

- **Every module records to the `Progress` table**: Learn (on last word), Review (on last card), Conversation (after first real exchange), Grammar Practice (on last exercise), Pronunciation Warmup (on finish), and Journal (on submit). The dashboard reads this table to show completion.
- **Streak tracking**: Updated in `/api/progress` POST handler. Compares today vs `lastActiveAt` to increment, maintain, or reset the streak.

## Spaced Repetition

- **SM-2 algorithm in `lib/spaced-repetition.ts`**: Standard SM-2 with 4 difficulty levels (again/hard/good/easy) mapped to quality scores (0/2/4/5).
- **VocabProgress table has unique constraint on (userId, wordId)**: Always use `findUnique` with the composite key `userId_wordId`.

## Curriculum

- **Content unlocking is cumulative**: `getUnlockedContent(week)` returns all content from week 1 through the given week.
- **Week/day advancement is manual**: User must advance via Settings page. No automatic time-based progression.
- **Daily activity order**: Pronunciation warm-up first (vocal warm-up), then vocabulary, then conversation, then grammar/immersion.

## Seed Data

- **All French text uses proper accents**: être, café, déjà, bientôt, très, hôtel, métro, etc. Missing accents cause ElevenLabs to misidentify the language.
- **Seed via `prisma/seed.ts`**: Run with `npm run db:seed`. Uses upsert to be idempotent. Contains 100 vocab words, 50+ phrases, 25 grammar rules, 21 immersion tasks.

## PWA

- **manifest.json in /public**: Basic PWA manifest. No service worker configured yet (Serwist is installed but not wired up).
- **Dark mode forced**: The root `<html>` element has `class="dark"` hardcoded.

## Data Storage

- **JSON in text columns**: `Conversation.messages`, `Conversation.corrections`, and `GrammarRule.examples` store JSON as text strings. Always `JSON.parse()` when reading, `JSON.stringify()` when writing.
- **`.env.local` keys**: `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (default: Charlotte `XB0fDUnXU5powFXDhCwa`).
- **Gitignored**: `.env*`, `prisma/dev.db`, `.tts-cache/`.
