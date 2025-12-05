import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App";

hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <StrictMode>
    <App />
  </StrictMode>,
  {
    onRecoverableError: (error) => {
      console.error(1111, error?.message);
    },
    onCaughtError: (error) => {
      console.error(2222, error?.message);
    },
    onUncaughtError: (error) => {
      console.error(3333, error?.message);
    },
  }
);
