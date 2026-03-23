import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default user only if they don't exist — never overwrite progress
  const existingUser = await prisma.user.findUnique({ where: { id: "default-user" } });
  if (!existingUser) {
    await prisma.user.create({ data: { id: "default-user" } });
    console.log("Created default user");
  } else {
    console.log(`Existing user preserved (Week ${existingUser.currentWeek}, Day ${existingUser.currentDay}, Streak ${existingUser.streakDays})`);
  }

  // Seed vocabulary words (100 most-used French words across 10 categories)
  const vocabWords = [
    // Week 1: Greetings
    { french: "Bonjour", english: "Hello/Good morning", category: "greetings", pronunciation: "bohn-ZHOOR", week: 1 },
    { french: "Bonsoir", english: "Good evening", category: "greetings", pronunciation: "bohn-SWAHR", week: 1 },
    { french: "Salut", english: "Hi/Bye (informal)", category: "greetings", pronunciation: "sah-LU", week: 1 },
    { french: "Au revoir", english: "Goodbye", category: "greetings", pronunciation: "oh ruh-VWAHR", week: 1 },
    { french: "Merci", english: "Thank you", category: "greetings", pronunciation: "mair-SEE", week: 1 },
    { french: "S'il vous plaît", english: "Please (formal)", category: "greetings", pronunciation: "seel voo PLEH", week: 1 },
    { french: "Excusez-moi", english: "Excuse me", category: "greetings", pronunciation: "ex-ku-zay MWAH", week: 1 },
    { french: "Pardon", english: "Sorry/Pardon", category: "greetings", pronunciation: "par-DOHN", week: 1 },
    { french: "Oui", english: "Yes", category: "greetings", pronunciation: "WEE", week: 1 },
    { french: "Non", english: "No", category: "greetings", pronunciation: "NOHN", week: 1 },
    // Week 1: Numbers
    { french: "Un", english: "One", category: "numbers", pronunciation: "UHN", week: 1 },
    { french: "Deux", english: "Two", category: "numbers", pronunciation: "DUH", week: 1 },
    { french: "Trois", english: "Three", category: "numbers", pronunciation: "TRWAH", week: 1 },
    { french: "Quatre", english: "Four", category: "numbers", pronunciation: "KAH-truh", week: 1 },
    { french: "Cinq", english: "Five", category: "numbers", pronunciation: "SAHNK", week: 1 },
    { french: "Six", english: "Six", category: "numbers", pronunciation: "SEES", week: 1 },
    { french: "Sept", english: "Seven", category: "numbers", pronunciation: "SET", week: 1 },
    { french: "Huit", english: "Eight", category: "numbers", pronunciation: "WEET", week: 1 },
    { french: "Neuf", english: "Nine", category: "numbers", pronunciation: "NUHF", week: 1 },
    { french: "Dix", english: "Ten", category: "numbers", pronunciation: "DEES", week: 1 },
    // Week 1: Essentials
    { french: "Je", english: "I", category: "essentials", pronunciation: "ZHUH", week: 1 },
    { french: "Tu", english: "You (informal)", category: "essentials", pronunciation: "TU", week: 1 },
    { french: "Il/Elle", english: "He/She", category: "essentials", pronunciation: "EEL/EL", week: 1 },
    { french: "Nous", english: "We", category: "essentials", pronunciation: "NOO", week: 1 },
    { french: "Vous", english: "You (formal/plural)", category: "essentials", pronunciation: "VOO", week: 1 },
    { french: "Être", english: "To be", category: "essentials", pronunciation: "EH-truh", week: 1 },
    { french: "Avoir", english: "To have", category: "essentials", pronunciation: "ah-VWAHR", week: 1 },
    { french: "Faire", english: "To do/make", category: "essentials", pronunciation: "FAIR", week: 1 },
    { french: "C'est", english: "It is/This is", category: "essentials", pronunciation: "SEH", week: 1 },
    { french: "Il y a", english: "There is/are", category: "essentials", pronunciation: "eel ee AH", week: 1 },
    // Week 2: Food & Drink
    { french: "L'eau", english: "Water", category: "food-drink", pronunciation: "LOH", week: 2 },
    { french: "Le café", english: "Coffee", category: "food-drink", pronunciation: "luh kah-FAY", week: 2 },
    { french: "Le pain", english: "Bread", category: "food-drink", pronunciation: "luh PAHN", week: 2 },
    { french: "Le vin", english: "Wine", category: "food-drink", pronunciation: "luh VAHN", week: 2 },
    { french: "Le fromage", english: "Cheese", category: "food-drink", pronunciation: "luh froh-MAHZH", week: 2 },
    { french: "La bière", english: "Beer", category: "food-drink", pronunciation: "lah bee-AIR", week: 2 },
    { french: "Le poulet", english: "Chicken", category: "food-drink", pronunciation: "luh poo-LAY", week: 2 },
    { french: "La salade", english: "Salad", category: "food-drink", pronunciation: "lah sah-LAHD", week: 2 },
    { french: "Le dessert", english: "Dessert", category: "food-drink", pronunciation: "luh deh-SAIR", week: 2 },
    { french: "L'addition", english: "The check/bill", category: "food-drink", pronunciation: "lah-dee-SYOHN", week: 2 },
    // Week 2: Travel
    { french: "La gare", english: "Train station", category: "travel", pronunciation: "lah GAHR", week: 2 },
    { french: "L'aéroport", english: "Airport", category: "travel", pronunciation: "lah-ay-roh-POHR", week: 2 },
    { french: "Le billet", english: "Ticket", category: "travel", pronunciation: "luh bee-YAY", week: 2 },
    { french: "À gauche", english: "To the left", category: "travel", pronunciation: "ah GOHSH", week: 2 },
    { french: "À droite", english: "To the right", category: "travel", pronunciation: "ah DRWAHT", week: 2 },
    { french: "Tout droit", english: "Straight ahead", category: "travel", pronunciation: "too DRWAH", week: 2 },
    { french: "La rue", english: "The street", category: "travel", pronunciation: "lah RU", week: 2 },
    { french: "Le métro", english: "Subway", category: "travel", pronunciation: "luh may-TROH", week: 2 },
    { french: "L'hôtel", english: "Hotel", category: "travel", pronunciation: "loh-TEL", week: 2 },
    { french: "Où est...?", english: "Where is...?", category: "travel", pronunciation: "oo EH", week: 2 },
    // Week 3: Emotions
    { french: "Content(e)", english: "Happy", category: "emotions", pronunciation: "kohn-TAHN(t)", week: 3 },
    { french: "Triste", english: "Sad", category: "emotions", pronunciation: "TREEST", week: 3 },
    { french: "Fatigué(e)", english: "Tired", category: "emotions", pronunciation: "fah-tee-GAY", week: 3 },
    { french: "Énervé(e)", english: "Annoyed/Angry", category: "emotions", pronunciation: "ay-nair-VAY", week: 3 },
    { french: "Surpris(e)", english: "Surprised", category: "emotions", pronunciation: "sur-PREE(z)", week: 3 },
    { french: "Inquiet/Inquiète", english: "Worried", category: "emotions", pronunciation: "ahn-kee-AY(t)", week: 3 },
    { french: "Fier/Fière", english: "Proud", category: "emotions", pronunciation: "fee-AIR", week: 3 },
    { french: "Amoureux/se", english: "In love", category: "emotions", pronunciation: "ah-moo-RUH(z)", week: 3 },
    { french: "Déçu(e)", english: "Disappointed", category: "emotions", pronunciation: "day-SU", week: 3 },
    { french: "Enthousiaste", english: "Enthusiastic", category: "emotions", pronunciation: "ahn-too-zee-AHST", week: 3 },
    // Week 3: Time
    { french: "Aujourd'hui", english: "Today", category: "time", pronunciation: "oh-zhoor-DWEE", week: 3 },
    { french: "Demain", english: "Tomorrow", category: "time", pronunciation: "duh-MAHN", week: 3 },
    { french: "Hier", english: "Yesterday", category: "time", pronunciation: "ee-AIR", week: 3 },
    { french: "Maintenant", english: "Now", category: "time", pronunciation: "mahn-tuh-NAHN", week: 3 },
    { french: "Toujours", english: "Always/Still", category: "time", pronunciation: "too-ZHOOR", week: 3 },
    { french: "Jamais", english: "Never", category: "time", pronunciation: "zhah-MAY", week: 3 },
    { french: "Souvent", english: "Often", category: "time", pronunciation: "soo-VAHN", week: 3 },
    { french: "Parfois", english: "Sometimes", category: "time", pronunciation: "par-FWAH", week: 3 },
    { french: "Bientôt", english: "Soon", category: "time", pronunciation: "bee-ahn-TOH", week: 3 },
    { french: "Déjà", english: "Already", category: "time", pronunciation: "day-ZHAH", week: 3 },
    // Week 4: People
    { french: "Un ami(e)", english: "A friend", category: "people", pronunciation: "uhn ah-MEE", week: 4 },
    { french: "La famille", english: "Family", category: "people", pronunciation: "lah fah-MEE-yuh", week: 4 },
    { french: "Un enfant", english: "A child", category: "people", pronunciation: "uhn ahn-FAHN", week: 4 },
    { french: "Un homme", english: "A man", category: "people", pronunciation: "uhn OM", week: 4 },
    { french: "Une femme", english: "A woman", category: "people", pronunciation: "un FAM", week: 4 },
    { french: "Le mari", english: "Husband", category: "people", pronunciation: "luh mah-REE", week: 4 },
    { french: "La femme", english: "Wife", category: "people", pronunciation: "lah FAM", week: 4 },
    { french: "Le voisin(e)", english: "Neighbor", category: "people", pronunciation: "luh vwah-ZAHN", week: 4 },
    { french: "Le/La collègue", english: "Colleague", category: "people", pronunciation: "luh koh-LEG", week: 4 },
    { french: "Le patron(ne)", english: "Boss", category: "people", pronunciation: "luh pah-TROHN", week: 4 },
    // Week 4: Actions
    { french: "Aller", english: "To go", category: "actions", pronunciation: "ah-LAY", week: 4 },
    { french: "Venir", english: "To come", category: "actions", pronunciation: "vuh-NEER", week: 4 },
    { french: "Prendre", english: "To take", category: "actions", pronunciation: "PRAHN-druh", week: 4 },
    { french: "Donner", english: "To give", category: "actions", pronunciation: "doh-NAY", week: 4 },
    { french: "Dire", english: "To say/tell", category: "actions", pronunciation: "DEER", week: 4 },
    { french: "Savoir", english: "To know (fact)", category: "actions", pronunciation: "sah-VWAHR", week: 4 },
    { french: "Pouvoir", english: "To be able to/Can", category: "actions", pronunciation: "poo-VWAHR", week: 4 },
    { french: "Vouloir", english: "To want", category: "actions", pronunciation: "voo-LWAHR", week: 4 },
    { french: "Devoir", english: "To have to/Must", category: "actions", pronunciation: "duh-VWAHR", week: 4 },
    { french: "Comprendre", english: "To understand", category: "actions", pronunciation: "kohm-PRAHN-druh", week: 4 },
    // Week 5: Questions
    { french: "Qui", english: "Who", category: "questions", pronunciation: "KEE", week: 5 },
    { french: "Quoi/Que", english: "What", category: "questions", pronunciation: "KWAH/KUH", week: 5 },
    { french: "Où", english: "Where", category: "questions", pronunciation: "OO", week: 5 },
    { french: "Quand", english: "When", category: "questions", pronunciation: "KAHN", week: 5 },
    { french: "Pourquoi", english: "Why", category: "questions", pronunciation: "poor-KWAH", week: 5 },
    { french: "Comment", english: "How", category: "questions", pronunciation: "koh-MAHN", week: 5 },
    { french: "Combien", english: "How much/many", category: "questions", pronunciation: "kohm-bee-AHN", week: 5 },
    { french: "Quel(le)", english: "Which/What", category: "questions", pronunciation: "KEL", week: 5 },
    { french: "Est-ce que", english: "Question marker", category: "questions", pronunciation: "ess-kuh", week: 5 },
    { french: "N'est-ce pas", english: "Isn't it?/Right?", category: "questions", pronunciation: "ness-PAH", week: 5 },
    // Week 5: Connectors
    { french: "Mais", english: "But", category: "connectors", pronunciation: "MAY", week: 5 },
    { french: "Et", english: "And", category: "connectors", pronunciation: "AY", week: 5 },
    { french: "Ou", english: "Or", category: "connectors", pronunciation: "OO", week: 5 },
    { french: "Donc", english: "So/Therefore", category: "connectors", pronunciation: "DOHNK", week: 5 },
    { french: "Parce que", english: "Because", category: "connectors", pronunciation: "pars-KUH", week: 5 },
    { french: "Alors", english: "Then/So", category: "connectors", pronunciation: "ah-LOHR", week: 5 },
    { french: "Cependant", english: "However", category: "connectors", pronunciation: "suh-pahn-DAHN", week: 5 },
    { french: "En plus", english: "Moreover/Besides", category: "connectors", pronunciation: "ahn PLU", week: 5 },
    { french: "D'abord", english: "First/Firstly", category: "connectors", pronunciation: "dah-BOHR", week: 5 },
    { french: "Enfin", english: "Finally", category: "connectors", pronunciation: "ahn-FAHN", week: 5 },
  ];

  for (const word of vocabWords) {
    await prisma.vocabWord.upsert({
      where: { id: `vocab-${word.french.toLowerCase().replace(/[^a-z]/g, "-")}` },
      update: word,
      create: { id: `vocab-${word.french.toLowerCase().replace(/[^a-z]/g, "-")}`, ...word },
    });
  }

  // Seed phrases (50+ real-world phrases)
  const phrases = [
    // Basic Reactions
    { french: "Ah bon ?", english: "Oh really?", context: "Express surprise or interest", category: "basic-reactions", isSlang: false, week: 1 },
    { french: "C'est pas vrai !", english: "No way!", context: "Express disbelief", category: "basic-reactions", isSlang: false, week: 1 },
    { french: "Super !", english: "Great!/Awesome!", context: "Express enthusiasm", category: "basic-reactions", isSlang: false, week: 1 },
    { french: "Tant pis", english: "Too bad/Oh well", context: "Accept a disappointing outcome", category: "basic-reactions", isSlang: false, week: 1 },
    { french: "Tant mieux", english: "Good/All the better", context: "Express relief that something worked out", category: "basic-reactions", isSlang: false, week: 1 },
    { french: "N'importe quoi", english: "Whatever/Nonsense", context: "Dismiss something as ridiculous", category: "basic-reactions", isSlang: false, week: 1 },
    // Essential Greetings
    { french: "Comment allez-vous ?", english: "How are you? (formal)", context: "Formal greeting with strangers or elders", category: "essential-greetings", isSlang: false, week: 1 },
    { french: "Ca va ?", english: "How's it going?", context: "Casual greeting with friends", category: "essential-greetings", isSlang: false, week: 1 },
    { french: "Enchanté(e)", english: "Nice to meet you", context: "When introduced to someone", category: "essential-greetings", isSlang: false, week: 1 },
    { french: "À bientôt", english: "See you soon", context: "Casual goodbye", category: "essential-greetings", isSlang: false, week: 1 },
    { french: "Bonne journée", english: "Have a nice day", context: "Leaving a shop or ending a conversation", category: "essential-greetings", isSlang: false, week: 1 },
    { french: "À tout à l'heure", english: "See you later (same day)", context: "When you'll see the person again today", category: "essential-greetings", isSlang: false, week: 1 },
    // Filler Words
    { french: "Du coup", english: "So/As a result", context: "Transition word, very commonly used", category: "filler-words", isSlang: false, week: 2 },
    { french: "En fait", english: "Actually/In fact", context: "Correct or clarify something", category: "filler-words", isSlang: false, week: 2 },
    { french: "Bref", english: "Anyway/In short", context: "Wrap up a long explanation", category: "filler-words", isSlang: false, week: 2 },
    { french: "Quand même", english: "Still/All the same", context: "Add emphasis or express persistence", category: "filler-words", isSlang: false, week: 2 },
    { french: "Bon ben", english: "Well then", context: "Transition or conclude", category: "filler-words", isSlang: false, week: 2 },
    { french: "Voilà", english: "There you go/That's it", context: "Present something or conclude", category: "filler-words", isSlang: false, week: 2 },
    { french: "Euh...", english: "Um...", context: "Thinking pause", category: "filler-words", isSlang: false, week: 2 },
    // Reactions
    { french: "C'est génial !", english: "That's awesome!", context: "Express excitement", category: "reactions", isSlang: false, week: 2 },
    { french: "C'est nul", english: "That sucks/It's rubbish", context: "Express disappointment", category: "reactions", isSlang: false, week: 2 },
    { french: "Je m'en fiche", english: "I don't care", context: "Express indifference (casual)", category: "reactions", isSlang: false, week: 2 },
    { french: "C'est dommage", english: "That's a shame", context: "Express sympathy", category: "reactions", isSlang: false, week: 2 },
    { french: "Ça m'énerve", english: "That annoys me", context: "Express frustration", category: "reactions", isSlang: false, week: 2 },
    { french: "J'en ai marre", english: "I'm fed up", context: "Express being fed up with something", category: "reactions", isSlang: false, week: 2 },
    // Opinions
    { french: "A mon avis", english: "In my opinion", context: "Introduce your opinion", category: "opinions", isSlang: false, week: 3 },
    { french: "Je pense que", english: "I think that", context: "State what you think", category: "opinions", isSlang: false, week: 3 },
    { french: "Je trouve que", english: "I find that", context: "Express a judgment", category: "opinions", isSlang: false, week: 3 },
    { french: "Il me semble que", english: "It seems to me that", context: "Softer way to give opinion", category: "opinions", isSlang: false, week: 3 },
    { french: "C'est évident", english: "It's obvious", context: "State something is clear", category: "opinions", isSlang: false, week: 3 },
    // Agreement/Disagreement
    { french: "Tout à fait", english: "Absolutely/Exactly", context: "Strong agreement", category: "agreement-disagreement", isSlang: false, week: 3 },
    { french: "Je suis d'accord", english: "I agree", context: "Basic agreement", category: "agreement-disagreement", isSlang: false, week: 3 },
    { french: "Pas du tout", english: "Not at all", context: "Strong disagreement", category: "agreement-disagreement", isSlang: false, week: 3 },
    { french: "Ça dépend", english: "It depends", context: "Non-committal response", category: "agreement-disagreement", isSlang: false, week: 3 },
    { french: "Tu as raison", english: "You're right", context: "Acknowledge someone is right", category: "agreement-disagreement", isSlang: false, week: 3 },
    // Casual Speech
    { french: "T'inquiète", english: "Don't worry", context: "Reassure someone (casual)", category: "casual-speech", isSlang: true, week: 4 },
    { french: "Laisse tomber", english: "Forget it/Drop it", context: "Tell someone to move on", category: "casual-speech", isSlang: false, week: 4 },
    { french: "Ça marche", english: "That works/Sounds good", context: "Agree to a plan", category: "casual-speech", isSlang: false, week: 4 },
    { french: "C'est parti !", english: "Let's go!/Here we go!", context: "Start an activity with enthusiasm", category: "casual-speech", isSlang: false, week: 4 },
    { french: "On y va ?", english: "Shall we go?", context: "Suggest leaving", category: "casual-speech", isSlang: false, week: 4 },
    { french: "Je suis crevé(e)", english: "I'm exhausted", context: "Express extreme tiredness", category: "casual-speech", isSlang: true, week: 4 },
    // Texting
    { french: "Coucou", english: "Hey there", context: "Friendly greeting in texts", category: "texting", isSlang: true, week: 4 },
    { french: "Mdr", english: "LOL (mort de rire)", context: "Texting abbreviation for laughing", category: "texting", isSlang: true, week: 4 },
    { french: "Stp", english: "Please (s'il te plaît)", context: "Texting abbreviation", category: "texting", isSlang: true, week: 4 },
    { french: "Bcp", english: "A lot (beaucoup)", context: "Texting abbreviation", category: "texting", isSlang: true, week: 4 },
    { french: "Jsp", english: "I don't know (je sais pas)", context: "Texting abbreviation", category: "texting", isSlang: true, week: 4 },
    // Slang
    { french: "Kiffer", english: "To really like/love", context: "Casual way to say you love something", category: "slang", isSlang: true, week: 5 },
    { french: "Bosser", english: "To work", context: "Informal for 'travailler'", category: "slang", isSlang: true, week: 5 },
    { french: "Flâner", english: "To stroll/wander", context: "Walking around without purpose", category: "slang", isSlang: false, week: 5 },
    { french: "Un truc", english: "A thing/stuff", context: "Casual replacement for 'une chose'", category: "slang", isSlang: true, week: 5 },
    { french: "Galérer", english: "To struggle/have a hard time", context: "When something is difficult", category: "slang", isSlang: true, week: 5 },
    // Advanced Expressions
    { french: "Avoir le cafard", english: "To feel down/blue", context: "Idiomatic: 'to have the cockroach'", category: "advanced-expressions", isSlang: false, week: 5 },
    { french: "Poser un lapin", english: "To stand someone up", context: "Idiomatic: 'to place a rabbit'", category: "advanced-expressions", isSlang: false, week: 5 },
    { french: "Avoir la flemme", english: "To feel lazy", context: "Very common casual expression", category: "advanced-expressions", isSlang: true, week: 5 },
    { french: "Tomber dans les pommes", english: "To faint", context: "Idiomatic: 'to fall in the apples'", category: "advanced-expressions", isSlang: false, week: 5 },
    { french: "Ce n'est pas la mer à boire", english: "It's not that hard", context: "Idiomatic: 'it's not the sea to drink'", category: "advanced-expressions", isSlang: false, week: 5 },
  ];

  for (const phrase of phrases) {
    await prisma.phrase.upsert({
      where: { id: `phrase-${phrase.french.toLowerCase().replace(/[^a-z]/g, "-").slice(0, 30)}` },
      update: phrase,
      create: { id: `phrase-${phrase.french.toLowerCase().replace(/[^a-z]/g, "-").slice(0, 30)}`, ...phrase },
    });
  }

  // Seed grammar rules (25 rules, 5 per week)
  const grammarRules = [
    // Week 1
    {
      id: "pronouns", title: "Subject Pronouns", week: 1,
      shortcut: "I-You-He/She pattern: Je-Tu-Il/Elle, then Nous-Vous-Ils/Elles",
      explanation: "French has 8 subject pronouns. The trick: singular is je/tu/il/elle, plural just adds 'nous/vous/ils/elles'. 'On' (one/we informally) is a bonus 9th that conjugates like il/elle.",
      examples: JSON.stringify(["Je suis etudiant. (I am a student.)", "Tu es francais ? (Are you French?)", "Nous sommes contents. (We are happy.)"])
    },
    {
      id: "etre-avoir", title: "Etre & Avoir (To Be & To Have)", week: 1,
      shortcut: "These two verbs are the building blocks of EVERYTHING in French. Memorize them like your phone number.",
      explanation: "Etre (to be): je suis, tu es, il est, nous sommes, vous etes, ils sont. Avoir (to have): j'ai, tu as, il a, nous avons, vous avez, ils ont. In French, you 'have' hunger, age, and fear (j'ai faim, j'ai 20 ans, j'ai peur).",
      examples: JSON.stringify(["Je suis fatigue. (I am tired.)", "J'ai faim. (I am hungry. — literally 'I have hunger')", "Elle a 25 ans. (She is 25. — literally 'She has 25 years')"])
    },
    {
      id: "sentence-structure", title: "Basic Sentence Structure (SVO)", week: 1,
      shortcut: "French = English word order! Subject + Verb + Object. Just like English.",
      explanation: "Great news: French follows the same Subject-Verb-Object pattern as English. 'I eat bread' = 'Je mange du pain'. The main difference: adjectives usually come AFTER the noun (une voiture rouge = a red car).",
      examples: JSON.stringify(["Je mange du pain. (I eat bread.)", "Elle parle francais. (She speaks French.)", "Nous aimons la musique. (We love music.)"])
    },
    {
      id: "gender", title: "Gender (Le/La/Les)", week: 1,
      shortcut: "Shortcut: words ending in -e are usually feminine. -tion/-sion are ALWAYS feminine. Everything else? Probably masculine.",
      explanation: "Every French noun is masculine (le) or feminine (la). Plural is always 'les'. The 70% rule: words ending in -e tend to be feminine. Words ending in -ment, -age, -eur tend to be masculine. Don't stress about getting it wrong — French people will still understand you!",
      examples: JSON.stringify(["Le chat (the cat, masc.)", "La maison (the house, fem.)", "Les enfants (the children, plural)"])
    },
    {
      id: "negation", title: "Negation (The Ne...Pas Sandwich)", week: 1,
      shortcut: "Make a SANDWICH: put ne...pas around the verb. Ne + VERB + pas.",
      explanation: "To make anything negative, wrap the verb in ne...pas like bread around a filling. 'Je parle' → 'Je ne parle pas'. In spoken French, people often drop the 'ne': 'Je parle pas'. This is normal and very common!",
      examples: JSON.stringify(["Je ne suis pas francais. (I am not French.)", "Il ne mange pas de viande. (He doesn't eat meat.)", "Je comprends pas. (I don't understand. — spoken, dropping 'ne')"])
    },
    // Week 2
    {
      id: "er-verbs", title: "-ER Verb Conjugation", week: 2,
      shortcut: "Drop -er, add: -e, -es, -e, -ons, -ez, -ent. The 'boot pattern': je/tu/il/ils all SOUND the same!",
      explanation: "80% of French verbs are -ER verbs, and they ALL follow this pattern. Even better: je parle, tu parles, il parle, ils parlent all SOUND identical (the endings are silent). You only hear a difference with nous (parlons) and vous (parlez).",
      examples: JSON.stringify(["Je parle francais. (I speak French.)", "Tu manges une pomme. (You eat an apple.)", "Nous travaillons ensemble. (We work together.)"])
    },
    {
      id: "ir-re-verbs", title: "-IR and -RE Verb Patterns", week: 2,
      shortcut: "-IR verbs: drop -ir, add -is, -is, -it, -issons, -issez, -issent. -RE verbs: drop -re, add -s, -s, (nothing), -ons, -ez, -ent.",
      explanation: "-IR verbs like 'finir' (to finish) add -iss- in plural forms. -RE verbs like 'vendre' (to sell) are the simplest — just drop -re and add endings. The il/elle form of -RE verbs has NO ending at all: il vend.",
      examples: JSON.stringify(["Je finis mon travail. (I finish my work.)", "Nous choisissons un restaurant. (We choose a restaurant.)", "Il vend des livres. (He sells books.)"])
    },
    {
      id: "articles", title: "Articles (du/de la/des)", week: 2,
      shortcut: "Think of 'some': du (masc.), de la (fem.), des (plural). Use them whenever English would say 'some' or nothing.",
      explanation: "French ALWAYS needs an article before nouns. 'du/de la/des' are partitive articles meaning 'some'. 'Je mange du pain' = I eat (some) bread. After negation, they ALL become 'de': 'Je ne mange pas de pain'.",
      examples: JSON.stringify(["Je bois du cafe. (I drink coffee.)", "Elle achete de la viande. (She buys meat.)", "Il n'a pas de voiture. (He doesn't have a car.)"])
    },
    {
      id: "asking-questions", title: "Asking Questions (3 Ways)", week: 2,
      shortcut: "Easy→Hard: 1) Add '?' to statement. 2) Start with 'Est-ce que'. 3) Invert subject-verb. All three are correct!",
      explanation: "The lazy way: just raise your voice. 'Tu parles francais?' The medium way: 'Est-ce que tu parles francais?' The formal way: 'Parles-tu francais?' In casual French, method 1 is used 90% of the time.",
      examples: JSON.stringify(["Tu viens ? (You're coming?)", "Est-ce que vous parlez anglais ? (Do you speak English?)", "Ou habites-tu ? (Where do you live? — formal)"])
    },
    {
      id: "adjective-placement", title: "Adjective Placement", week: 2,
      shortcut: "BANGS before the noun: Beauty, Age, Number, Goodness, Size. Everything else goes AFTER.",
      explanation: "Most adjectives go AFTER the noun in French (une voiture rouge = a red car). But the BANGS adjectives go BEFORE: beau/belle (beautiful), nouveau (new), grand (big), petit (small), jeune (young), vieux (old), bon (good), mauvais (bad).",
      examples: JSON.stringify(["Une belle maison (A beautiful house — BANGS)", "Un livre interessant (An interesting book — after)", "Un petit chat noir (A small black cat — petit before, noir after)"])
    },
    // Week 3
    {
      id: "passe-compose", title: "Passe Compose (Past Tense)", week: 3,
      shortcut: "It's just 'I HAVE done': avoir + past participle. Same structure as English!",
      explanation: "The passe compose = avoir (conjugated) + past participle. For -ER verbs: drop -er, add -e (parler→parle). For -IR: drop -ir, add -i (finir→fini). For -RE: drop -re, add -u (vendre→vendu). 17 verbs use 'etre' instead of 'avoir' (mostly movement verbs).",
      examples: JSON.stringify(["J'ai mange une pizza. (I ate a pizza.)", "Elle a fini ses devoirs. (She finished her homework.)", "Nous avons parle francais. (We spoke French.)"])
    },
    {
      id: "irregular-past", title: "Common Irregular Past Participles", week: 3,
      shortcut: "The Big 10: ete (been), eu (had), fait (done), dit (said), vu (seen), pris (taken), mis (put), su (known), pu (been able), voulu (wanted).",
      explanation: "These 10 irregular past participles are used constantly. No pattern to memorize — just learn them like vocabulary. The good news: once you know these 10, you can express almost anything in the past tense.",
      examples: JSON.stringify(["J'ai ete malade. (I was sick.)", "Tu as fait quoi ? (What did you do?)", "Il a vu le film. (He saw the movie.)"])
    },
    {
      id: "object-pronouns", title: "Object Pronouns (me/te/le/la)", week: 3,
      shortcut: "Object pronouns go BEFORE the verb. Think: 'I IT eat' instead of 'I eat IT'.",
      explanation: "me (me), te (you), le (him/it-masc), la (her/it-fem), nous (us), vous (you), les (them). They go BEFORE the verb: 'Je le mange' (I eat it). In past tense, before avoir: 'Je l'ai mange' (I ate it).",
      examples: JSON.stringify(["Je le vois. (I see him/it.)", "Elle me parle. (She talks to me.)", "Tu les as achetes ? (Did you buy them?)"])
    },
    {
      id: "prepositions", title: "Prepositions with Places", week: 3,
      shortcut: "Countries: en (feminine), au (masculine), aux (plural). Cities: always a.",
      explanation: "For cities: always 'a' (a Paris). For feminine countries (ending in -e): 'en' (en France). For masculine countries: 'au' (au Canada). For plural: 'aux' (aux Etats-Unis). Leaving? Use 'de/du/des' (de France, du Canada).",
      examples: JSON.stringify(["J'habite a Paris. (I live in Paris.)", "Je vais en France. (I'm going to France.)", "Il vient du Canada. (He comes from Canada.)"])
    },
    {
      id: "possessives", title: "Possessive Adjectives", week: 3,
      shortcut: "mon/ma/mes (my), ton/ta/tes (your), son/sa/ses (his/her). The possessive matches the THING owned, not the owner!",
      explanation: "This trips up English speakers: 'sa voiture' means 'his car' OR 'her car' — the 'sa' matches 'voiture' (feminine), not the owner. Mon/ton/son (masc.), ma/ta/sa (fem.), mes/tes/ses (plural).",
      examples: JSON.stringify(["Mon ami est francais. (My friend is French.)", "Sa voiture est rouge. (His/Her car is red.)", "Nos enfants sont a l'ecole. (Our children are at school.)"])
    },
    // Week 4
    {
      id: "imparfait-vs-compose", title: "Imparfait vs Passe Compose", week: 4,
      shortcut: "The Movie Scene trick: Imparfait = background/setting. Passe Compose = action/event. 'It WAS raining (imparfait) when I ARRIVED (passe compose).'",
      explanation: "Think of a movie scene. The imparfait sets the scene (weather, feelings, ongoing states). The passe compose is the action that happens. Imparfait: je parlais (I was speaking/used to speak). Form: nous stem + -ais/-ais/-ait/-ions/-iez/-aient.",
      examples: JSON.stringify(["Il pleuvait quand je suis arrive. (It was raining when I arrived.)", "Quand j'etais petit, j'aimais le chocolat. (When I was little, I loved chocolate.)", "Je dormais quand tu as appele. (I was sleeping when you called.)"])
    },
    {
      id: "future-aller", title: "Easy Future (aller + infinitive)", week: 4,
      shortcut: "Going-to future: just use 'aller' + any infinitive. Je vais manger = I'm going to eat. Done!",
      explanation: "The near future is identical to English 'going to': conjugate 'aller' + infinitive verb. Je vais partir (I'm going to leave). This is used MORE than the formal future tense in everyday speech. Master this and you can talk about the future immediately.",
      examples: JSON.stringify(["Je vais manger. (I'm going to eat.)", "Il va pleuvoir demain. (It's going to rain tomorrow.)", "Nous allons voyager en France. (We're going to travel to France.)"])
    },
    {
      id: "conditional", title: "Conditional (Polite Requests)", week: 4,
      shortcut: "Future stem + imparfait endings = conditional. Main use: polite requests. 'Je voudrais' = I would like.",
      explanation: "The conditional makes requests polite: 'je veux' (I want) → 'je voudrais' (I would like). Form: infinitive + -ais/-ais/-ait/-ions/-iez/-aient (same as imparfait endings!). Also used for hypotheticals: 'Si j'avais le temps, je voyagerais.'",
      examples: JSON.stringify(["Je voudrais un cafe, s'il vous plait. (I would like a coffee, please.)", "Pourriez-vous m'aider ? (Could you help me?)", "J'aimerais visiter Paris. (I would like to visit Paris.)"])
    },
    {
      id: "relative-pronouns", title: "Relative Pronouns (qui/que)", week: 4,
      shortcut: "Qui = who/which (subject). Que = whom/which (object). Qui is followed by a VERB. Que is followed by a SUBJECT.",
      explanation: "Qui replaces the subject: 'L'homme QUI parle' (the man WHO is speaking). Que replaces the object: 'Le livre QUE je lis' (the book THAT I'm reading). Test: if the next word is a verb, use qui. If it's a noun/pronoun, use que.",
      examples: JSON.stringify(["La femme qui chante est ma mere. (The woman who sings is my mother.)", "Le film que j'ai vu etait super. (The movie that I saw was great.)", "C'est l'ami qui m'a aide. (It's the friend who helped me.)"])
    },
    {
      id: "comparisons", title: "Comparisons", week: 4,
      shortcut: "plus...que (more than), moins...que (less than), aussi...que (as...as). That's it!",
      explanation: "Comparing in French uses three simple patterns: plus + adj + que (more...than), moins + adj + que (less...than), aussi + adj + que (as...as). Exception: 'bon' → 'meilleur' (better), not 'plus bon'. 'Bien' → 'mieux'.",
      examples: JSON.stringify(["Elle est plus grande que moi. (She is taller than me.)", "Ce film est moins interessant que le livre. (This movie is less interesting than the book.)", "Il cuisine aussi bien que sa mere. (He cooks as well as his mother.)"])
    },
    // Week 5
    {
      id: "subjunctive", title: "Subjunctive (Just 5 Triggers)", week: 5,
      shortcut: "Only worry about 5 triggers: il faut que, je veux que, je suis content que, bien que, pour que. That covers 90% of usage.",
      explanation: "The subjunctive sounds scary but you only need it after specific triggers. The 5 most common: il faut que (it's necessary that), vouloir que (to want that), emotion expressions (je suis content que), bien que (although), pour que (so that). Form: ils present stem + -e/-es/-e/-ions/-iez/-ent.",
      examples: JSON.stringify(["Il faut que tu viennes. (You need to come.)", "Je veux que tu sois heureux. (I want you to be happy.)", "Bien qu'il pleuve, je sors. (Although it's raining, I'm going out.)"])
    },
    {
      id: "advanced-negation", title: "Advanced Negation", week: 5,
      shortcut: "Same sandwich, different fillings: ne...jamais (never), ne...rien (nothing), ne...personne (nobody), ne...plus (no more).",
      explanation: "All work like ne...pas but with different meanings. Ne...jamais (never), ne...rien (nothing), ne...personne (nobody), ne...plus (no longer/no more), ne...que (only). They can combine: 'Je ne vois plus jamais personne' (I never see anyone anymore).",
      examples: JSON.stringify(["Je ne mange jamais de viande. (I never eat meat.)", "Il n'y a rien ici. (There's nothing here.)", "Elle ne travaille plus. (She doesn't work anymore.)"])
    },
    {
      id: "idiomatic-expressions", title: "Idiomatic Expressions", week: 5,
      shortcut: "French idioms use body parts a lot: 'avoir le coeur sur la main' (to be generous), 'casser les pieds' (to annoy).",
      explanation: "French is full of colorful idioms. Key ones: avoir le coup de foudre (love at first sight, lit. 'lightning strike'), mettre son grain de sel (give unsolicited advice, lit. 'add one's grain of salt'), donner sa langue au chat (give up guessing, lit. 'give one's tongue to the cat').",
      examples: JSON.stringify(["J'ai eu le coup de foudre. (It was love at first sight.)", "Arrete de mettre ton grain de sel ! (Stop butting in!)", "Je donne ma langue au chat. (I give up — tell me the answer.)"])
    },
    {
      id: "common-pitfalls", title: "Common Pitfalls for English Speakers", week: 5,
      shortcut: "False friends will trick you: 'actuellement' means 'currently' NOT 'actually'. 'Assister' means 'to attend' NOT 'to assist'.",
      explanation: "Watch out for faux amis (false friends): actuellement (currently), assister (to attend), blesser (to injure, not bless), librairie (bookshop, not library), monnaie (change/currency, not money), rester (to stay, not to rest), sympathique (nice, not sympathetic).",
      examples: JSON.stringify(["Actuellement, je travaille a Paris. (Currently, I work in Paris.)", "J'ai assiste a une conference. (I attended a conference.)", "La librairie est fermee. (The bookshop is closed.)"])
    },
    {
      id: "register-formal-informal", title: "Formal vs Informal Register", week: 5,
      shortcut: "Vous = formal/plural. Tu = informal/singular. When in doubt, use vous. Switch to tu when THEY do.",
      explanation: "French has two levels of formality built into the language. Key differences: tu/vous, question formation (inversion is formal), ne...pas vs just 'pas', on vs nous. In practice: use vous with strangers, older people, authority figures. Use tu with friends, peers, children.",
      examples: JSON.stringify(["Pourriez-vous m'aider ? (Could you help me? — formal)", "Tu peux m'aider ? (Can you help me? — informal)", "On va au cinema ? (Shall we go to the cinema? — casual)"])
    },
  ];

  for (const rule of grammarRules) {
    await prisma.grammarRule.upsert({
      where: { id: rule.id },
      update: { title: rule.title, shortcut: rule.shortcut, explanation: rule.explanation, examples: rule.examples, week: rule.week },
      create: rule,
    });
  }

  // Seed immersion tasks (first 7 days as sample)
  const immersionTasks = [
    { week: 1, day: 1, title: "Listen: Coffee Break French Ep. 1", description: "Listen to the first episode of Coffee Break French. Focus on the sounds, not understanding every word.", type: "podcast", resourceUrl: "https://coffeebreaklanguages.com/coffeebreakfrench/", durationMins: 15 },
    { week: 1, day: 1, title: "Speak: Repeat after the podcast", description: "Replay key phrases from the podcast and repeat them out loud 3 times each.", type: "drill", durationMins: 10 },
    { week: 1, day: 1, title: "Read: French menu", description: "Find a French restaurant menu online and try to identify words you know.", type: "exercise", durationMins: 10 },
    { week: 1, day: 2, title: "Listen: InnerFrench Ep. 1", description: "Listen to the beginner episode. Hugo speaks slowly and clearly.", type: "podcast", resourceUrl: "https://innerfrench.com/", durationMins: 15 },
    { week: 1, day: 2, title: "Write: Journal - Introduce yourself", description: "Write 3-5 sentences introducing yourself in French. Use je suis, j'ai, j'aime.", type: "exercise", durationMins: 15 },
    { week: 1, day: 2, title: "Challenge: Change phone language", description: "Change your phone's language to French for 1 hour. Notice how many words you recognize!", type: "drill", durationMins: 60 },
    { week: 1, day: 3, title: "Listen: French music playlist", description: "Listen to a French pop playlist on Spotify. Try to catch words you know.", type: "podcast", durationMins: 20 },
    { week: 1, day: 3, title: "Speak: Count to 20 in French", description: "Practice counting 1-20 out loud until you can do it without hesitation.", type: "drill", durationMins: 10 },
    { week: 1, day: 3, title: "Read: French Instagram posts", description: "Follow 3 French accounts and read their latest posts. Use context clues.", type: "exercise", durationMins: 10 },
    { week: 1, day: 4, title: "Listen: Piece of French (YouTube)", description: "Watch a Piece of French video with subtitles.", type: "youtube", resourceUrl: "https://www.youtube.com/@pieceoffrench", durationMins: 15 },
    { week: 1, day: 4, title: "Write: Journal - Your day", description: "Write about what you did today using simple past tense attempts.", type: "exercise", durationMins: 15 },
    { week: 1, day: 4, title: "Speak: Greetings practice", description: "Practice all greeting phrases from the vocabulary module out loud.", type: "drill", durationMins: 10 },
    { week: 1, day: 5, title: "Listen: Coffee Break French Ep. 2", description: "Continue with Coffee Break French. Can you understand more than episode 1?", type: "podcast", resourceUrl: "https://coffeebreaklanguages.com/coffeebreakfrench/", durationMins: 15 },
    { week: 1, day: 5, title: "Read: French children's book", description: "Find 'Le Petit Prince' chapter 1 online and read it slowly.", type: "exercise", durationMins: 15 },
    { week: 1, day: 5, title: "Speak: Order at a cafe (roleplay)", description: "Practice ordering a coffee and croissant in French out loud.", type: "drill", durationMins: 10 },
    { week: 1, day: 6, title: "Listen: French news (Journal en francais facile)", description: "RFI's easy French news — listen for cognates.", type: "podcast", resourceUrl: "https://savoirs.rfi.fr/en/learn-french/listen/journal-en-francais-facile", durationMins: 10 },
    { week: 1, day: 6, title: "Write: Journal - Weekend plans", description: "Write about your weekend plans using 'je vais + infinitive'.", type: "exercise", durationMins: 15 },
    { week: 1, day: 6, title: "Challenge: Label items in your home", description: "Put sticky notes with French names on 10 household items.", type: "drill", durationMins: 15 },
    { week: 1, day: 7, title: "Review: Weekly recap", description: "Review all vocabulary, phrases, and grammar from Week 1.", type: "exercise", durationMins: 20 },
    { week: 1, day: 7, title: "Listen: Re-listen to favorite episode", description: "Re-listen to whichever podcast you enjoyed most. Notice how much more you understand!", type: "podcast", durationMins: 15 },
    { week: 1, day: 7, title: "Speak: Record yourself introducing yourself", description: "Record a 30-second introduction in French. Save it — you'll compare it in week 5!", type: "drill", durationMins: 10 },
  ];

  for (let i = 0; i < immersionTasks.length; i++) {
    const task = immersionTasks[i];
    await prisma.immersionTask.upsert({
      where: { id: `immersion-${task.week}-${task.day}-${i}` },
      update: task,
      create: { id: `immersion-${task.week}-${task.day}-${i}`, ...task },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
