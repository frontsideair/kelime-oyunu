import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import App from "./App";

test("loads and displays heading", async () => {
  render(<App />);

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    /kelime oyunu helper/i
  );
});

test("game can be started", async () => {
  render(<App />);

  await userEvent.click(screen.getByRole("button", { name: /start/i }));

  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    /question 1/i
  );
});
