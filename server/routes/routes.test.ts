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

const createApp = async () => {
  const routesModule = await import("./routes.js");
  const router = routesModule.default;

  const app = express();
  app.use("/api", router);

  return app;
};

describe("API routes", () => {
  beforeEach(async () => {
    vi.resetAllMocks();

    const cacheModule = await import("../utils/cache.js");
    if (typeof cacheModule.resetCache === "function") {
      cacheModule.resetCache();
    }
  });

  it("returns data for /api/isigmet", async () => {
    const features = [{ properties: { rawSigmet: "SIGMET-1" } }];

    (globalThis as unknown as { fetch: unknown }).fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ features }),
      });

    const app = await createApp();

    const res = await request(app).get("/api/isigmet");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject(features[0]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns data for /api/airsigmet", async () => {
    const features = [{ properties: { rawSigmet: "AIRSIGMET-1" } }];

    (globalThis as unknown as { fetch: unknown }).fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ features }),
      });

    const app = await createApp();

    const res = await request(app).get("/api/airsigmet");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject(features[0]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when upstream fetch fails", async () => {
    (globalThis as unknown as { fetch: unknown }).fetch = vi
      .fn()
      .mockResolvedValue({
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
      { properties: { rawSigmet: "SIGMET-1" } },
      { properties: { rawSigmet: "SIGMET-2" } },
    ];

    (globalThis as unknown as { fetch: unknown }).fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ features }),
      });

    const app = await createApp();

    const res = await request(app).get(
      "/api/isigmet?levelFrom=12000&levelTo=24000"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
