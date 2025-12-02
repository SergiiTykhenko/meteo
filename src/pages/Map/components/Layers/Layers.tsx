import type { AirSigmetFeature, ISigmetFeature } from "@/schemas";
import { Layer } from "./components/Layer/Layer";
import type { VisibleLayers } from "../Filters/Filters";
import type { MeteoData } from "../../hooks/useMeteoData";

interface Props {
  meteoData: MeteoData;
  visibleLayers: VisibleLayers;
  selectedLayerId: string | undefined;
  handleIsigmetLayerClick: (layer: ISigmetFeature) => void;
  handleAirsigmetLayerClick: (layer: AirSigmetFeature) => void;
}

const Layers = ({
  meteoData,
  visibleLayers,
  selectedLayerId,
  handleIsigmetLayerClick,
  handleAirsigmetLayerClick,
}: Props) => (
  <>
    {meteoData.isigmet.map((layer) => (
      <Layer
        key={layer.id}
        layer={layer}
        type="isigmet"
        isVisible={visibleLayers.isigmet}
        isSelected={selectedLayerId === layer.id}
        handleClick={handleIsigmetLayerClick}
      />
    ))}
    {meteoData.airsigmet.map((layer) => (
      <Layer
        key={layer.id}
        layer={layer}
        type="airsigmet"
        isVisible={visibleLayers.airsigmet}
        isSelected={selectedLayerId === layer.id}
        handleClick={handleAirsigmetLayerClick}
      />
    ))}
  </>
);

export default Layers;
