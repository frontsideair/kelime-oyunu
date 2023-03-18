import useStateMachine from "@cassiozen/usestatemachine";
import produce from "immer";
import {
  formatTime,
  getWordScore,
  isUnicodeLetter,
  randomLetterPosition,
  rangeInclusive,
} from "./utils";

const SECOND_IN_MS = 1000;

type Context = Readonly<{
  remainingSeconds: number;
  level: number;
  levels: {
    remainingSeconds: number;
    letters: (string | null)[];
  }[];
}>;

const initialContext: Context = Object.freeze({
  remainingSeconds: 5 * 60,
  level: 0,
  levels: rangeInclusive(4, 10)
    .flatMap((n) => [n, n])
    .map((numLetters) => ({
      remainingSeconds: 30,
      letters: Array(numLetters).fill(null),
    })),
});

function currentLevel(context: Context) {
  return context.levels[context.level];
}

function totalScore(context: Context) {
  return context.levels.slice(0, context.level).reduce((total, level) => {
    const wordScore = getWordScore(level.letters);
    return total + (level.remainingSeconds === 0 ? -wordScore : wordScore);
  }, 0);
}

type KeydownParams = {
  handleSpace?: () => void;
  handleLetter: (letter: string) => void;
};

function subscribeToKeydown({ handleSpace, handleLetter }: KeydownParams) {
  const abortController = new AbortController();

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === " ") {
        handleSpace?.();
      } else if (isUnicodeLetter(event.key)) {
        handleLetter(event.key.toLocaleUpperCase());
      }
    },
    { signal: abortController.signal }
  );

  return abortController.abort.bind(abortController);
}

export function useGameState() {
  const [state, send] = useStateMachine({
    context: initialContext,
    initial: "start",
    states: {
      start: {
        on: { START: "question" },
        effect({ setContext }) {
          setContext(() => initialContext);
        },
      },
      question: {
        on: {
          ANSWER: "answering",
          END: "end",
          RESET: "start",
          BORROW: "question",
        },
        effect({ context, setContext, send, event }) {
          switch (event.type) {
            case "BORROW": {
              setContext(
                produce((context) => {
                  const { letters } = currentLevel(context);
                  const position = randomLetterPosition(letters);
                  letters[position] = "";
                })
              );
              break;
            }
            case "NEXT": {
              setContext(
                produce((context) => {
                  context.level += 1;
                })
              );
              if (context.level + 1 === context.levels.length) {
                send("END");
                return;
              }
              break;
            }
          }

          const interval = window.setInterval(() => {
            console.log("tick");
            setContext(
              produce((context) => {
                if (context.remainingSeconds === 0) {
                  currentLevel(context).remainingSeconds = 0;
                  context.level += 1;
                  send("END");
                } else {
                  context.remainingSeconds -= 1;
                }
              })
            );
          }, SECOND_IN_MS);
          function handleSpace() {
            send("ANSWER");
          }
          function handleLetter(letter: string) {
            setContext(
              produce((context) => {
                const { letters } = currentLevel(context);
                const index = letters.findIndex((letter) => letter === "");
                letters[index] = letter;
              })
            );
          }
          const clearKeydown = subscribeToKeydown({
            handleSpace,
            handleLetter,
          });
          return () => {
            clearInterval(interval);
            clearKeydown();
          };
        },
      },
      answering: {
        on: {
          CORRECT: "revealed",
          TIMEOUT: "revealed",
          RESET: "start",
          BORROW: "answering",
        },
        effect({ setContext, send, event }) {
          if (event.type === "BORROW") {
            setContext(
              produce((context) => {
                const { letters } = currentLevel(context);
                const position = randomLetterPosition(letters);
                letters[position] = "";
              })
            );
          }

          const interval = window.setInterval(() => {
            console.log("tock");
            setContext(
              produce((context) => {
                if (currentLevel(context).remainingSeconds === 0) {
                  send("TIMEOUT");
                } else {
                  currentLevel(context).remainingSeconds -= 1;
                }
              })
            );
          }, SECOND_IN_MS);
          function handleLetter(letter: string) {
            setContext(
              produce((context) => {
                const { letters } = currentLevel(context);
                const index = letters.findIndex((letter) => letter === "");
                letters[index] = letter;
              })
            );
          }
          const clearKeydown = subscribeToKeydown({ handleLetter });
          return () => {
            clearInterval(interval);
            clearKeydown();
          };
        },
      },
      revealed: {
        on: { NEXT: "question", RESET: "start" },
        effect({ setContext }) {
          function handleLetter(letter: string) {
            setContext(
              produce((context) => {
                const { letters } = currentLevel(context);
                const index = letters.findIndex((letter) => letter === "");
                if (index !== -1) {
                  letters[index] = letter;
                }
              })
            );
          }
          return subscribeToKeydown({ handleLetter });
        },
      },
      end: {
        on: { RESET: "start" },
      },
    },
  });

  function maybeSend(event: typeof state.nextEvents[number], predicate = true) {
    if (state.nextEvents.includes(event) && predicate) {
      return () => send(event);
    } else {
      return null;
    }
  }

  const start = maybeSend("START");

  const borrow = maybeSend(
    "BORROW",
    currentLevel(state.context)?.letters.some((letter) => letter === null)
  );

  const answer = maybeSend("ANSWER");

  const correct = maybeSend("CORRECT");

  const next = maybeSend("NEXT");

  const reset = maybeSend("RESET");

  const letters = ["question", "answering", "revealed"].includes(state.value)
    ? currentLevel(state.context)?.letters
    : null;

  const wordScore = ["question", "answering", "revealed"].includes(state.value)
    ? getWordScore(currentLevel(state.context)?.letters)
    : null;

  const score = state.value !== "start" ? totalScore(state.context) : null;

  const remainingTime =
    state.value !== "start" ? formatTime(state.context.remainingSeconds) : null;

  const criticalTime =
    state.context.remainingSeconds < 30 ||
    (state.value === "answering" &&
      (currentLevel(state.context)?.remainingSeconds ?? Infinity) < 10);

  const title =
    state.value === "start"
      ? "Welcome"
      : state.value === "end"
      ? "Finished"
      : `Question ${state.context.level + 1}`;

  return {
    state: {
      type: state.value,
      letters,
      wordScore,
      score,
      remainingTime,
      criticalTime,
      title,
    },
    actions: { start, borrow, answer, correct, next, reset },
  };
}
