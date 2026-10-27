import { Flashcard, ReviewRating } from '../types';

export interface SM2Result {
  interval: number;
  repetition: number;
  efactor: number;
  dueDate: string;
  lapses: number;
  state: Flashcard['state'];
}

/**
 * Calculates updated spaced repetition parameters using the SuperMemo-2 (SM-2) algorithm.
 * @param card Current flashcard state
 * @param rating User rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 * @param now Reference date for calculating dueDate (defaults to new Date())
 */
export function calculateSM2(
  card: Pick<Flashcard, 'interval' | 'repetition' | 'efactor' | 'lapses'>,
  rating: ReviewRating,
  now: Date = new Date()
): SM2Result {
  // Map rating (1..4) to standard SM-2 grade (1..5)
  // 1: Again -> grade 1 (complete blackout)
  // 2: Hard -> grade 3 (correct with difficulty)
  // 3: Good -> grade 4 (correct after a hesitation)
  // 4: Easy -> grade 5 (perfect recall)
  const gradeMap: Record<ReviewRating, number> = {
    1: 1,
    2: 3,
    3: 4,
    4: 5,
  };
  const q = gradeMap[rating];

  let interval = card.interval;
  let repetition = card.repetition;
  let efactor = card.efactor || 2.5;
  let lapses = card.lapses || 0;

  // Calculate new Easiness Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  efactor = efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (efactor < 1.3) {
    efactor = 1.3;
  }
  // Round to 2 decimal places
  efactor = Math.round(efactor * 100) / 100;

  if (q < 3) {
    // Failed recall (Again)
    repetition = 0;
    interval = 1;
    lapses += 1;
  } else {
    // Successful recall
    if (repetition === 0) {
      interval = rating === 2 ? 1 : 1;
    } else if (repetition === 1) {
      interval = rating === 2 ? 3 : 6;
    } else {
      const modifier = rating === 2 ? 1.2 : efactor;
      interval = Math.round(card.interval * modifier);
      if (rating === 4) {
        interval = Math.round(interval * 1.3); // Bonus for easy
      }
    }
    repetition += 1;
  }

  // Ensure minimum interval of 1 day
  if (interval < 1) interval = 1;

  // Calculate due date
  const due = new Date(now.getTime());
  due.setDate(due.getDate() + interval);
  // Set to start of the day
  due.setHours(4, 0, 0, 0);

  // Determine mastery state
  let state: Flashcard['state'] = 'learning';
  if (repetition >= 4 && interval >= 21) {
    state = 'mastered';
  } else if (repetition >= 1) {
    state = 'review';
  }

  return {
    interval,
    repetition,
    efactor,
    dueDate: due.toISOString(),
    lapses,
    state,
  };
}
