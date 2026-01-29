// Simplify text to 8th-grade reading level
export const simplifyText = (text: string): string => {
  // Basic simplification rules - in production, this would use the AI
  const simplifications: Record<string, string> = {
    "utilize": "use",
    "commence": "start",
    "terminate": "end",
    "subsequent": "next",
    "prior to": "before",
    "in lieu of": "instead of",
    "pursuant to": "following",
    "notwithstanding": "despite",
    "aforementioned": "mentioned above",
    "heretofore": "until now",
  };

  let simplified = text;
  for (const [complex, simple] of Object.entries(simplifications)) {
    simplified = simplified.replace(new RegExp(complex, "gi"), simple);
  }

  return simplified;
};

// Calculate approximate reading level (Flesch-Kincaid)
export const calculateReadingLevel = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch-Kincaid Grade Level formula
  const gradeLevel = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;

  return Math.max(0, Math.min(18, Math.round(gradeLevel)));
};

const countSyllables = (word: string): number => {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
};
