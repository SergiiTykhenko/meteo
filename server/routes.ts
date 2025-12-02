import { Router, type Request } from "express";
import _ from "lodash";
import { addHours } from "date-fns";
import {
  schemaByType,
  type ISigmetFeature,
  type AirSigmetFeature,
} from "./schemas.ts";

interface Cache {
  initialisedAt: number | null;
  dataByUrl: Record<string, ISigmetFeature | AirSigmetFeature>;
}

const cache: Cache = {
  initialisedAt: null,
  dataByUrl: {},
};

// 1 hour
const CACHE_TTL = 1000 * 60 * 60;

const router = Router();

type DataType = "isigmet" | "airsigmet";

interface Filters {
  level?: string;
  hoursChange?: string;
}

const getCachedData = (cacheKey: string) => {
  if (cache.initialisedAt) {
    const isCacheExpired = Date.now() - cache.initialisedAt > CACHE_TTL;

    if (isCacheExpired) {
      cache.initialisedAt = null;
      cache.dataByUrl = {};
    } else if (cache.dataByUrl[cacheKey]) {
      return cache.dataByUrl[cacheKey];
    }
  }
};

const getUrl = (type: DataType, filters: Filters) => {
  let query = filters.level ? `&level=${filters.level}` : "";
  query += filters.hoursChange
    ? `&date=${addHours(new Date(), Number(filters.hoursChange)).toISOString()}`
    : "";

  return `https://aviationweather.gov/api/data/${type}?format=geojson${
    query ? `&${query}` : ""
  }`;
};

const fetchWeatherData = async (type: DataType, filters: Filters) => {
  const cacheKey = JSON.stringify({ type, ...filters });

  const cachedData = getCachedData(cacheKey);

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

  const features = json.features;

  if (!cache.initialisedAt) {
    cache.initialisedAt = Date.now();
  }

  cache.dataByUrl[cacheKey] = features;

  return features;
};

const getLevelsToFetch = (levelFrom: string, levelTo: string) => {
  const levelStep = 6000;
  const levelRange = Number(levelTo) - Number(levelFrom);
  const numberOfLevelsToFetch = Math.ceil(levelRange / 6000);

  return _.times(numberOfLevelsToFetch).reduce((acc, _, i) => {
    if (i === 0) {
      return [Number(levelFrom) + levelStep / 2];
    }

    if (i === numberOfLevelsToFetch - 1) {
      return [...acc, Number(levelTo) - levelStep / 2];
    }

    return [...acc, acc[i - 1] + levelStep];
  }, []);
};

const getMeteoData = async (req: Request, type: "isigmet" | "airsigmet") => {
  const { levelFrom, levelTo, hoursChange } = req.query;

  const filters: Filters = hoursChange ? { hoursChange } : {};

  let responseData;

  if (levelFrom && levelTo) {
    const levelsToFetch = getLevelsToFetch(levelFrom, levelTo);

    if (!levelsToFetch.length) {
      throw new Error("Invalid level range");
    }

    const data = await Promise.all(
      levelsToFetch.map((level) =>
        fetchWeatherData(type, { ...filters, level: level.toString() })
      )
    );

    const flattenedData = data.flat();
    responseData = _.uniqBy(flattenedData, "properties.rawSigmet");
  } else {
    responseData = await fetchWeatherData(type, filters);
  }

  return responseData;
};

// routes
router.get("/isigmet", async (req, res) => {
  try {
    const data = await getMeteoData(req, "isigmet");

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/airsigmet", async (req, res) => {
  try {
    const data = await getMeteoData(req, "airsigmet");

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
