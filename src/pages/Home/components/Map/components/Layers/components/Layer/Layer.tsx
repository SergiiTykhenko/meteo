import { useCallback, useState } from "react";
import { RLayer, RSource } from "maplibre-react-components";
import type { Feature } from "maplibre-gl";
import { getLayerPaint, getLinePaint } from "./utils";
import type {
  ISigmetFeature,
  AirSigmetFeature,
} from "../../../../../../../../schemas";

interface Props {
  layer: ISigmetFeature | AirSigmetFeature;
  id: number;
  type: "isigmet" | "airsigmet";
  isVisible: boolean;
  handleClick: (layer: Feature["properties"]) => void;
}

export const Layer = ({ layer, id, type, isVisible, handleClick }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleLayerClick = useCallback(
    () => handleClick(layer.properties),
    [handleClick, layer.properties]
  );

  return (
    <>
      <RSource id={`${type}-source-${id}`} type="geojson" data={layer} />
      <RLayer
        id={`${type}-layer-${id}`}
        source={`${type}-source-${id}`}
        type="fill"
        paint={getLayerPaint(type, isHovered, isVisible)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={isVisible ? handleLayerClick : undefined}
      />
      <RLayer
        id={`${type}-layer-line-${id}`}
        source={`${type}-source-${id}`}
        type="line"
        paint={getLinePaint(type, isVisible)}
      />
    </>
  );
};
