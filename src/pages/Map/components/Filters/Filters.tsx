import { useCallback, useState } from "react";
import { Button, Box, Typography, Divider } from "@mui/material";
import TimeFilter from "./components/TimeFilter/TimeFilter";
import LevelFilter from "./components/LevelFilter/LevelFilter";

export interface VisibleLayers {
  isigmet: boolean;
  airsigmet: boolean;
}

export interface FiltersType {
  levelFrom?: string;
  levelTo?: string;
  hoursChange?: string;
}

interface Props {
  visibleLayers: VisibleLayers;
  setVisibleLayers: (visibleLayers: VisibleLayers) => void;
  onFiltersChange: (filters: FiltersType) => void;
}

const Filters = ({
  visibleLayers,
  setVisibleLayers,
  onFiltersChange,
}: Props) => {
  const [filters, setFilters] = useState<Partial<FiltersType>>({});

  const handleFiltersChange = useCallback(
    (newFilters: Partial<FiltersType>) => {
      const nextFilters = {
        ...filters,
        ...newFilters,
      };
      setFilters(nextFilters);
      onFiltersChange(nextFilters);
    },
    [filters, onFiltersChange]
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      py={2}
      sx={{
        position: "fixed",
        flexGrow: 0,
        zIndex: 100,
        backgroundColor: "white",
        borderRadius: 2,
        overflow: "hidden",
        maxHeight: "calc(min(80vh,500px))",
        width: "350px",
        top: 30,
        right: 30,
      }}
    >
      <Typography sx={{ px: 2, mb: 1, fontWeight: "bold" }}>Layers</Typography>
      <Box sx={{ overflowY: "auto", overflowX: "hidden", px: 2 }}>
        <Box display="flex" flexDirection="row" gap={1} mb={1}>
          <Button
            variant="contained"
            color={visibleLayers.isigmet ? "error" : "inherit"}
            sx={{ borderRadius: "30px" }}
            onClick={() =>
              setVisibleLayers({
                ...visibleLayers,
                isigmet: !visibleLayers.isigmet,
              })
            }
          >
            SIGMET
          </Button>
          <Button
            variant="contained"
            color={visibleLayers.airsigmet ? "primary" : "inherit"}
            sx={{ borderRadius: "30px" }}
            onClick={() =>
              setVisibleLayers({
                ...visibleLayers,
                airsigmet: !visibleLayers.airsigmet,
              })
            }
          >
            AIRSIGMET
          </Button>
        </Box>
        <Divider />
        <LevelFilter
          onLevelFilterChange={([levelFrom, levelTo]) =>
            handleFiltersChange({
              levelFrom: levelFrom.toString(),
              levelTo: levelTo.toString(),
            })
          }
        />
        <Divider />
        <TimeFilter
          onDateFilterChange={(dateFilter) =>
            handleFiltersChange({ hoursChange: dateFilter.toString() })
          }
        />
      </Box>
    </Box>
  );
};

export default Filters;
