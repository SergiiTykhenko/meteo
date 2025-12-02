import type { MeteoData } from "./components/Map/hooks/useMeteoData";
import { AirSigmetFeaturesSchema, ISigmetFeaturesSchema } from "../../schemas";

const fetchIsigmetData = async (filtersQuery?: string) => {
  const response = await fetch(`/isigmet${filtersQuery ? filtersQuery : ""}`);
  const { data } = await response.json();
  const result = ISigmetFeaturesSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid ISigmet data");
  }

  return result.data;
};

const fetchAirsigmetData = async (filtersQuery?: string) => {
  const response = await fetch(`/airsigmet${filtersQuery ? filtersQuery : ""}`);
  const { data } = await response.json();
  const result = AirSigmetFeaturesSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid AirSigmet data");
  }

  return result.data;
};

const fetchMeteoData = async (
  _prevState?: MeteoData,
  filtersQuery?: string
) => {
  try {
    const [isigmetData, airsigmetData] = await Promise.all([
      fetchIsigmetData(filtersQuery),
      fetchAirsigmetData(filtersQuery),
    ]);

    return {
      isigmet: isigmetData,
      airsigmet: airsigmetData,
    };
  } catch {
    return {
      isigmet: [],
      airsigmet: [],
    };
  }
};

export { fetchMeteoData };
