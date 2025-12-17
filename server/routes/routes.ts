import { Router, type Request } from "express";
import _ from "lodash";
import { addHours } from "date-fns";
import { generateHashId } from "./utils";
import {
  AirSigmetFeatureCollection,
  ISigmetFeatureCollection,
  schemaByType,
} from "../schemas";
import { cacheData, getCachedData } from "../utils/cache";

const router = Router();

type DataType = "isigmet" | "airsigmet";

interface Filters {
  level?: string;
  hoursChange?: string;
}

const getUrl = (type: DataType, filters: Filters) => {
  let query = filters.level ? `&level=${filters.level}` : "";
  query += filters.hoursChange
    ? `&date=${addHours(new Date(), Number(filters.hoursChange)).toISOString()}`
    : "";

  return `https://aviationweather.gov/api/data/${type}?format=geojson${
    query ? `&${query}` : ""
  }`;
};

const fetchWeatherFeatures = async (type: DataType, filters: Filters = {}) => {
  const cacheKey = JSON.stringify({ type, ...filters });

  const cachedData = await getCachedData(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const url = getUrl(type, filters);

  const data = await fetch(url);

  if (!data.ok) {
    throw new Error(`Failed to fetch ${type} data`);
  }

  const json = await data.json();

  const parsedData = schemaByType[type].safeParse(json);

  if (!parsedData.success) {
    throw new Error(`Invalid ${type} data: ${parsedData.error.message}`);
  }

  const { features } = parsedData.data;

  const featuresWithId = features.map((feature) => ({
    ...feature,
    id: generateHashId(feature.properties),
  }));

  cacheData(cacheKey, featuresWithId);

  return featuresWithId;
};

const getLevelsToFetch = (levelFrom: string, levelTo: string) => {
  const levelStep = 6000;
  const levelRange = Number(levelTo) - Number(levelFrom);
  const numberOfLevelsToFetch = Math.ceil(levelRange / 6000);

  return _.times(numberOfLevelsToFetch).reduce<number[]>((acc, _, i) => {
    if (i === 0) {
      return [Number(levelFrom) + levelStep / 2];
    }

    if (i === numberOfLevelsToFetch - 1) {
      return [...acc, Number(levelTo) - levelStep / 2];
    }

    return [...acc, acc[i - 1] + levelStep];
  }, []);
};

export const fetchMeteoData = async (
  type: DataType,
  queryParams: Request["query"] = {}
): Promise<ISigmetFeatureCollection | AirSigmetFeatureCollection> => {
  const { levelFrom, levelTo, hoursChange } = queryParams;

  const filters: Filters = hoursChange
    ? { hoursChange: hoursChange.toString() }
    : {};

  let features;

  if (levelFrom && levelTo) {
    const levelsToFetch = getLevelsToFetch(
      levelFrom.toString(),
      levelTo.toString()
    );

    if (!levelsToFetch.length) {
      throw new Error("Invalid level range");
    }

    const data = await Promise.all(
      levelsToFetch.map((level) =>
        fetchWeatherFeatures(type, { ...filters, level: level.toString() })
      )
    );

    const flattenedData = data.flat();
    features = _.uniqBy(flattenedData, "id");
  } else {
    const data = await fetchWeatherFeatures(type, filters);
    features = _.uniqBy(data, "id");
  }

  return { type: "FeatureCollection", features };
};

// routes
router.get("/isigmet", async (req, res) => {
  try {
    const data = await fetchMeteoData("isigmet", req.query);

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/airsigmet", async (req, res) => {
  try {
    const data = await fetchMeteoData("airsigmet", req.query);

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
