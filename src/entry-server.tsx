import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { fetchMeteoData } from "../server/routes/routes";

const isigmetMeteoData = await fetchMeteoData("isigmet");
const airsigmetMeteoData = await fetchMeteoData("airsigmet");

const meteoData = {
  isigmet: isigmetMeteoData,
  airsigmet: airsigmetMeteoData,
};

const initialData = {
  meteoData,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function render(_url: string) {
  const html = renderToString(
    <StrictMode>
      <App initialData={initialData} />
    </StrictMode>
  );

  return {
    html,
    head: `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
      initialData
    )}</script>`,
  };
}
