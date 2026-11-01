// Maps each challenge to the quiz that represents its "associated activity".
// Starting a challenge launches this quiz; finishing the quiz (while the
// challenge is in-progress) completes the challenge and awards its XP.

export const challengeToQuizMap = {
  chl_001: 'qz_003', // WADA Prohibited List -> Prohibited Substances quiz
  chl_002: 'qz_005', // Therapeutic Use Exemptions -> TUE quiz
  chl_003: 'qz_002', // Athlete Responsibilities -> Responsibilities quiz
  chl_004: 'qz_004', // In-Competition Testing -> Testing Procedures quiz
  chl_005: 'qz_003', // Supplements: Risk & Reality -> Prohibited Substances quiz
  chl_006: 'qz_004', // Whereabouts Requirements -> Testing Procedures quiz
};

// A single quiz can map back to more than one challenge (e.g. qz_003 backs
// both chl_001 and chl_005), so this returns an array.
export function getChallengeIdsForQuiz(quizId) {
  return Object.entries(challengeToQuizMap)
    .filter(([, mappedQuizId]) => mappedQuizId === quizId)
    .map(([challengeId]) => challengeId);
}

// Minimum level required to unlock each difficulty tier.
export const difficultyUnlockLevel = {
  Beginner: 1,
  Intermediate: 3,
  Advanced: 6,
};
