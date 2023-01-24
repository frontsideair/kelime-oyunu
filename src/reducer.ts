/*
- 4, 5, 6, 7, 8, 9, 10 letter words, two of each
- when i ask a question, the timer will start (5 minutes)
- when the contestant presses the button to answer, the timer will stop
- a second timer will start with 30 seconds to go, it will start ticking at last n seconds
- if they borrow a letter, they will lose 100 points
- if they guess correctly, they will gain 100 points per letter
- if they guess incorrectly, they will lose 100 points per remaining letter
- they cannot borrow a letter after they press the button, unless i allow them
- their score will be the sum of the points they gained and the time they had left

- start
- show question (starts timer)
- tick (decrements timer)
- borrow letter (pick next random letter position, subtract points)
- answer (stop timer, starts second timer, cannot borrow letter)
- correct answer (add points)
- timeout (subtract points)
- next question (restarts timer)
- global timeout (end game)
- last question (end game)
*/

import { getWordScore, notNull, numLetters } from "./utils";

type State =
  | {
      type: "start";
    }
  | {
      type: "question";
      kind: "question" | "answering" | "answered";
      level: number;
      score: number;
      remainingSeconds: number;
      remainingQuestionSeconds: number;
      borrowedLetters: (string | null)[];
    }
  | {
      type: "end";
      score: number;
      remainingSeconds: number;
    };

type Action =
  | { type: "start" }
  | { type: "tick" }
  | { type: "borrow"; letterPosition: number }
  | { type: "answer" }
  | { type: "correct" }
  | { type: "next" }
  | { type: "reset" }
  | { type: "fillLetter"; letter: string };

export default function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return {
        type: "question",
        kind: "question",
        level: 1,
        score: 0,
        remainingSeconds: 5 * 60,
        remainingQuestionSeconds: 30,
        borrowedLetters: Array.from({ length: numLetters(1) }, () => null),
      };
    case "tick": {
      switch (state.type) {
        case "question": {
          switch (state.kind) {
            case "question": {
              if (state.remainingSeconds === 0) {
                return {
                  type: "end",
                  score:
                    state.score -
                    getWordScore(state.level, state.borrowedLetters),
                  remainingSeconds: 0,
                };
              } else {
                return {
                  ...state,
                  remainingSeconds: state.remainingSeconds - 1,
                };
              }
            }
            case "answering": {
              if (state.remainingQuestionSeconds === 0) {
                return {
                  ...state,
                  kind: "answered",
                  score:
                    state.score -
                    getWordScore(state.level, state.borrowedLetters),
                };
              } else {
                return {
                  ...state,
                  remainingQuestionSeconds: state.remainingQuestionSeconds - 1,
                };
              }
            }
            default:
              return state;
          }
        }
        default:
          return state;
      }
    }
    case "borrow": {
      if (state.type === "question" && state.kind !== "answered") {
        const borrowedLetters = state.borrowedLetters.slice();
        borrowedLetters[action.letterPosition] = "";
        return {
          ...state,
          borrowedLetters,
        };
      } else {
        return state;
      }
    }
    case "answer": {
      if (state.type === "question" && state.kind === "question") {
        return {
          ...state,
          kind: "answering",
        };
      } else {
        return state;
      }
    }
    case "correct": {
      if (state.type === "question" && state.kind === "answering") {
        return {
          ...state,
          kind: "answered",
          score: state.score + getWordScore(state.level, state.borrowedLetters),
          borrowedLetters: state.borrowedLetters.map((letter) =>
            notNull(letter) ? letter : ""
          ),
        };
      } else {
        return state;
      }
    }
    case "next": {
      if (state.type === "question" && state.kind === "answered") {
        if (state.level === 14) {
          return {
            type: "end",
            score: state.score,
            remainingSeconds: state.remainingSeconds,
          };
        } else {
          const level = state.level + 1;
          return {
            ...state,
            kind: "question",
            level,
            remainingQuestionSeconds: 30,
            borrowedLetters: Array.from(
              { length: numLetters(level) },
              () => null
            ),
          };
        }
      } else {
        return state;
      }
    }
    case "reset": {
      return {
        type: "start",
      };
    }
    case "fillLetter": {
      if (state.type === "question") {
        const borrowedLetters = state.borrowedLetters.slice();
        const index = borrowedLetters.findIndex((letter) => letter === "");
        if (index !== -1) {
          borrowedLetters[index] = action.letter;
        }
        return {
          ...state,
          borrowedLetters,
        };
      } else {
        return state;
      }
    }
  }
}
