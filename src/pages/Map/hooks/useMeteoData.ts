import {
  useCallback,
  useEffect,
  startTransition,
  useMemo,
  useActionState,
} from "react";
import type { FiltersType } from "../components/Filters/Filters";
import {
  ISigmetFeaturesSchema,
  AirSigmetFeaturesSchema,
  type ISigmetFeatures,
  type AirSigmetFeatures,
} from "@/schemas";
import useSnackbars from "@/hooks/useSnackbars/useSnackbars";

export interface MeteoData {
  isigmet: ISigmetFeatures;
  airsigmet: AirSigmetFeatures;
}

const fetchIsigmetData = async (filtersQuery?: string) => {
  const response = await fetch(
    `/api/isigmet${filtersQuery ? filtersQuery : ""}`
  );
  const { data } = await response.json();
  const result = ISigmetFeaturesSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid ISigmet data");
  }

  return result.data;
};

const fetchAirsigmetData = async (filtersQuery?: string) => {
  const response = await fetch(
    `/api/airsigmet${filtersQuery ? filtersQuery : ""}`
  );
  const { data } = await response.json();
  const result = AirSigmetFeaturesSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid AirSigmet data");
  }

  return result.data;
};

const useMeteoData = () => {
  const addSnackbar = useSnackbars();

  const fetchData = useCallback(
    async (_prevState: MeteoData, filtersQuery?: string) => {
      try {
        const [isigmetData, airsigmetData] = await Promise.all([
          fetchIsigmetData(filtersQuery),
          fetchAirsigmetData(filtersQuery),
        ]);

        return {
          isigmet: isigmetData,
          airsigmet: airsigmetData,
        };
      } catch (error) {
        addSnackbar({
          message: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });

        return {
          isigmet: [],
          airsigmet: [],
        };
      }
    },
    [addSnackbar]
  );

  const [meteoData, handleFetchData, isLoading] = useActionState<
    MeteoData,
    string
  >(fetchData, { isigmet: [], airsigmet: [] });

  useEffect(() => startTransition(() => handleFetchData("")), []);

  const handleFiltersChange = useCallback(
    (filters: Partial<FiltersType>) => {
      const filtersQuery = filters
        ? `?${new URLSearchParams(
            filters as Record<string, string>
          ).toString()}`
        : "";

      startTransition(() => handleFetchData(filtersQuery));
    },
    [handleFetchData]
  );

  return useMemo(
    () => ({ meteoData, isLoading, handleFiltersChange }),
    [meteoData, isLoading, handleFiltersChange]
  );
};

export default useMeteoData;
