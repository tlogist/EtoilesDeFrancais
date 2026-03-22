// 20 French sounds English speakers struggle with most

export interface PronunciationSound {
  id: string;
  name: string;
  ipa: string;
  description: string;
  mouthPosition: string;
  englishEquivalent: string;
  practiceWords: Array<{ french: string; phonetic: string; english: string }>;
  week: number;
}

export const PRONUNCIATION_SOUNDS: PronunciationSound[] = [
  // Week 1
  {
    id: "french-r",
    name: "The French R",
    ipa: "/ʁ/",
    description: "The uvular R — produced at the back of the throat, not the tip of the tongue",
    mouthPosition: "Open mouth slightly. Tongue stays flat and relaxed. Vibrate the back of your throat (uvula) like a gentle gargle.",
    englishEquivalent: "No exact English equivalent. Closest: the gargling sound, or the 'ch' in Scottish 'loch' but voiced.",
    practiceWords: [
      { french: "Rouge", phonetic: "ROOZH", english: "Red" },
      { french: "Regarder", phonetic: "ruh-gar-DAY", english: "To look at" },
      { french: "Paris", phonetic: "pah-REE", english: "Paris" },
    ],
    week: 1,
  },
  {
    id: "nasal-an",
    name: "Nasal AN/EN",
    ipa: "/ɑ̃/",
    description: "A deep nasal vowel — the 'an' in 'France'",
    mouthPosition: "Open your mouth as if saying 'ah', then redirect airflow through your nose. Don't actually say the 'n'.",
    englishEquivalent: "Like saying 'on' in 'song' but more open, with air through the nose.",
    practiceWords: [
      { french: "France", phonetic: "FRAHNSS", english: "France" },
      { french: "Enfant", phonetic: "ahn-FAHN", english: "Child" },
      { french: "Pendant", phonetic: "pahn-DAHN", english: "During" },
    ],
    week: 1,
  },
  {
    id: "nasal-on",
    name: "Nasal ON",
    ipa: "/ɔ̃/",
    description: "A rounded nasal vowel — lips form an 'O' shape",
    mouthPosition: "Round your lips into an 'O'. Send the sound through your nose. Don't pronounce the 'n'.",
    englishEquivalent: "Like 'on' in English but nasalized — don't let your tongue touch the roof of your mouth.",
    practiceWords: [
      { french: "Bon", phonetic: "BOHN", english: "Good" },
      { french: "Maison", phonetic: "may-ZOHN", english: "House" },
      { french: "Chanson", phonetic: "shahn-SOHN", english: "Song" },
    ],
    week: 1,
  },
  {
    id: "nasal-in",
    name: "Nasal IN/UN",
    ipa: "/ɛ̃/",
    description: "A bright nasal vowel — like a nasalized 'eh'",
    mouthPosition: "Spread your lips slightly (like a smile). Send the sound through your nose.",
    englishEquivalent: "Like the 'an' in 'can' but nasalized.",
    practiceWords: [
      { french: "Vin", phonetic: "VAHN", english: "Wine" },
      { french: "Matin", phonetic: "mah-TAHN", english: "Morning" },
      { french: "Pain", phonetic: "PAHN", english: "Bread" },
    ],
    week: 1,
  },
  {
    id: "silent-letters",
    name: "Silent Letters",
    ipa: "Various",
    description: "French drops final consonants. Most words ending in consonants don't pronounce the last letter.",
    mouthPosition: "The rule: final consonants are usually silent EXCEPT c, r, f, l (remember: CaReFuL).",
    englishEquivalent: "Similar to how English drops the 'k' in 'knight' — but French does this much more.",
    practiceWords: [
      { french: "Petit", phonetic: "puh-TEE", english: "Small (silent t)" },
      { french: "Beaucoup", phonetic: "boh-KOO", english: "A lot (silent p)" },
      { french: "Heureux", phonetic: "uh-RUH", english: "Happy (silent x)" },
    ],
    week: 1,
  },
  // Week 2
  {
    id: "u-vs-ou",
    name: "U vs OU",
    ipa: "/y/ vs /u/",
    description: "The tricky French 'u' — different from 'ou'. 'Tu' and 'tout' are different!",
    mouthPosition: "For U /y/: say 'ee' then round your lips tightly (like blowing out a candle). For OU /u/: just say 'oo' like in 'food'.",
    englishEquivalent: "OU = English 'oo' (food). U = no English equivalent. German 'u' in 'uber' is the same.",
    practiceWords: [
      { french: "Tu / Tout", phonetic: "TU / TOO", english: "You / All" },
      { french: "Rue / Roue", phonetic: "RU / ROO", english: "Street / Wheel" },
      { french: "Vu / Vous", phonetic: "VU / VOO", english: "Seen / You" },
    ],
    week: 2,
  },
  {
    id: "e-distinctions",
    name: "The Three E Sounds",
    ipa: "/e/ /ɛ/ /ə/",
    description: "French has three distinct 'e' sounds that English speakers often merge",
    mouthPosition: "/e/ (closed): lips slightly spread, like 'ay'. /ɛ/ (open): mouth more open, like 'eh'. /ə/ (schwa): relaxed, like 'uh'.",
    englishEquivalent: "/e/ = 'ay' in 'say'. /ɛ/ = 'e' in 'bet'. /ə/ = 'a' in 'about'.",
    practiceWords: [
      { french: "Ete", phonetic: "ay-TAY", english: "Summer (/e/)" },
      { french: "Mere", phonetic: "MAIR", english: "Mother (/ɛ/)" },
      { french: "Le", phonetic: "LUH", english: "The (/ə/)" },
    ],
    week: 2,
  },
  {
    id: "liaison-rules",
    name: "Liaison Rules",
    ipa: "Linking",
    description: "When a silent final consonant is pronounced because the next word starts with a vowel",
    mouthPosition: "Link the words together smoothly. 'Les amis' = 'lay-zah-MEE', not 'lay ah-MEE'.",
    englishEquivalent: "Similar to how English says 'an apple' vs 'a cat' — but French links the consonant.",
    practiceWords: [
      { french: "Les amis", phonetic: "lay-zah-MEE", english: "The friends" },
      { french: "Nous avons", phonetic: "noo-zah-VOHN", english: "We have" },
      { french: "Tres important", phonetic: "tray-zam-por-TAHN", english: "Very important" },
    ],
    week: 2,
  },
  // Week 3
  {
    id: "french-j",
    name: "The French J (ZH)",
    ipa: "/ʒ/",
    description: "The French J sounds like 'zh' — the sound in English 'measure' or 'vision'",
    mouthPosition: "Round your lips slightly. Vibrate your vocal cords while pushing air through. Like 'sh' but voiced.",
    englishEquivalent: "The 's' in 'measure', 'vision', 'pleasure'. NOT like the English 'j' in 'jump'.",
    practiceWords: [
      { french: "Je", phonetic: "ZHUH", english: "I" },
      { french: "Jardin", phonetic: "zhar-DAHN", english: "Garden" },
      { french: "Toujours", phonetic: "too-ZHOOR", english: "Always" },
    ],
    week: 3,
  },
  {
    id: "ch-vs-sh",
    name: "CH = SH",
    ipa: "/ʃ/",
    description: "French 'ch' is always 'sh' — never the hard 'ch' of English 'church'",
    mouthPosition: "Round your lips and push air through without vibrating. Exactly like English 'sh' in 'shoe'.",
    englishEquivalent: "Always 'sh' as in 'shoe'. Never 'ch' as in 'cheese'.",
    practiceWords: [
      { french: "Chat", phonetic: "SHAH", english: "Cat" },
      { french: "Chocolat", phonetic: "shoh-koh-LAH", english: "Chocolate" },
      { french: "Chercher", phonetic: "shair-SHAY", english: "To search" },
    ],
    week: 3,
  },
  {
    id: "tion-pronunciation",
    name: "-TION = SYOHN",
    ipa: "/sjɔ̃/",
    description: "Words ending in -tion are pronounced 'syohn' — not 'shun' like English",
    mouthPosition: "Say 'see-ohn' quickly. The 't' becomes an 's' sound.",
    englishEquivalent: "English 'nation' = NAY-shun. French 'nation' = nah-SYOHN.",
    practiceWords: [
      { french: "Information", phonetic: "an-for-mah-SYOHN", english: "Information" },
      { french: "Situation", phonetic: "see-tu-ah-SYOHN", english: "Situation" },
      { french: "Education", phonetic: "ay-du-kah-SYOHN", english: "Education" },
    ],
    week: 3,
  },
  // Week 4-5
  {
    id: "rhythm-patterns",
    name: "French Rhythm",
    ipa: "Stress",
    description: "French stresses the LAST syllable of each phrase. No word-level stress like English.",
    mouthPosition: "Keep all syllables equal length, then slightly lengthen the very last one. French is 'machine-gun' rhythm vs English 'bouncing ball'.",
    englishEquivalent: "English: CHA-co-late. French: cho-co-LAT. Every syllable gets equal weight except the last.",
    practiceWords: [
      { french: "Chocolat", phonetic: "sho-ko-LAH", english: "Chocolate" },
      { french: "Restaurant", phonetic: "res-toh-RAHN", english: "Restaurant" },
      { french: "Absolument", phonetic: "ab-so-lu-MAHN", english: "Absolutely" },
    ],
    week: 4,
  },
  {
    id: "connected-speech",
    name: "Connected Speech",
    ipa: "Flow",
    description: "In natural French, words flow together without pauses between them",
    mouthPosition: "Don't pause between words. 'Je suis alle au cinema' sounds like one long word: 'zhuh-swee-zah-lay-oh-see-nay-mah'.",
    englishEquivalent: "Like English 'Didja eat yet?' for 'Did you eat yet?' — but French does this ALL the time.",
    practiceWords: [
      { french: "Il est alle", phonetic: "ee-lay-tah-LAY", english: "He went" },
      { french: "Je ne sais pas", phonetic: "zhun-say-PAH", english: "I don't know" },
      { french: "Qu'est-ce que c'est", phonetic: "kess-kuh-SAY", english: "What is it?" },
    ],
    week: 4,
  },
  {
    id: "intonation-patterns",
    name: "French Intonation",
    ipa: "Melody",
    description: "French intonation rises at the end of questions and falls at the end of statements",
    mouthPosition: "Statements: pitch gently falls at the end. Questions: pitch rises at the end. Less dramatic than English.",
    englishEquivalent: "Similar to English but more subtle. French sounds 'flatter' overall with less pitch variation.",
    practiceWords: [
      { french: "Tu viens ?", phonetic: "tu vee-AHN ↗", english: "You're coming? (rising)" },
      { french: "Je viens.", phonetic: "zhuh vee-AHN ↘", english: "I'm coming. (falling)" },
      { french: "C'est vrai ?!", phonetic: "say VRAY ↗", english: "Really?! (rising)" },
    ],
    week: 5,
  },
  {
    id: "accent-reduction",
    name: "Accent Polishing",
    ipa: "Overall",
    description: "Final tips for reducing your English accent when speaking French",
    mouthPosition: "Key fixes: 1) Don't aspirate p/t/k (no puff of air). 2) Keep vowels pure (don't slide). 3) Roll nothing — the R is in the throat.",
    englishEquivalent: "English 'top' has a puff of air on the T. French 'trop' does not. Hold your hand in front of your mouth to check.",
    practiceWords: [
      { french: "Trop", phonetic: "TROH", english: "Too much (soft t)" },
      { french: "Petit", phonetic: "puh-TEE", english: "Small (soft p)" },
      { french: "Cadeau", phonetic: "kah-DOH", english: "Gift (soft k)" },
    ],
    week: 5,
  },
];
