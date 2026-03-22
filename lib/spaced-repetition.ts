// SM-2 spaced repetition algorithm
// Quality ratings: 0-5 (0=complete blackout, 5=perfect recall)

export interface SM2Card {
  easeFactor: number;
  interval: number; // days
  repetitions: number;
}

export interface SM2Result extends SM2Card {
  nextReview: Date;
}

// Map user difficulty buttons to SM-2 quality scores
// "Again" = 0, "Hard" = 2, "Good" = 4, "Easy" = 5
export type Difficulty = "again" | "hard" | "good" | "easy";

const DIFFICULTY_TO_QUALITY: Record<Difficulty, number> = {
  again: 0,
  hard: 2,
  good: 4,
  easy: 5,
};

export function calculateSM2(
  card: SM2Card,
  difficulty: Difficulty
): SM2Result {
  const quality = DIFFICULTY_TO_QUALITY[difficulty];

  let { easeFactor, interval, repetitions } = card;

  if (quality < 3) {
    // Failed recall — reset repetitions, keep ease factor
    repetitions = 0;
    interval = 0;
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor (minimum 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview };
}
