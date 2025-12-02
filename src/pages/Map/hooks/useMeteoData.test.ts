import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import useMeteoData from "./useMeteoData";
import type { ISigmetFeatures, AirSigmetFeatures } from "@/schemas";

// Mock useSnackbars
const mockAddSnackbar = vi.fn();
vi.mock("@/hooks/useSnackbars/useSnackbars", () => ({
  __esModule: true,
  default: () => mockAddSnackbar,
}));

// Mock schemas
vi.mock("@/schemas", async () => {
  const actual = await vi.importActual("@/schemas");
  return {
    ...actual,
    ISigmetFeaturesSchema: {
      safeParse: (data: unknown) => ({ success: true, data }),
    },
    AirSigmetFeaturesSchema: {
      safeParse: (data: unknown) => ({ success: true, data }),
    },
  };
});

describe("useMeteoData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn() as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch data on mount", async () => {
    const mockIsigmetData: ISigmetFeatures = [
      {
        type: "Feature",
        properties: { rawSigmet: "SIGMET-1" },
        geometry: {
          type: "Polygon",
          coordinates: [[[0, 0]]],
        },
      },
    ];

    const mockAirsigmetData: AirSigmetFeatures = [
      {
        type: "Feature",
        properties: { rawSigmet: "AIRSIGMET-1" },
        geometry: {
          type: "Polygon",
          coordinates: [[[0, 0]]],
        },
      },
    ];

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockIsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAirsigmetData }),
      });

    const { result } = renderHook(() => useMeteoData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.meteoData.isigmet).toEqual(mockIsigmetData);
    expect(result.current.meteoData.airsigmet).toEqual(mockAirsigmetData);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/isigmet");
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/airsigmet");
  });

  it("should handle filters change correctly", async () => {
    const mockIsigmetData: ISigmetFeatures = [];
    const mockAirsigmetData: AirSigmetFeatures = [];

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockIsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAirsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockIsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAirsigmetData }),
      });

    const { result } = renderHook(() => useMeteoData());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Change filters
    act(() => {
      result.current.handleFiltersChange({
        levelFrom: "12000",
        levelTo: "24000",
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/isigmet?levelFrom=12000&levelTo=24000"
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/airsigmet?levelFrom=12000&levelTo=24000"
    );
  });

  it("should handle hoursChange filter", async () => {
    const mockIsigmetData: ISigmetFeatures = [];
    const mockAirsigmetData: AirSigmetFeatures = [];

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockIsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAirsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockIsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAirsigmetData }),
      });

    const { result } = renderHook(() => useMeteoData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleFiltersChange({
        hoursChange: "6",
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const fetchCalls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls;
    const isigmetCalls = fetchCalls.filter((call) =>
      call[0]?.toString().includes("/api/isigmet")
    );
    const airsigmetCalls = fetchCalls.filter((call) =>
      call[0]?.toString().includes("/api/airsigmet")
    );

    // Check the last call (after filter change)
    expect(isigmetCalls[isigmetCalls.length - 1]?.[0]).toContain(
      "hoursChange=6"
    );
    expect(airsigmetCalls[airsigmetCalls.length - 1]?.[0]).toContain(
      "hoursChange=6"
    );
  });

  it("should handle fetch errors and show snackbar", async () => {
    const errorMessage = "Failed to fetch data";

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    const { result } = renderHook(() => useMeteoData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.meteoData.isigmet).toEqual([]);
    expect(result.current.meteoData.airsigmet).toEqual([]);
    expect(mockAddSnackbar).toHaveBeenCalledWith({
      message: errorMessage,
      type: "error",
    });
  });

  it("should handle invalid data schema and show snackbar", async () => {
    // Temporarily override the schema mock to fail validation
    const schemasModule = await import("@/schemas");
    const originalSafeParse = schemasModule.ISigmetFeaturesSchema.safeParse;

    schemasModule.ISigmetFeaturesSchema.safeParse = vi
      .fn()
      .mockReturnValueOnce({
        success: false,
        error: {
          message: "Invalid ISigmet data",
          issues: [],
        },
      } as never);

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { invalid: "data" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    const { result } = renderHook(() => useMeteoData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.meteoData.isigmet).toEqual([]);
    expect(result.current.meteoData.airsigmet).toEqual([]);
    expect(mockAddSnackbar).toHaveBeenCalledWith({
      message: "Invalid ISigmet data",
      type: "error",
    });

    // Restore original
    schemasModule.ISigmetFeaturesSchema.safeParse = originalSafeParse;
  });

  it("should handle multiple filter parameters", async () => {
    const mockIsigmetData: ISigmetFeatures = [];
    const mockAirsigmetData: AirSigmetFeatures = [];

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockIsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAirsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockIsigmetData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAirsigmetData }),
      });

    const { result } = renderHook(() => useMeteoData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleFiltersChange({
        levelFrom: "12000",
        levelTo: "24000",
        hoursChange: "3",
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const fetchCalls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls;
    const isigmetCalls = fetchCalls.filter((call) =>
      call[0]?.toString().includes("/api/isigmet")
    );

    // Check the last call (after filter change)
    const lastIsigmetCall = isigmetCalls[isigmetCalls.length - 1]?.[0];
    expect(lastIsigmetCall).toContain("levelFrom=12000");
    expect(lastIsigmetCall).toContain("levelTo=24000");
    expect(lastIsigmetCall).toContain("hoursChange=3");
  });

  it("should return empty arrays on initial render", () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useMeteoData());

    expect(result.current.meteoData.isigmet).toEqual([]);
    expect(result.current.meteoData.airsigmet).toEqual([]);
  });
});
