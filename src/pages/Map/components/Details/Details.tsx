import { Box, Typography, IconButton } from "@mui/material";
import { red, blue, grey } from "@mui/material/colors";
import formatDateTime from "@/utils/formatDateTime";
import type { AirSigmetProperties, ISigmetProperties } from "@/schemas";
import type { LayerType } from "../Layers/components/Layer/Layer";

interface Props {
  type: LayerType;
  properties: ISigmetProperties | AirSigmetProperties;
  onClose: () => void;
}

const getAltitude = (properties: ISigmetProperties | AirSigmetProperties) => {
  if ("altitudeHi1" in properties) {
    return properties.altitudeHi1;
  }

  if ("top" in properties) {
    return properties.top;
  }

  if ("base" in properties) {
    return properties.base;
  }

  return null;
};

const Details = ({ type, properties, onClose }: Props) => {
  const { rawSigmet, hazard, validTimeFrom, validTimeTo } = properties;
  const color = type === "isigmet" ? red[500] : blue[500];
  const altitude = getAltitude(properties);

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={0}
      py={2}
      sx={{
        position: "fixed",
        bottom: 30,
        left: 30,
        zIndex: 100,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "white",
        maxHeight: "calc(min(80vh,500px))",
        width: "300px",
      }}
    >
      <IconButton
        size="small"
        sx={{ position: "absolute", top: 1, right: 3, width: 24, height: 24 }}
        onClick={onClose}
      >
        x
      </IconButton>
      <Typography
        sx={{
          px: 2,
          mb: 1,
          fontWeight: "bold",
          color,
          "&::before": {
            content: "''",
            display: "inline-block",
            mr: 1,
            width: "12px",
            height: "12px",
            backgroundColor: color,
            borderRadius: "50%",
          },
        }}
      >
        {type === "isigmet" ? "SIGMET" : "AIRSIGMET"}
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        gap={1}
        px={2}
        sx={{ overflowY: "auto" }}
      >
        <Typography>
          <b>Hazard:</b> {hazard}
        </Typography>
        {altitude && (
          <Typography>
            <b>Altitude:</b> {altitude} ft
          </Typography>
        )}
        {validTimeFrom && (
          <Typography>
            <b>Valid From:</b> {formatDateTime(validTimeFrom)}
          </Typography>
        )}
        {validTimeTo && (
          <Typography>
            <b>Valid To:</b> {formatDateTime(validTimeTo)}
          </Typography>
        )}
        {rawSigmet && (
          <Box p={1} sx={{ backgroundColor: grey[100], borderRadius: 1 }}>
            <Typography>
              <b>Raw text:</b>
            </Typography>
            <Typography>{rawSigmet}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Details;
