import type { AirSigmetFeature, ISigmetFeature } from "@/schemas";
import { Layer } from "./components/Layer/Layer";
import type { VisibleLayers } from "../Filters/Filters";
import type { MeteoData } from "../../hooks/useMeteoData";

interface Props {
  meteoData: MeteoData;
  visibleLayers: VisibleLayers;
  handleIsigmetLayerClick: (layer: ISigmetFeature) => void;
  handleAirsigmetLayerClick: (layer: AirSigmetFeature) => void;
}

const Layers = ({
  meteoData,
  visibleLayers,
  handleIsigmetLayerClick,
  handleAirsigmetLayerClick,
}: Props) => (
  <>
    {visibleLayers.isigmet && (
      <Layer
        featuresCollection={meteoData.isigmet}
        type="isigmet"
        handleClick={handleIsigmetLayerClick}
      />
    )}
    {visibleLayers.airsigmet && (
      <Layer
        featuresCollection={meteoData.airsigmet}
        type="airsigmet"
        handleClick={handleAirsigmetLayerClick}
      />
    )}
  </>
);

export default Layers;
