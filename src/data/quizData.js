// Anti-Doping Quiz Categories & Question Bank

export const quizCategories = [
  {
    id: 'cat_basics',
    title: 'Anti-Doping Basics',
    description: 'Fundamental principles of clean sport, WADA Code, and athlete rights.',
    icon: '🎓',
    color: 'cyan',
    totalQuizzes: 4,
  },
  {
    id: 'cat_substances',
    title: 'Prohibited Substances',
    description: 'WADA Prohibited List, anabolic agents, stimulants, and supplement risks.',
    icon: '🔬',
    color: 'purple',
    totalQuizzes: 4,
  },
  {
    id: 'cat_responsibilities',
    title: 'Athlete Responsibilities',
    description: 'Strict liability principle, whereabouts, checking medications, and compliance.',
    icon: '🏋️',
    color: 'green',
    totalQuizzes: 3,
  },
  {
    id: 'cat_testing',
    title: 'Testing Procedures',
    description: 'Doping control process, sample collection, chaperone roles, and rights.',
    icon: '🧪',
    color: 'orange',
    totalQuizzes: 3,
  },
  {
    id: 'cat_tue',
    title: 'Therapeutic Use Exemptions',
    description: 'Applying for TUEs, medical documentation, emergency TUEs, and retroactivity.',
    icon: '💊',
    color: 'pink',
    totalQuizzes: 3,
  },
  {
    id: 'cat_ethics',
    title: 'Clean Sport & Fair Play',
    description: 'Ethical decision making, reporting doping (Speak Up), and spirit of sport.',
    icon: '⚖️',
    color: 'cyan',
    totalQuizzes: 3,
  },
];

