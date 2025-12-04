import { Router, type Request } from "express";
import _ from "lodash";
import { addHours } from "date-fns";
import { generateHashId } from "./utils";
import { schemaByType } from "../schemas";
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

const getMeteoData = async (req: Request, type: "isigmet" | "airsigmet") => {
  const { levelFrom, levelTo, hoursChange } = req.query;

  const filters: Filters = hoursChange
    ? { hoursChange: hoursChange.toString() }
    : {};

  let responseData;

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
        fetchWeatherData(type, { ...filters, level: level.toString() })
      )
    );

    const flattenedData = data.flat();
    responseData = _.uniqBy(flattenedData, "id");
  } else {
    const data = await fetchWeatherData(type, filters);
    responseData = _.uniqBy(data, "id");
  }

  return responseData;
};

// routes
router.get("/isigmet", async (req, res) => {
  try {
    const data = await getMeteoData(req, "isigmet");

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/airsigmet", async (req, res) => {
  try {
    const data = await getMeteoData(req, "airsigmet");

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
