const MULTIPLIER = 100;

export function randomLetterPosition(borrowedLetters: (string | null)[]) {
  const possiblePositions = borrowedLetters
    .map((l, index) => (notNull(l) ? null : index))
    .filter(notNull);
  const randomIndex = Math.floor(Math.random() * possiblePositions.length);
  return possiblePositions[randomIndex];
}

export function getWordScore(
  index: number,
  borrowedLetters: (string | null)[]
) {
  return (
    MULTIPLIER * (numLetters(index) - borrowedLetters.filter(notNull).length)
  );
}

export function numLetters(n: number) {
  if (n === 1 || n == 2) {
    return 4;
  } else if (n === 3 || n === 4) {
    return 5;
  } else if (n === 5 || n === 6) {
    return 6;
  } else if (n === 7 || n === 8) {
    return 7;
  } else if (n === 9 || n === 10) {
    return 8;
  } else if (n === 11 || n === 12) {
    return 9;
  } else if (n === 13 || n === 14) {
    return 10;
  } else {
    throw new Error("invalid turn");
  }
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

export function isLetter(char: string) {
  return char.match(/^\p{L}$/u);
}

export function notNull<T>(value: T | null): value is T {
  return value !== null;
}
