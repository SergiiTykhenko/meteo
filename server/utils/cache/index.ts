import { createClient } from "redis";
import type {
  AirSigmetFeatureWithId,
  ISigmetFeatureWithId,
} from "../../schemas";

// 1 hour
const CACHE_TTL = 60 * 60;

const redisClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

await redisClient.connect();

export const getCachedData = async (cacheKey: string) => {
  const data = await redisClient.get(cacheKey);

  return data
    ? (JSON.parse(data) as (ISigmetFeatureWithId | AirSigmetFeatureWithId)[])
    : null;
};

export const cacheData = (
  cacheKey: string,
  data: (ISigmetFeatureWithId | AirSigmetFeatureWithId)[]
) =>
  redisClient.set(cacheKey, JSON.stringify(data), {
    expiration: { type: "EX", value: CACHE_TTL },
  });
