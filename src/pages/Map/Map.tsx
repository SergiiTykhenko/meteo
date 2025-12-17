import { useCallback, useState, useEffect } from "react";
import { RMap } from "maplibre-react-components";
import { Box, CircularProgress, Backdrop } from "@mui/material";
import type { AirSigmetFeature, Properties, ISigmetFeature } from "@/schemas";
import Details from "./components/Details/Details";
import Filters, { type VisibleLayers } from "./components/Filters/Filters";
import useMeteoData, { type MeteoData } from "./hooks/useMeteoData";
import Layers from "./components/Layers/Layers";
import { mapStyleUrl, initialCenter } from "./consts";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LayerType } from "./components/Layers/components/Layer/Layer";

interface LayerDetails {
  id: string;
  type: LayerType;
  properties: Properties;
}

interface Props {
  initialMeteoData: MeteoData;
}

const Map = ({ initialMeteoData }: Props) => {
  const { meteoData, isLoading, handleFiltersChange } =
    useMeteoData(initialMeteoData);
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
        meteoData?.isigmet.features.some(({ id }) => id === selectedLayer.id) ||
        meteoData?.airsigmet.features.some(({ id }) => id === selectedLayer.id);

      if (!isSelectedLayerInMeteoData) {
        setSelectedLayer(null);
      }
    }
  }, [meteoData]);

  const handleIsigmetLayerClick = useCallback(
    (feature: ISigmetFeature) =>
      setSelectedLayer({
        id: feature.id,
        type: "isigmet",
        properties: feature.properties,
      }),
    []
  );

  const handleAirsigmetLayerClick = useCallback(
    (feature: AirSigmetFeature) =>
      setSelectedLayer({
        id: feature.id,
        type: "airsigmet",
        properties: feature.properties,
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
        mapStyle={mapStyleUrl}
      >
        {meteoData && (
          <Layers
            meteoData={meteoData}
            visibleLayers={visibleLayers}
            handleIsigmetLayerClick={handleIsigmetLayerClick}
            handleAirsigmetLayerClick={handleAirsigmetLayerClick}
          />
        )}
      </RMap>
      <Filters
        visibleLayers={visibleLayers}
        setVisibleLayers={handleSetVisibleLayers}
        onFiltersChange={handleFiltersChange}
      />
      {selectedLayer && (
        <Details
          type={selectedLayer.type}
          properties={selectedLayer.properties}
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
