import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../schemas", () => {
  const schema = {
    safeParse: (input: unknown) => ({ success: true, data: input }),
  };

  return {
    schemaByType: {
      isigmet: schema,
      airsigmet: schema,
    },
  };
});

vi.mock("../utils/cache", () => ({
  getCachedData: vi.fn().mockResolvedValue(null),
  cacheData: vi.fn().mockResolvedValue("OK"),
}));

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

const createApp = async () => {
  const routesModule = await import("./routes");
  const router = routesModule.default;

  const app = express();
  app.use("/api", router);

  return app;
};

describe("API routes", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    mockFetch.mockClear();

    const cacheModule = await import("../utils/cache");
    vi.mocked(cacheModule.getCachedData).mockResolvedValue(null);
    vi.mocked(cacheModule.cacheData).mockResolvedValue("OK");
  });

  it("returns data for /api/isigmet", async () => {
    const featuresCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { rawSigmet: "SIGMET-1" },
          geometry: {
            type: "Polygon",
            coordinates: [[[0, 0]]],
          },
        },
      ],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(featuresCollection),
    });

    const app = await createApp();

    const res = await request(app).get("/api/isigmet");

    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe("FeatureCollection");
    expect(res.body.data.features[0]).toMatchObject({
      type: "Feature",
      properties: featuresCollection.features[0].properties,
      geometry: featuresCollection.features[0].geometry,
    });
    expect(res.body.data.features[0]).toHaveProperty("id");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("returns data for /api/airsigmet", async () => {
    const featuresCollection = {
      features: [
        {
          type: "Feature",
          properties: { rawSigmet: "AIRSIGMET-1" },
          geometry: {
            type: "Polygon",
            coordinates: [[[0, 0]]],
          },
        },
      ],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(featuresCollection),
    });

    const app = await createApp();

    const res = await request(app).get("/api/airsigmet");

    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe("FeatureCollection");
    expect(res.body.data.features[0]).toMatchObject({
      type: "Feature",
      properties: featuresCollection.features[0].properties,
      geometry: featuresCollection.features[0].geometry,
    });
    expect(res.body.data.features[0]).toHaveProperty("id");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when upstream fetch fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: vi.fn(),
    });

    const app = await createApp();

    const res = await request(app).get("/api/isigmet");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
  });

  it("fetches multiple levels when levelFrom and levelTo are provided", async () => {
    const features = [
      {
        type: "Feature",
        properties: { rawSigmet: "SIGMET-1" },
        geometry: {
          type: "Polygon",
          coordinates: [[[0, 0]]],
        },
      },
      {
        type: "Feature",
        properties: { rawSigmet: "SIGMET-2" },
        geometry: {
          type: "Polygon",
          coordinates: [[[1, 1]]],
        },
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        type: "FeatureCollection",
        features,
      }),
    });

    const app = await createApp();

    const res = await request(app).get(
      "/api/isigmet?levelFrom=12000&levelTo=24000"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.type).toBe("FeatureCollection");
    expect(Array.isArray(res.body.data.features)).toBe(true);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
