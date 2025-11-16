/**
 * Word-to-Image Mapper for Local Wordimages
 *
 * Maps word text to corresponding image files in /components/wordimages/
 * Provides fast lookup for common AAC vocabulary with local symbols.
 */

// Direct filename mapping for all 60 available wordimages
const WORDIMAGE_MAP: Record<string, string> = {
  // Letters
  'a': 'A.png',

  // Accessibility & Identity
  'adhd': 'ADHD.png',
  'anxiety': 'Anxiety.png',
  'autism': 'Autism.png',
  'gay': 'Gay.png',

  // Emotions
  'angry': 'Angry.png',
  'bored': 'Bored.png',
  'disgusted': 'Disgusted.png',
  'excited': 'Excited.png',
  'happy': 'Happy.png',
  'hurt': 'Hurt.png',
  'sad': 'Sad.png',
  'scared': 'Scared.png',
  'shocked': 'Shocked.png',
  'tired': 'Tired.png',
  'upset': 'Upset.png',

  // Actions
  'drink': 'Drink.png',
  'eat': 'Eat.png',
  'exercise': 'Exercise.png',
  'craft': 'Craft.png',
  'read': 'Read.png',
  'go': 'Go.png',
  'stop': 'Stop.png',
  'help': 'Help.png',

  // Pronouns
  'i': 'I-Me.png',
  'me': 'I-Me.png',
  'you': 'You.png',
  'he': 'He-Him.png',
  'him': 'He-Him.png',
  'she': 'She-Her.png',
  'her': 'She-Her.png',
  'they': 'They-Them.png',
  'them': 'They-Them.png',

  // Greetings & Social
  'hi': 'Hi.png',
  'hello': 'Hi.png',
  'bye': 'Bye.png',
  'goodbye': 'Bye.png',
  'love': 'Love.png',
  'yes': 'Yes.png',
  'no': 'No.png',

  // Directions
  'up': 'Up.png',
  'down': 'Down.png',
  'left': 'Left.png',
  'right': 'Right.png',
  'close': 'Close.png',
  'far': 'Far.png',

  // Needs & Places
  'food': 'Food.png',
  'home': 'Home.png',
  'hospital': 'Hospital.png',
  'phone': 'Phone.png',

  // Animals & Nature
  'bird': 'Bird.png',
  'cat': 'Cat.png',
  'dog': 'Dog.png',
  'pet': 'Pet.png',
  'plant': 'Plant.png',
  'tree': 'Tree.png',

  // Groups & Relationships
  'family': 'Family.png',
  'group': 'Group.png',

  // Other
  'to': 'To.png',
  'want': 'Want.png',
  'what': 'What.png',
  'no idea': 'No-Idea.png',
  'treat': 'Treat.png',
  'technica': 'Technica.png',
  'yippie': 'Yippie.png',
  'yay': 'Yippie.png',
  'what way': 'What-Way.png',
};

// Phrase-to-image mappings for multi-word phrases
const PHRASE_TO_IMAGE_MAP: Record<string, string> = {
  'i want': 'Want.png',
  'i need': 'Want.png',
  'no idea': 'No-Idea.png',
  'dont know': 'No-Idea.png',
  "don't know": 'No-Idea.png',
  'what way': 'What-Way.png',
  'which way': 'What-Way.png',
};

/**
 * Get the local wordimage path for a given text
 * @param text - The word or phrase to look up
 * @returns The relative path to the image, or undefined if not found
 */
export function getWordImagePath(text: string): string | undefined {
  if (!text) return undefined;

  const normalized = text.toLowerCase().trim();

  // First check for exact phrase matches
  if (PHRASE_TO_IMAGE_MAP[normalized]) {
    return `/wordimages/${PHRASE_TO_IMAGE_MAP[normalized]}`;
  }

  // Then check for single word matches
  if (WORDIMAGE_MAP[normalized]) {
    return `/wordimages/${WORDIMAGE_MAP[normalized]}`;
  }

  // Try to find a match in the first word of multi-word phrases
  const firstWord = normalized.split(' ')[0];
  if (WORDIMAGE_MAP[firstWord]) {
    return `/wordimages/${WORDIMAGE_MAP[firstWord]}`;
  }

  // Try to find a match in the last word (e.g., "I want" -> "want")
  const lastWord = normalized.split(' ').slice(-1)[0];
  if (WORDIMAGE_MAP[lastWord]) {
    return `/wordimages/${WORDIMAGE_MAP[lastWord]}`;
  }

  return undefined;
}

/**
 * Check if a wordimage exists for the given text
 */
export function hasWordImage(text: string): boolean {
  return getWordImagePath(text) !== undefined;
}

/**
 * Get all available words that have wordimages
 */
export function getAvailableWords(): string[] {
  return Object.keys(WORDIMAGE_MAP);
}

/**
 * Get all available phrases that have wordimages
 */
export function getAvailablePhrases(): string[] {
  return Object.keys(PHRASE_TO_IMAGE_MAP);
}

/**
 * Search for words that partially match the given text
 * Useful for suggesting alternatives when an exact match isn't found
 */
export function findSimilarWords(text: string, limit: number = 5): string[] {
  if (!text) return [];

  const normalized = text.toLowerCase().trim();
  const allWords = Object.keys(WORDIMAGE_MAP);

  // Find words that start with the text
  const startsWith = allWords.filter(word => word.startsWith(normalized));

  // Find words that contain the text
  const contains = allWords.filter(
    word => word.includes(normalized) && !word.startsWith(normalized)
  );

  return [...startsWith, ...contains].slice(0, limit);
}

/**
 * Get category-based word suggestions
 */
export const CATEGORY_WORDS: Record<string, string[]> = {
  emotions: ['happy', 'sad', 'angry', 'excited', 'bored', 'scared', 'disgusted', 'upset', 'shocked', 'tired', 'hurt'],
  actions: ['eat', 'drink', 'read', 'exercise', 'craft', 'go', 'stop', 'help'],
  pronouns: ['i', 'me', 'you', 'he', 'him', 'she', 'her', 'they', 'them'],
  social: ['hi', 'hello', 'bye', 'goodbye', 'love', 'yes', 'no'],
  directions: ['up', 'down', 'left', 'right', 'close', 'far'],
  needs: ['food', 'home', 'hospital', 'phone'],
  animals: ['bird', 'cat', 'dog', 'pet'],
  nature: ['plant', 'tree'],
  people: ['family', 'group'],
  questions: ['what', 'no idea'],
};

/**
 * Get all words for a specific category
 */
export function getWordsForCategory(category: string): string[] {
  return CATEGORY_WORDS[category.toLowerCase()] || [];
}
