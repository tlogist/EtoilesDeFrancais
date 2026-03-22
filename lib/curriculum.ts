// 5-week progressive curriculum — controls content unlocking and pacing

export interface WeekConfig {
  name: string;
  focus: string;
  unlocks: {
    foundation: { wordCategories: string[] };
    grammar: { rules: string[] };
    pronunciation: { sounds: string[] };
    conversation: { topics: string[] };
    phrases: { categories: string[] };
    immersion: { days: number[] };
  };
}

export const CURRICULUM: Record<string, WeekConfig> = {
  week1: {
    name: "Les Bases (The Basics)",
    focus: "Foundation vocabulary, core sounds, essential grammar",
    unlocks: {
      foundation: {
        wordCategories: ["greetings", "numbers", "essentials"],
      },
      grammar: {
        rules: [
          "pronouns",
          "etre-avoir",
          "sentence-structure",
          "gender",
          "negation",
        ],
      },
      pronunciation: {
        sounds: ["french-r", "nasal-an", "nasal-on", "nasal-in", "silent-letters"],
      },
      conversation: {
        topics: ["introducing-yourself", "basic-greetings"],
      },
      phrases: {
        categories: ["basic-reactions", "essential-greetings"],
      },
      immersion: { days: [1, 2, 3, 4, 5, 6, 7] },
    },
  },
  week2: {
    name: "Construire (Building Up)",
    focus: "Verb patterns, everyday situations, core phrases",
    unlocks: {
      foundation: {
        wordCategories: ["food-drink", "travel"],
      },
      grammar: {
        rules: [
          "er-verbs",
          "ir-re-verbs",
          "articles",
          "asking-questions",
          "adjective-placement",
        ],
      },
      pronunciation: {
        sounds: ["u-vs-ou", "e-distinctions", "liaison-rules"],
      },
      conversation: {
        topics: ["at-the-cafe", "asking-directions", "at-the-market"],
      },
      phrases: {
        categories: ["filler-words", "reactions"],
      },
      immersion: { days: [8, 9, 10, 11, 12, 13, 14] },
    },
  },
  week3: {
    name: "Raconter (Telling Stories)",
    focus: "Past tense, pronouns, longer conversations",
    unlocks: {
      foundation: {
        wordCategories: ["emotions", "time"],
      },
      grammar: {
        rules: [
          "passe-compose",
          "irregular-past",
          "object-pronouns",
          "prepositions",
          "possessives",
        ],
      },
      pronunciation: {
        sounds: ["french-j", "ch-vs-sh", "tion-pronunciation"],
      },
      conversation: {
        topics: ["at-a-restaurant", "meeting-someone", "telling-a-story"],
      },
      phrases: {
        categories: ["opinions", "agreement-disagreement"],
      },
      immersion: { days: [15, 16, 17, 18, 19, 20, 21] },
    },
  },
  week4: {
    name: "Nuancer (Adding Nuance)",
    focus: "Tenses, conditionals, natural speech patterns",
    unlocks: {
      foundation: {
        wordCategories: ["people", "actions"],
      },
      grammar: {
        rules: [
          "imparfait-vs-compose",
          "future-aller",
          "conditional",
          "relative-pronouns",
          "comparisons",
        ],
      },
      pronunciation: {
        sounds: ["rhythm-patterns", "connected-speech"],
      },
      conversation: {
        topics: ["phone-call", "making-plans", "expressing-opinions"],
      },
      phrases: {
        categories: ["casual-speech", "texting"],
      },
      immersion: { days: [22, 23, 24, 25, 26, 27, 28] },
    },
  },
  week5: {
    name: "Maitriser (Mastering)",
    focus: "Advanced structures, idioms, fluency",
    unlocks: {
      foundation: {
        wordCategories: ["questions", "connectors"],
      },
      grammar: {
        rules: [
          "subjunctive",
          "advanced-negation",
          "idiomatic-expressions",
          "common-pitfalls",
          "register-formal-informal",
        ],
      },
      pronunciation: {
        sounds: ["intonation-patterns", "accent-reduction"],
      },
      conversation: {
        topics: ["debate", "storytelling", "free-conversation"],
      },
      phrases: {
        categories: ["slang", "advanced-expressions"],
      },
      immersion: { days: [29, 30, 31, 32, 33, 34, 35] },
    },
  },
};

// Get all unlocked content for a given week (cumulative)
export function getUnlockedContent(currentWeek: number) {
  const unlocked = {
    foundation: { wordCategories: [] as string[] },
    grammar: { rules: [] as string[] },
    pronunciation: { sounds: [] as string[] },
    conversation: { topics: [] as string[] },
    phrases: { categories: [] as string[] },
    immersion: { days: [] as number[] },
  };

  for (let w = 1; w <= currentWeek; w++) {
    const week = CURRICULUM[`week${w}`];
    if (!week) continue;
    unlocked.foundation.wordCategories.push(
      ...week.unlocks.foundation.wordCategories
    );
    unlocked.grammar.rules.push(...week.unlocks.grammar.rules);
    unlocked.pronunciation.sounds.push(...week.unlocks.pronunciation.sounds);
    unlocked.conversation.topics.push(...week.unlocks.conversation.topics);
    unlocked.phrases.categories.push(...week.unlocks.phrases.categories);
    unlocked.immersion.days.push(...week.unlocks.immersion.days);
  }

  return unlocked;
}

// Get recommended daily activities based on current week/day
export function getDailyActivities(week: number, day: number) {
  const dayOfWeek = ((day - 1) % 7) + 1;
  const activities = [
    // Warm up the mouth first — always start with pronunciation
    {
      module: "pronunciation",
      title:
        dayOfWeek === 1
          ? "New sounds lesson"
          : "Pronunciation warm-up",
      path:
        dayOfWeek === 1
          ? "/pronunciation"
          : "/pronunciation/warmup",
      duration: 5,
    },
    {
      module: "foundation",
      title: dayOfWeek <= 5 ? "Learn 5 new words" : "Review vocabulary",
      path: dayOfWeek <= 5 ? "/foundation/learn" : "/foundation/review",
      duration: 10,
    },
    {
      module: "conversation",
      title: "10-min conversation practice",
      path: "/conversation",
      duration: 10,
    },
  ];

  // Add grammar on specific days
  if (dayOfWeek <= 5) {
    activities.push({
      module: "grammar",
      title: "Grammar lesson",
      path: "/grammar",
      duration: 10,
    });
  }

  // Add immersion journal on alternating days
  if (dayOfWeek % 2 === 0) {
    activities.push({
      module: "immersion",
      title: "French journal entry",
      path: "/immersion/journal",
      duration: 15,
    });
  }

  return activities;
}
