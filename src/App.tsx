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

  const timer = useRef<number | null>(null);

  const start =
    state.type === "start"
      ? () => {
          dispatch({ type: "start" });

          timer.current = window.setInterval(() => {
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
    (state.type !== "start" && state.remainingSeconds < 30) ||
    (state.type === "question" &&
      state.kind === "answering" &&
      state.remainingQuestionSeconds < 10);

  const title =
    state.type === "start"
      ? "Welcome"
      : state.type === "end"
      ? "Finished"
      : `Question ${state.level}`;

  return {
    state: {
      type: state.type,
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

function App() {
  const { state, actions } = useGameState();

  return (
    <div className="App">
      <h1>Kelime Oyunu Helper</h1>
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

      {state.type === "start" && (
        <ul className="rules">
          <li>
            Welcome to Kelime Oyunu Helper, a simple tool to manage your own
            contest
          </li>
          <li>You need to come up with your own questions and hints</li>
          <li>
            This tool only helps with borrowing random letters, keeping time and
            score
          </li>
          <li>
            The contest has 4, 5, 6, 7, 8, 9 and 10 letter questions, two of
            each
          </li>
          <li>
            Maximum score you can gain is 9800, remaining time is used to break
            ties
          </li>
          <li>The game has a timer of 5 minutes</li>
          <li>Press Start button to start the game and the timer will start</li>
          <li>
            When the game starts, you may ask the question and provide hints as
            you find necessary
          </li>
          <li>
            The contestant can borrow a letter at the expense of the total score
            they can gain from the word
          </li>
          <li>
            If they borrow a letter, you can press a key from the keyboard to
            fill it
          </li>
          <li>
            To answer, they need to press the Answer button or the Space key
          </li>
          <li>
            Once they start answering, a 30 second timer will start during which
            they make a guess
          </li>
          <li>
            The timer will turn red once you have less than 10 seconds remaining
          </li>
          <li>
            They can make as many guesses as they want, they lose only if the
            timer runs out
          </li>
          <li>
            They may or may not borrow a letter now, this is left to your
            discretion
          </li>
          <li>If they guess correctly, you should press the Correct button</li>
          <li>
            Upon a correct guess, they will gain 100 points per letter they
            didn't borrow
          </li>
          <li>
            If they don't guess in time, they will lose 100 points per letter
            they didn't borrow
          </li>
          <li>
            After they guess correctly or they don't, you can fill in the
            remaining letters
          </li>
          <li>To progress to the next question, press the Next button</li>
          <li>
            After the last 10 letter question, or after the timer runs out, the
            game will end with the final score
          </li>
          <li>
            You can press the Reset button to reset the game at any point to
            start over
          </li>
          <li>Have fun!</li>
        </ul>
      )}

      <p className="read-the-docs">
        <a href="https://www.teve2.com.tr/programlar/guncel/kelime-oyunu">
          Kelime Oyunu
        </a>{" "}
        by <a href="https://www.teve2.com.tr">teve2</a>,{" "}
        <a href="https://github.com/frontsideair/kelime-oyunu">
          Kelime Oyunu Helper
        </a>{" "}
        by <a href="https://6nok.org">Fatih Altinok</a>
      </p>
    </div>
  );
}

export default App;
