import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App";

const initialData = window.__INITIAL_DATA__ ?? null;

hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <StrictMode>
    <App initialData={initialData} />
  </StrictMode>
);
