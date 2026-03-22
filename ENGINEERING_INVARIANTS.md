# Engineering Invariants

## Architecture

- **Single-user app**: Uses hardcoded `"default-user"` ID throughout. No auth system. All API routes assume this user.
- **Server components for data, client components for interaction**: Pages that fetch data are server components (`page.tsx`). Interactive UIs are separate `*-client.tsx` files imported by the server page.
- **Prisma 6 with SQLite**: Using Prisma 6.x (not 7) because Prisma 7 requires a separate config file for SQLite URLs. The `url` lives directly in `schema.prisma`.

## Claude API Integration

- **OAuth token via ANTHROPIC_API_KEY**: The `.env.local` stores a Claude MAX OAuth token. The Anthropic SDK accepts it the same way as an API key.
- **Two model tiers**: `FAST_MODEL` (haiku) for vocab context and quick generation. `SMART_MODEL` (sonnet) for conversations, grammar explanations, journal corrections, quiz generation.
- **Streaming for chat only**: The `/api/chat` route streams responses via SSE. The `/api/generate` route returns complete responses.
- **System prompts in `lib/prompts.ts`**: All Claude system prompts are centralized. Week number is injected to control difficulty progression.

## Text-to-Speech

- **ElevenLabs primary, Web Speech API fallback**: TTS goes through `/api/tts` route which proxies to ElevenLabs (keeps API key server-side). If ElevenLabs is unavailable or unconfigured, falls back to browser's built-in `speechSynthesis`.
- **Client-side audio cache**: `lib/speech.ts` caches audio blob URLs in a `Map` keyed by text. Same word/phrase won't be re-fetched during a session. Cache is lost on page refresh (intentional — keeps memory bounded).
- **`speakFrench()` is async now**: Changed from sync (Web Speech API) to async (fetch + audio playback). `SpeakButton` component handles loading/speaking states.

## Spaced Repetition

- **SM-2 algorithm in `lib/spaced-repetition.ts`**: Standard SM-2 with 4 difficulty levels (again/hard/good/easy) mapped to quality scores (0/2/4/5).
- **VocabProgress table has unique constraint on (userId, wordId)**: Always use `findUnique` with the composite key `userId_wordId`.

## Curriculum

- **Content unlocking is cumulative**: `getUnlockedContent(week)` returns all content from week 1 through the given week.
- **Week/day advancement is manual**: User must advance via Settings page. No automatic time-based progression.

## PWA

- **manifest.json in /public**: Basic PWA manifest. No service worker configured yet (Serwist is installed but not wired up).
- **Dark mode forced**: The root `<html>` element has `class="dark"` hardcoded.

## Data Storage

- **JSON in text columns**: `Conversation.messages`, `Conversation.corrections`, and `GrammarRule.examples` store JSON as text strings. Always `JSON.parse()` when reading, `JSON.stringify()` when writing.
- **Seed data via `prisma/seed.ts`**: Run with `npm run db:seed`. Uses upsert to be idempotent.
