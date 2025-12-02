const layerPaint = {
  isigmet: {
    "fill-color": "red",
    "fill-opacity": 0.5,
  },
  airsigmet: {
    "fill-color": "blue",
    "fill-opacity": 0.5,
  },
};

const hoverPaint = {
  isigmet: {
    ...layerPaint.isigmet,
    "fill-opacity": 0.3,
  },
  airsigmet: {
    ...layerPaint.airsigmet,
    "fill-opacity": 0.3,
  },
};

const linePaint = {
  isigmet: {
    "line-color": "red",
    "line-width": 2,
  },
  airsigmet: {
    "line-color": "blue",
    "line-width": 2,
  },
};

export const getLayerPaint = (
  type: "isigmet" | "airsigmet",
  isHovered: boolean,
  isSelected: boolean,
  isVisible: boolean
) => {
  if (!isVisible) {
    return {
      "fill-opacity": 0,
    };
  }
  if (isHovered || isSelected) {
    return hoverPaint[type];
  }
  return layerPaint[type];
};

export const getLinePaint = (
  type: "isigmet" | "airsigmet",
  isVisible: boolean
) => {
  if (!isVisible) {
    return {
      "line-opacity": 0,
    };
  }
  return linePaint[type];
};