export const quizzes = [
  // --- Beginner Quizzes ---
  {
    id: 'qz_001',
    categoryId: 'cat_basics',
    categoryName: 'Anti-Doping Basics',
    title: 'Introduction to Clean Sport & WADA',
    description: 'Master the fundamental rules and values that govern clean competition worldwide.',
    difficulty: 'Beginner',
    xpReward: 50,
    timeLimitSeconds: 300, // 5 mins optional
    icon: '🎓',
    color: 'cyan',
    questions: [
      {
        id: 'q_001',
        question: 'What does the acronym WADA stand for?',
        options: [
          'World Association of Doping Athletics',
          'World Anti-Doping Agency',
          'Worldwide Anti-Doping Alliance',
          'World Athletic Doping Administration'
        ],
        correctIndex: 1,
        explanation: 'WADA stands for the World Anti-Doping Agency, established in 1999 as an independent international body to promote and coordinate clean sport worldwide.'
      },
      {
        id: 'q_002',
        question: 'What is the core principle of "Strict Liability" in anti-doping?',
        options: [
          'An athlete is only responsible if they intentionally cheat.',
          'Athletes are strictly responsible for any prohibited substance found in their body, regardless of how it got there.',
          'Coaches are solely held accountable for what athletes consume.',
          'Athletes must report all medications within 24 hours of competition.'
        ],
        correctIndex: 1,
        explanation: 'Under the Strict Liability principle, an athlete is automatically responsible if a prohibited substance is present in their sample, even if taken accidentally or on advice from others.'
      },
      {
        id: 'q_003',
        question: 'How often is the WADA Prohibited List updated?',
        options: [
          'Every 4 years (Olympic Cycle)',
          'Every 2 years',
          'At least once a year (takes effect Jan 1)',
          'Only when a new drug is banned'
        ],
        correctIndex: 2,
        explanation: 'The WADA Prohibited List is updated at least once every year and officially comes into effect on January 1st.'
      },
      {
        id: 'q_004',
        question: 'Can out-of-competition testing occur at any time and place without advance warning?',
        options: [
          'Yes, anytime and anywhere without prior notice.',
          'No, tests must be scheduled at least 48 hours in advance.',
          'Only at designated official training centers.',
          'No, testing only happens between 9 AM and 5 PM.'
        ],
        correctIndex: 0,
        explanation: 'Doping control officers can perform no-advance-notice testing on athletes at any time and any place worldwide.'
      },
      {
        id: 'q_005',
        question: 'Which of the following is considered an Anti-Doping Rule Violation (ADRV)?',
        options: [
          'Failing to submit to sample collection after being notified',
          'Presence of a prohibited substance in an athlete sample',
          'Tampering or attempted tampering with any part of doping control',
          'All of the above'
        ],
        correctIndex: 3,
        explanation: 'There are 11 distinct Anti-Doping Rule Violations (ADRVs) under the WADA Code, including presence of substances, refusal, whereabouts failures, and tampering.'
      }
    ]
  },

  {
    id: 'qz_002',
    categoryId: 'cat_responsibilities',
    categoryName: 'Athlete Responsibilities',
    title: 'Strict Liability & Medication Checking',
    description: 'Learn how to safely check every medication, supplement, and treatment before use.',
    difficulty: 'Beginner',
    xpReward: 50,
    timeLimitSeconds: 300,
    icon: '🏋️',
    color: 'green',
    questions: [
      {
        id: 'q_006',
        question: 'What is Global DRO used for?',
        options: [
          'Ordering certified clean supplements online',
          'Checking the anti-doping status of specific medications by country',
          'Filing whereabouts info for testing',
          'Booking appointments with team doctors'
        ],
        correctIndex: 1,
        explanation: 'Global DRO (Drug Reference Online) provides athletes and support personnel with information about the prohibited status of specific medications based on current WADA list.'
      },
      {
        id: 'q_007',
        question: 'If a doctor prescribes a medication, is it guaranteed to be safe under WADA rules?',
        options: [
          'Yes, doctors automatically know anti-doping rules.',
          'No, many common prescription medications contain substances prohibited in sport.',
          'Yes, as long as it has a prescription label.',
          'Only if the doctor is an orthopedic specialist.'
        ],
        correctIndex: 1,
        explanation: 'Doctors may prescribe medically necessary drugs that are prohibited in sport. Athletes must always inform doctors they are subject to anti-doping rules and check all prescribed meds.'
      },
      {
        id: 'q_008',
        question: 'What should an athlete do before taking any dietary supplement?',
        options: [
          'Assume it is safe if bought from a popular health store.',
          'Research batch testing certifications (e.g. Informed Sport) and evaluate risk.',
          'Mix it with protein powder to dilute prohibited ingredients.',
          'Take double the dose to build tolerance.'
        ],
        correctIndex: 1,
        explanation: 'Supplements carry an inherent risk of contamination. Athletes should choose products tested by recognized third-party quality assurance programs.'
      },
      {
        id: 'q_009',
        question: 'Who is ultimately responsible for what enters an athlete’s body?',
        options: [
          'The athlete’s nutritionist',
          'The head coach',
          'The athlete themselves',
          'The team physician'
        ],
        correctIndex: 2,
        explanation: 'Under the Strict Liability principle, the athlete alone is responsible for any substance found in their sample.'
      },
      {
        id: 'q_010',
        question: 'What is the "Check Your Meds" rule for athletes travelling internationally?',
        options: [
          'Medication status can vary by country brand names, so check the exact country of purchase on Global DRO.',
          'Medications bought abroad are always permitted.',
          'Only domestic medicines require checking.',
          'International flights automatically screen medications.'
        ],
        correctIndex: 0,
        explanation: 'Brand names and active ingredients in medicines can differ significantly between countries. Always verify the drug in the country where it was purchased.'
      }
    ]
  },

  // --- Intermediate Quizzes ---
  {
    id: 'qz_003',
    categoryId: 'cat_substances',
    categoryName: 'Prohibited Substances',
    title: 'Anabolic Agents & Stimulants Recognition',
    description: 'Deep dive into prohibited classes, in-competition vs out-of-competition bans.',
    difficulty: 'Intermediate',
    xpReward: 100,
    timeLimitSeconds: 360,
    icon: '🔬',
    color: 'purple',
    questions: [
      {
        id: 'q_011',
        question: 'Are Anabolic Androgenic Steroids (AAS) prohibited In-Competition, Out-of-Competition, or Both?',
        options: [
          'In-Competition only',
          'Out-of-Competition only',
          'Prohibited at All Times (both In- and Out-of-Competition)',
          'Only prohibited if taken orally'
        ],
        correctIndex: 2,
        explanation: 'Anabolic agents (Category S1) are non-specified substances prohibited at ALL times, both in and out of competition.'
      },
      {
        id: 'q_012',
        question: 'Stimulants (Category S6) like pseudoephedrine are generally prohibited during which timeframe?',
        options: [
          'Prohibited at all times year-round',
          'In-Competition only',
          'Only during off-season training camps',
          'Only if taken in liquid form'
        ],
        correctIndex: 1,
        explanation: 'Most stimulants (S6) are prohibited In-Competition only, though thresholds apply to certain over-the-counter decongestants like pseudoephedrine.'
      },
      {
        id: 'q_013',
        question: 'Why are Diuretics and Masking Agents (S5) prohibited in anti-doping?',
        options: [
          'They dramatically build muscular endurance.',
          'They can dilute urine samples and flush out traces of other prohibited substances.',
          'They act as powerful pain suppression agents.',
          'They increase red blood cell production.'
        ],
        correctIndex: 1,
        explanation: 'Diuretics increase urine production, which can dilute the concentration of prohibited substances or alter excretion rates, making detection difficult.'
      },
      {
        id: 'q_014',
        question: 'What is a "Specified Substance" on the WADA Prohibited List?',
        options: [
          'A substance that is allowed in small amounts.',
          'A substance more likely to be consumed for non-sport reasons (e.g. over-the-counter medication), allowing flexible sanctioning if no intent to cheat is proven.',
          'A substance prohibited only for specific sports like archery or shooting.',
          'A drug that can only be identified by DNA testing.'
        ],
        correctIndex: 1,
        explanation: 'Specified substances are drugs commonly found in medicinal products. If an athlete tests positive for a specified substance and proves no intentional cheating, sanctions can be reduced.'
      },
      {
        id: 'q_015',
        question: 'Which substance category includes Erythropoietin (EPO) and Peptide Hormones?',
        options: [
          'Category S2: Peptide Hormones, Growth Factors, Related Substances and Mimetics',
          'Category S4: Hormone and Metabolic Modulators',
          'Category S8: Cannabinoids',
          'Category P1: Beta-Blockers'
        ],
        correctIndex: 0,
        explanation: 'EPO and growth hormones fall under Category S2 and are prohibited at all times because they artificially stimulate red blood cell production or tissue growth.'
      }
    ]
  },

  {
    id: 'qz_004',
    categoryId: 'cat_testing',
    categoryName: 'Testing Procedures',
    title: 'Step-by-Step Doping Control Process',
    description: 'Master your rights and obligations during sample collection from notification to sealing.',
    difficulty: 'Intermediate',
    xpReward: 100,
    timeLimitSeconds: 360,
    icon: '🧪',
    color: 'orange',
    questions: [
      {
        id: 'q_016',
        question: 'What is the immediate first step when a Doping Control Officer (DCO) notifies an athlete for testing?',
        options: [
          'The athlete must sign the notification form and remain under direct observation until testing is complete.',
          'The athlete can leave to get changed alone in the locker room.',
          'The athlete has 2 hours to report without observation.',
          'The coach signs on behalf of the athlete.'
        ],
        correctIndex: 0,
        explanation: 'Once notified, the athlete must sign notification and stay under continuous observation of the DCO or chaperone until the sample collection is complete.'
      },
      {
        id: 'q_017',
        question: 'What is the minimum volume of urine required for a valid sample collection under WADA guidelines?',
        options: [
          '45 mL',
          '90 mL',
          '150 mL',
          '200 mL'
        ],
        correctIndex: 1,
        explanation: 'The standard minimum urine volume is 90 mL (split into 60 mL for Sample A and 30 mL for Sample B).'
      },
      {
        id: 'q_018',
        question: 'Who must divide and seal the urine sample into Bottles A and B during the collection process?',
        options: [
          'The Doping Control Officer (DCO)',
          'The athlete themselves',
          'The athlete’s team physician',
          'The lab technician'
        ],
        correctIndex: 1,
        explanation: 'The athlete must personally handle, pour, and seal their own sample into Bottles A and B to ensure chain of custody integrity.'
      },
      {
        id: 'q_019',
        question: 'Can an athlete request a representative (e.g. coach or doctor) to accompany them to the Doping Control Station?',
        options: [
          'No, only the athlete is allowed inside.',
          'Yes, athletes have the right to be accompanied by a representative and an interpreter if needed.',
          'Only minor athletes are allowed a representative.',
          'Only if approved 24 hours prior by WADA.'
        ],
        correctIndex: 1,
        explanation: 'Athletes have the explicit right to bring a representative and an interpreter to witness the doping control process.'
      },
      {
        id: 'q_020',
        question: 'If an athlete notices an irregularity during testing (e.g. damaged seal), where should they record it?',
        options: [
          'On social media after the test',
          'In the comments section of the Doping Control Form (DCF) before signing',
          'By calling WADA 3 days later',
          'Irregularities cannot be recorded'
        ],
        correctIndex: 1,
        explanation: 'Any concerns or comments regarding the sample collection procedure should be documented directly on the Doping Control Form before the athlete signs it.'
      }
    ]
  },

  // --- Advanced Quizzes ---
  {
    id: 'qz_005',
    categoryId: 'cat_tue',
    categoryName: 'Therapeutic Use Exemptions',
    title: 'TUE Applications, Criteria & Emergency Exemptions',
    description: 'Advanced protocols for medical exemptions, international level requirements, and appeals.',
    difficulty: 'Advanced',
    xpReward: 200,
    timeLimitSeconds: 420,
    icon: '💊',
    color: 'pink',
    questions: [
      {
        id: 'q_021',
        question: 'Which of the following is NOT one of the 4 mandatory criteria for granting a TUE under the International Standard for TUEs (ISTUE)?',
        options: [
          'The athlete would experience significant health problems if the substance were withheld.',
          'The therapeutic use of the substance produces no additional enhancement of performance beyond returning to normal health.',
          'There is no reasonable therapeutic alternative available.',
          'The athlete has been taking the substance for at least 5 years continuously.'
        ],
        correctIndex: 3,
        explanation: 'The duration of prior use is not a criterion. The 4 criteria focus on health necessity, non-enhancement beyond baseline health, lack of alternative treatments, and non-consequence of prior prohibited use.'
      },
      {
        id: 'q_022',
        question: 'When is a Retroactive TUE typically granted?',
        options: [
          'When an athlete forgets to apply before competition.',
          'In emergency medical treatment or acute medical situations where advance application was impossible.',
          'Whenever an athlete tests positive for a stimulant.',
          'For any national-level junior athlete automatically.'
        ],
        correctIndex: 1,
        explanation: 'Retroactive TUEs are granted in exceptional circumstances, such as emergency medical intervention or acute medical conditions where time did not allow prior application.'
      },
      {
        id: 'q_023',
        question: 'What is the role of ADAMS (Anti-Doping Administration & Management System) regarding TUEs?',
        options: [
          'ADAMS is an online database where TUE applications, approvals, and whereabouts are submitted and tracked globally.',
          'ADAMS is a pharmacy that delivers clean medications directly to athletes.',
          'ADAMS is the tribunal that hears doping appeals in Lausanne.',
          'ADAMS is an AI tool that automatically grants TUEs.'
        ],
        correctIndex: 0,
        explanation: 'ADAMS is WADA’s centralized web-based database system that securely manages athlete whereabouts, TUE records, and test results.'
      },
      {
        id: 'q_024',
        question: 'If a National Anti-Doping Organization (NADO) grants a TUE, but the International Federation (IF) rejects it for international competition, who resolves the conflict?',
        options: [
          'The athlete chooses which ruling to follow.',
          'WADA’s TUE Committee reviews the decision upon appeal.',
          'The NADO decision automatically overrides the IF.',
          'The athlete is automatically banned from competition.'
        ],
        correctIndex: 1,
        explanation: 'If a NADO and IF disagree on a TUE, WADA can review the case at the request of the athlete or NADO and make a binding final decision.'
      },
      {
        id: 'q_025',
        question: 'How far in advance of a major competition should an athlete ideally submit a non-emergency TUE application?',
        options: [
          'At least 30 days before the competition or event',
          '24 hours before the opening ceremony',
          'On the day of competition during weigh-in',
          'TUEs are always approved instantly upon request'
        ],
        correctIndex: 0,
        explanation: 'WADA guidelines state non-emergency TUE applications should be submitted at least 30 days prior to competition to allow proper medical review by the TUE Committee.'
      }
    ]
  },

  {
    id: 'qz_006',
    categoryId: 'cat_ethics',
    categoryName: 'Clean Sport & Fair Play',
    title: 'Whistleblowing, Integrity & Ethical Dilemmas',
    description: 'Complex ethical scenarios, WADA Speak Up platform, and preserving sports values.',
    difficulty: 'Advanced',
    xpReward: 200,
    timeLimitSeconds: 420,
    icon: '⚖️',
    color: 'cyan',
    questions: [
      {
        id: 'q_026',
        question: 'What is WADA’s "Speak Up!" platform designed for?',
        options: [
          'A public forum for athletes to share training advice.',
          'A secure, confidential reporting tool for athletes and whistleblowers to report suspected doping misconduct.',
          'A podcasting channel for clean sport advocates.',
          'A platform for voting on rule changes.'
        ],
        correctIndex: 1,
        explanation: 'Speak Up! is WADA’s official confidential platform enabling anyone to report anti-doping violations or suspicious activities safely.'
      },
      {
        id: 'q_027',
        question: 'Under WADA Code Article 2.11, what is the violation regarding "Retaliation"?',
        options: [
          'It is illegal to criticize another athlete’s performance.',
          'It is an Anti-Doping Rule Violation to threaten, intimidate, or discourage anyone from reporting anti-doping information in good faith.',
          'Athletes cannot appeal sanction rulings more than twice.',
          'Coaches cannot fire athletes who refuse to train.'
        ],
        correctIndex: 1,
        explanation: 'Article 2.11 makes it an explicit ADVI to retaliate against or discourage anyone from reporting doping misconduct.'
      },
      {
        id: 'q_028',
        question: 'An athlete is offered an unlabelled "performance recovery drink" by a trusted assistant. What is the ethically and legally correct action under WADA rules?',
        options: [
          'Drink it if the assistant promises it is clean.',
          'Refuse the substance, verify all ingredients against WADA list, and report unlabelled distribution if suspicious.',
          'Take half the bottle to test for side effects.',
          'Drink it and apply for a retroactive TUE later if tested.'
        ],
        correctIndex: 1,
        explanation: 'Under strict liability, drinking unlabelled or unknown substances creates extreme risk. Athletes must refuse and inspect any unknown product.'
      },
      {
        id: 'q_029',
        question: 'What constitutes the "Complicity" Anti-Doping Rule Violation (Article 2.9)?',
        options: [
          'Assisting, encouraging, aiding, abetting, conspiring, or covering up an anti-doping rule violation by another person.',
          'Competing in the same event as an athlete who previously failed a test.',
          'Failing to win a medal after receiving training grants.',
          'Using approved supplements without informing teammates.'
        ],
        correctIndex: 0,
        explanation: 'Complicity involves helping someone else commit or conceal an anti-doping violation. It applies to athletes, coaches, medical staff, and officials.'
      },
      {
        id: 'q_030',
        question: 'Why is preserving the "Spirit of Sport" considered the foundational ethos of anti-doping education?',
        options: [
          'To maximize television broadcasting revenue.',
          'Because sport is about intrinsic human values—ethics, fair play, honesty, health, and dedication—rather than win-at-all-costs cheating.',
          'To ensure only wealthy nations win medals.',
          'Because rules are created solely for legal compliance.'
        ],
        correctIndex: 1,
        explanation: 'The Spirit of Sport is the celebration of the human spirit, body, and mind. Anti-doping rules exist to protect athlete health and equal, fair opportunity.'
      }
    ]
  }
];

