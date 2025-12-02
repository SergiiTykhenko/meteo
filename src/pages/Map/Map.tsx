import { useCallback, useState, useEffect } from "react";
import { RMap } from "maplibre-react-components";
import { Box, CircularProgress, Backdrop } from "@mui/material";
import type { AirSigmetFeature, ISigmetFeature } from "@/schemas";
import Details, { type LayerDetails } from "./components/Details/Details";
import Filters, { type VisibleLayers } from "./components/Filters/Filters";
import useMeteoData from "./hooks/useMeteoData";
import Layers from "./components/Layers/Layers";
import "maplibre-gl/dist/maplibre-gl.css";

const initialCenter: [number, number] = [0, 0];

const Map = () => {
  const { meteoData, isLoading, handleFiltersChange } = useMeteoData();
  const [selectedLayer, setSelectedLayer] = useState<LayerDetails | null>(null);

  const [visibleLayers, setVisibleLayers] = useState<VisibleLayers>({
    isigmet: true,
    airsigmet: true,
  });

  const handleSetVisibleLayers = useCallback(
    (nextVisibleLayers: VisibleLayers) => {
      if (selectedLayer && !nextVisibleLayers[selectedLayer.type]) {
        setSelectedLayer(null);
      }
      setVisibleLayers(nextVisibleLayers);
    },
    [selectedLayer]
  );

  useEffect(() => {
    if (selectedLayer) {
      const isSelectedLayerInMeteoData =
        meteoData.isigmet.some(({ id }) => id === selectedLayer.id) ||
        meteoData.airsigmet.some(({ id }) => id === selectedLayer.id);

      if (!isSelectedLayerInMeteoData) {
        setSelectedLayer(null);
      }
    }
  }, [meteoData]);

  const handleIsigmetLayerClick = useCallback(
    (layer: ISigmetFeature) =>
      setSelectedLayer({
        id: layer.id,
        type: "isigmet",
        details: layer.properties,
      }),
    []
  );

  const handleAirsigmetLayerClick = useCallback(
    (layer: AirSigmetFeature) =>
      setSelectedLayer({
        id: layer.id,
        type: "airsigmet",
        details: layer.properties,
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
          selectedLayerId={selectedLayer?.id}
          handleIsigmetLayerClick={handleIsigmetLayerClick}
          handleAirsigmetLayerClick={handleAirsigmetLayerClick}
        />
      </RMap>
      <Filters
        visibleLayers={visibleLayers}
        setVisibleLayers={handleSetVisibleLayers}
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
