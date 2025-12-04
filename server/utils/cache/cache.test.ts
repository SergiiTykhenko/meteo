import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCachedData, cacheData } from "./cache.js";
import type { AirSigmetFeature, ISigmetFeature } from "../../schemas.js";

const mockISigmetFeature = {
  type: "Feature" as const,
  properties: { rawSigmet: "SIGMET-1" },
  geometry: {
    type: "Polygon" as const,
    coordinates: [[[0, 0]]],
  },
} as ISigmetFeature;

const mockAirSigmetFeature = {
  type: "Feature" as const,
  properties: { rawSigmet: "AIRSIGMET-1" },
  geometry: {
    type: "Polygon" as const,
    coordinates: [[[0, 0]]],
  },
} as AirSigmetFeature;

describe("cache utility", () => {
  beforeEach(() => {
    const originalDateNow = Date.now;
    const futureTime = originalDateNow() + 2 * 60 * 60 * 1000; // 2 hours in future
    Date.now = vi.fn(() => futureTime);

    getCachedData("expire-key");

    Date.now = originalDateNow;
  });

  it("should return null when cache is not initialized", () => {
    const result = getCachedData("test-key");
    expect(result).toBeNull();
  });

  it("should return null when cache key does not exist", async () => {
    cacheData("existing-key", [mockISigmetFeature]);

    const result = getCachedData("non-existent-key");
    expect(result).toBeNull();
  });

  it("should return cached data when it exists and is not expired", () => {
    const cacheKey = "test-key";
    const testData = [mockISigmetFeature];

    getCachedData("init-key");

    cacheData(cacheKey, testData);

    const result = getCachedData(cacheKey);

    expect(result).toEqual(testData);
  });

  it("should cache and retrieve ISigmetFeature data", () => {
    const cacheKey = "isigmet-key";
    const testData = [mockISigmetFeature];

    getCachedData("init-key");
    cacheData(cacheKey, testData);

    const result = getCachedData(cacheKey);
    expect(result).toEqual(testData);
  });

  it("should cache and retrieve AirSigmetFeature data", () => {
    const cacheKey = "airsigmet-key";
    const testData = [mockAirSigmetFeature];

    getCachedData("init-key");
    cacheData(cacheKey, testData);

    const result = getCachedData(cacheKey);
    expect(result).toEqual(testData);
  });

  it("should handle multiple cache keys independently", () => {
    const key1 = "key-1";
    const key2 = "key-2";
    const data1 = [mockISigmetFeature];
    const data2 = [mockAirSigmetFeature];

    getCachedData("init-key");
    cacheData(key1, data1);
    cacheData(key2, data2);

    expect(getCachedData(key1)).toEqual(data1);
    expect(getCachedData(key2)).toEqual(data2);
  });

  it("should overwrite existing cache entry", () => {
    const cacheKey = "test-key";
    const initialData = [mockISigmetFeature];
    const updatedData = [mockAirSigmetFeature];

    getCachedData("init-key");
    cacheData(cacheKey, initialData);
    expect(getCachedData(cacheKey)).toEqual(initialData);

    cacheData(cacheKey, updatedData);
    expect(getCachedData(cacheKey)).toEqual(updatedData);
  });

  it("should clear cache when expired", () => {
    vi.useFakeTimers();

    const cacheKey = "expired-test-key-unique-2";
    const testData = [mockISigmetFeature];

    vi.setSystemTime(1000000000);

    getCachedData("init-expire-key-unique-2");
    cacheData(cacheKey, testData);

    expect(getCachedData(cacheKey)).toEqual(testData);

    vi.advanceTimersByTime(2 * 60 * 60 * 1000);

    const result = getCachedData(cacheKey);

    expect(result).toBeNull();

    const result2 = getCachedData("new-key-after-expiry-2");
    expect(result2).toBeNull();

    vi.useRealTimers();
  });

  it("should handle empty arrays in cache", () => {
    const cacheKey = "empty-key";
    const emptyData: (typeof mockISigmetFeature)[] = [];

    getCachedData("init-key");
    cacheData(cacheKey, emptyData);

    const result = getCachedData(cacheKey);
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle large arrays in cache", () => {
    const cacheKey = "large-key";
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      ...mockISigmetFeature,
      properties: { rawSigmet: `SIGMET-${i}` },
    }));

    getCachedData("init-key");
    cacheData(cacheKey, largeData);

    const result = getCachedData(cacheKey);
    expect(result).toHaveLength(100);
    expect(result).toEqual(largeData);
  });

  it("should initialize cache timestamp on first getCachedData call after expiry", () => {
    const result1 = getCachedData("init-key-2");
    expect(result1).toBeNull();

    const result2 = getCachedData("any-key-2");
    expect(result2).toBeNull();

    cacheData("any-key-2", [mockISigmetFeature]);
    const result3 = getCachedData("any-key-2");
    expect(result3).toEqual([mockISigmetFeature]);
  });
});
