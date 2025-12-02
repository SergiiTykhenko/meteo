import { useCallback, useState, useEffect } from "react";
import { RMap } from "maplibre-react-components";
import { Box, CircularProgress, Backdrop } from "@mui/material";
import Details from "./components/Details/Details";
import Filters, { type VisibleLayers } from "./components/Filters/Filters";
import "maplibre-gl/dist/maplibre-gl.css";
import useMeteoData from "./hooks/useMeteoData";
import type { AirSigmetProperties, ISigmetProperties } from "@/schemas";
import Layers from "./components/Layers/Layers";

const initialCenter: [number, number] = [0, 0];

export interface SelectedLayer {
  type: "isigmet" | "airsigmet";
  details: ISigmetProperties | AirSigmetProperties;
}

const Map = () => {
  const { meteoData, isLoading, handleFiltersChange } = useMeteoData();
  const [selectedLayer, setSelectedLayer] = useState<SelectedLayer | null>(
    null
  );

  useEffect(() => {
    if (selectedLayer) {
      const { rawSigmet } = selectedLayer.details;

      if (
        !meteoData.isigmet.some(
          ({ properties }) => properties.rawSigmet === rawSigmet
        ) &&
        !meteoData.airsigmet.some(
          ({ properties }) => properties.rawSigmet === rawSigmet
        )
      ) {
        setSelectedLayer(null);
      }
    }
  }, [meteoData]);

  const [visibleLayers, setVisibleLayers] = useState<VisibleLayers>({
    sigmet: true,
    airsigmet: true,
  });

  const handleIsigmetLayerClick = useCallback(
    (layer: ISigmetProperties) =>
      setSelectedLayer({
        type: "isigmet",
        details: layer,
      }),
    []
  );

  const handleAirsigmetLayerClick = useCallback(
    (layer: AirSigmetProperties) =>
      setSelectedLayer({
        type: "airsigmet",
        details: layer,
      }),
    []
  );

  return (
    <Box width="100vw" height="100vh">
      <RMap
        id="map"
        initialCenter={initialCenter}
        initialZoom={2}
        style={{ height: "100vh", width: "100vw" }}
        mapStyle="https://api.maptiler.com/maps/streets-v4/style.json?key=fGPVSnKP4eX6fvaBY8La"
      >
        <Layers
          meteoData={meteoData}
          visibleLayers={visibleLayers}
          handleIsigmetLayerClick={handleIsigmetLayerClick}
          handleAirsigmetLayerClick={handleAirsigmetLayerClick}
        />
      </RMap>
      <Filters
        visibleLayers={visibleLayers}
        setVisibleLayers={setVisibleLayers}
        onFiltersChange={handleFiltersChange}
      />
      {selectedLayer && (
        <Details
          type={selectedLayer.type}
          details={selectedLayer.details}
          onClose={() => setSelectedLayer(null)}
        />
      )}
      <Backdrop sx={{ color: "#fff", zIndex: "10" }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default Map;
