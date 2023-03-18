const MULTIPLIER = 100;

export function randomLetterPosition(borrowedLetters: (string | null)[]) {
  const possiblePositions = borrowedLetters
    .map((letter, index) => (notNull(letter) ? null : index))
    .filter(notNull);
  const randomIndex = Math.floor(Math.random() * possiblePositions.length);
  return possiblePositions[randomIndex];
}

export function getWordScore(borrowedLetters: (string | null)[]) {
  return (
    MULTIPLIER * borrowedLetters.filter((letter) => letter === null).length
  );
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

export function isUnicodeLetter(char: string) {
  return char.match(/^\p{L}$/u);
}

export function rangeInclusive(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}
function notNull<T>(value: T | null): value is T {
  return value !== null;
}
