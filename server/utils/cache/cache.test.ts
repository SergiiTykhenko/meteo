import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCachedData, cacheData } from "./index";
import type { ISigmetFeatureWithId } from "../../schemas";

const mockISigmetFeatures: ISigmetFeatureWithId[] = [
  {
    id: "1",
    type: "Feature" as const,
    properties: { rawSigmet: "SIGMET-1" },
    geometry: {
      type: "Polygon" as const,
      coordinates: [[[0, 0]]],
    },
  },
];

const { mockGet, mockSet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSet: vi.fn(),
}));

vi.mock("redis", () => ({
  createClient: vi.fn(() => ({
    get: mockGet,
    set: mockSet,
    connect: vi.fn(),
  })),
}));

describe("cache utility", () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockSet.mockClear();
  });

  it("should call redis get method with the correct key", async () => {
    const key = "test-key";

    await getCachedData(key);

    expect(mockGet).toHaveBeenCalledWith(key);
  });

  it("should call set method with the correct key and data", async () => {
    const key = "test-key";

    await cacheData(key, mockISigmetFeatures);

    expect(mockSet).toHaveBeenCalledWith(
      key,
      JSON.stringify(mockISigmetFeatures),
      {
        expiration: { type: "EX", value: 3600 },
      }
    );
  });
});