// Helper: Calculate AI recommendation based on user attempt history
export function getAIRecommendation(attempts = []) {
  if (!attempts || attempts.length === 0) {
    return {
      recommendedQuizId: 'qz_001',
      recommendedQuiz: quizzes[0],
      difficulty: 'Beginner',
      category: 'Anti-Doping Basics',
      reason: 'Welcome to Clean Quest! Start your journey with Anti-Doping Basics to build a solid foundation in clean sport principles.',
      badgeText: 'RECOMMENDED FIRST STEP',
    };
  }

  // Calculate category averages
  const categoryScores = {};
  attempts.forEach(att => {
    if (!categoryScores[att.categoryName]) {
      categoryScores[att.categoryName] = { totalPct: 0, count: 0, categoryId: att.categoryId };
    }
    categoryScores[att.categoryName].totalPct += att.scorePercentage;
    categoryScores[att.categoryName].count += 1;
  });

  // Find lowest scoring category or unattempted categories
  const attemptedCategoryIds = new Set(attempts.map(a => a.categoryId));
  const unattemptedCategory = quizCategories.find(c => !attemptedCategoryIds.has(c.id));

  if (unattemptedCategory) {
    const nextQuiz = quizzes.find(q => q.categoryId === unattemptedCategory.id) || quizzes[0];
    return {
      recommendedQuizId: nextQuiz.id,
      recommendedQuiz: nextQuiz,
      difficulty: nextQuiz.difficulty,
      category: unattemptedCategory.title,
      reason: `You haven't explored ${unattemptedCategory.title} yet. Try this topic next to broaden your anti-doping knowledge!`,
      badgeText: 'EXPAND YOUR KNOWLEDGE',
    };
  }

  // Find weakest attempted category
  let weakestCat = null;
  let lowestAvg = 101;
  Object.keys(categoryScores).forEach(catName => {
    const avg = categoryScores[catName].totalPct / categoryScores[catName].count;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakestCat = catName;
    }
  });

  const weakQuiz = quizzes.find(q => q.categoryName === weakestCat) || quizzes[1];

  if (lowestAvg < 80) {
    return {
      recommendedQuizId: weakQuiz.id,
      recommendedQuiz: weakQuiz,
      difficulty: weakQuiz.difficulty,
      category: weakestCat,
      reason: `Your average score in ${weakestCat} is ${Math.round(lowestAvg)}%. Retaking or practicing this category will reinforce key rules.`,
      badgeText: 'TARGETED PRACTICE',
    };
  }

  // User is doing great (>80% everywhere)! Recommend an Advanced quiz
  const advancedQuiz = quizzes.find(q => q.difficulty === 'Advanced') || quizzes[quizzes.length - 1];
  return {
    recommendedQuizId: advancedQuiz.id,
    recommendedQuiz: advancedQuiz,
    difficulty: 'Advanced',
    category: advancedQuiz.categoryName,
    reason: `Great job scoring high across categories! Challenge yourself with the Advanced quiz: "${advancedQuiz.title}".`,
    badgeText: 'HIGH ACHIEVER CHALLENGE',
  };
}
