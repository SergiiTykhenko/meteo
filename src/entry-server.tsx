import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { fetchWeatherFeatures } from "../server/routes/routes";

const isigmetFeatures = await fetchWeatherFeatures("isigmet");
const airsigmetFeatures = await fetchWeatherFeatures("airsigmet");

const meteoData = {
  isigmet: { type: "FeatureCollection", features: isigmetFeatures },
  airsigmet: { type: "FeatureCollection", features: airsigmetFeatures },
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
