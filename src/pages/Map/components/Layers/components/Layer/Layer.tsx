import { useCallback, useState } from "react";
import { RLayer, RSource } from "maplibre-react-components";
import type { ISigmetFeature, AirSigmetFeature } from "@/schemas";
import { getLayerPaint, getLinePaint } from "./utils";

export type LayerType = "isigmet" | "airsigmet";

interface Props {
  layer: ISigmetFeature | AirSigmetFeature;
  type: LayerType;
  isVisible: boolean;
  isSelected: boolean;
  handleClick: (layer: ISigmetFeature | AirSigmetFeature) => void;
}

export const Layer = ({
  layer,
  type,
  isVisible,
  isSelected,
  handleClick,
}: Props) => {
  const { id } = layer;
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleLayerClick = useCallback(
    () => handleClick(layer),
    [handleClick, layer]
  );

  return (
    <>
      <RSource id={`${type}-source-${id}`} type="geojson" data={layer} />
      <RLayer
        id={`${type}-layer-${id}`}
        source={`${type}-source-${id}`}
        type="fill"
        paint={getLayerPaint(type, isHovered, isSelected, isVisible)}
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
