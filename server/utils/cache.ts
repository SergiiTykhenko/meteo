import type { ISigmetFeature, AirSigmetFeature } from "../schemas.js";

interface Cache {
  initialisedAt: number | null;
  dataByUrl: Record<string, ISigmetFeature[] | AirSigmetFeature[]>;
}

const cache: Cache = {
  initialisedAt: null,
  dataByUrl: {},
};

// 1 hour
const CACHE_TTL = 1000 * 60 * 60;

const getIsCacheExpired = () => {
  if (!cache.initialisedAt) {
    return true;
  }

  return Date.now() - cache.initialisedAt > CACHE_TTL;
};

export const getCachedData = (cacheKey: string) => {
  if (!cache.initialisedAt) {
    return null;
  }

  if (getIsCacheExpired()) {
    cache.initialisedAt = null;
    cache.dataByUrl = {};

    return null;
  }

  if (cache.dataByUrl[cacheKey]) {
    return cache.dataByUrl[cacheKey];
  }

  return null;
};

export const cacheData = (
  cacheKey: string,
  data: ISigmetFeature[] | AirSigmetFeature[]
) => {
  if (!cache.initialisedAt || getIsCacheExpired()) {
    cache.initialisedAt = Date.now();
  }

  cache.dataByUrl[cacheKey] = data;
};
