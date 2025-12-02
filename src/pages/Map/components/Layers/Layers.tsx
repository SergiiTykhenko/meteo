import { Fragment } from "react/jsx-runtime";
import type { AirSigmetProperties, ISigmetProperties } from "@/schemas";
import { Layer } from "./components/Layer/Layer";
import type { VisibleLayers } from "../Filters/Filters";
import type { MeteoData } from "../../hooks/useMeteoData";

interface Props {
  meteoData: MeteoData;
  visibleLayers: VisibleLayers;
  handleIsigmetLayerClick: (layer: ISigmetProperties) => void;
  handleAirsigmetLayerClick: (layer: AirSigmetProperties) => void;
}

const Layers = ({
  meteoData,
  visibleLayers,
  handleIsigmetLayerClick,
  handleAirsigmetLayerClick,
}: Props) => (
  <>
    {meteoData.isigmet.map((layer, i) => (
      <Fragment key={i}>
        <Layer
          layer={layer}
          id={i}
          type="isigmet"
          isVisible={visibleLayers.sigmet}
          handleClick={handleIsigmetLayerClick}
        />
      </Fragment>
    ))}
    {meteoData.airsigmet.map((layer, i) => (
      <Fragment key={i}>
        <Layer
          layer={layer}
          id={i}
          type="airsigmet"
          isVisible={visibleLayers.airsigmet}
          handleClick={handleAirsigmetLayerClick}
        />
      </Fragment>
    ))}
    ;
  </>
);

export default Layers;
