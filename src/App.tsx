import { useEffect, useReducer, useRef } from "react";
import "./App.css";
import Button from "./Button";
import reducer from "./reducer";
import {
  formatTime,
  getWordScore,
  isLetter,
  notNull,
  numLetters,
  randomLetterPosition,
} from "./utils";

function useGameState() {
  const [state, dispatch] = useReducer(reducer, { type: "start" });

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (event.key === " ") {
        dispatch({ type: "answer" });
      }
      if (isLetter(event.key)) {
        dispatch({ type: "fillLetter", letter: event.key.toLocaleUpperCase() });
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch]);

  const timer = useRef<NodeJS.Timer | null>(null);

  const start =
    state.type === "start"
      ? () => {
          dispatch({ type: "start" });

          timer.current = setInterval(() => {
            console.log("tick");
            dispatch({ type: "tick" });
          }, 1000);
        }
      : null;

  const borrow =
    state.type === "question" &&
    state.kind !== "answered" &&
    state.borrowedLetters.filter(notNull).length < numLetters(state.level)
      ? () => {
          const letterPosition = randomLetterPosition(state.borrowedLetters);
          dispatch({ type: "borrow", letterPosition });
        }
      : null;

  const answer =
    state.type === "question" && state.kind === "question"
      ? () => {
          dispatch({ type: "answer" });
        }
      : null;

  const correct =
    state.type === "question" && state.kind === "answering"
      ? () => {
          dispatch({ type: "correct" });
        }
      : null;

  const next =
    state.type === "question" && state.kind === "answered"
      ? () => {
          dispatch({ type: "next" });
        }
      : null;

  function reset() {
    if (timer.current) {
      clearInterval(timer.current);
    }
    dispatch({ type: "reset" });
  }

  const letters = state.type === "question" ? state.borrowedLetters : null;

  const wordScore =
    state.type === "question" && state.kind !== "answered"
      ? getWordScore(state.level, state.borrowedLetters)
      : null;

  const score = state.type !== "start" ? state.score : null;

  const remainingTime =
    state.type !== "start" ? formatTime(state.remainingSeconds) : null;

  const criticalTime =
    (state.type !== "start" && state.remainingSeconds < 60) ||
    (state.type === "question" &&
      state.kind === "answering" &&
      state.remainingQuestionSeconds < 10);

  const title =
    state.type === "start"
      ? "Press Start"
      : state.type === "end"
      ? "Finished"
      : `Question ${state.level}`;

  return {
    state: { letters, wordScore, score, remainingTime, criticalTime, title },
    actions: { start, borrow, answer, correct, next, reset },
  };
}

function App() {
  const { state, actions } = useGameState();

  return (
    <div className="App">
      <h1>Kelime Oyunu</h1>
      <div className="card">
        <Button onClick={actions.start}>Start</Button>
        <Button onClick={actions.borrow}>Borrow</Button>
        <Button onClick={actions.answer}>Answer</Button>
        <Button onClick={actions.correct}>Correct</Button>
        <Button onClick={actions.next}>Next</Button>
        <Button onClick={actions.reset}>Reset</Button>
      </div>
      <div className="card game">
        <h2>{state.title}</h2>
        <div className="score">{state.score}</div>
        {state.letters && (
          <>
            <div className="word-score">{state.wordScore}</div>
            <div className="word">
              {state.letters.map((letter, index) => (
                <div
                  key={index}
                  className={notNull(letter) ? "letter borrowed" : "letter"}
                >
                  {letter}
                </div>
              ))}
            </div>
          </>
        )}
        <div className={state.criticalTime ? "time critical" : "time"}>
          {state.remainingTime}
        </div>
      </div>
      <p className="read-the-docs">teve2</p>
    </div>
  );
}

export default App;
