import { RLayer, RSource } from "maplibre-react-components";
import type { FeatureCollection, Feature } from "@/schemas";
import { layerPaint, linePaint } from "./consts";

export type LayerType = "isigmet" | "airsigmet";

interface Props {
  featuresCollection: FeatureCollection;
  type: LayerType;
  handleClick: (layer: Feature) => void;
}

export const Layer = ({ featuresCollection, type, handleClick }: Props) => (
  <>
    <RSource id={`source-${type}`} type="geojson" data={featuresCollection} />
    <RLayer
      id={`layer-${type}`}
      source={`source-${type}`}
      type="fill"
      paint={layerPaint[type]}
      onClick={(e) => {
        const feature = e.features?.[0];

        if (feature) {
          handleClick(feature as unknown as Feature);
        }
      }}
    />
    <RLayer
      id={`layer-line-${type}`}
      source={`source-${type}`}
      type="line"
      paint={linePaint[type]}
    />
  </>
);
