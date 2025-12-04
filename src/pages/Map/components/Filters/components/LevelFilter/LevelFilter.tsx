import { useRef, useState, useEffect } from "react";
import { Box, Slider, Typography } from "@mui/material";

interface Props {
  onLevelFilterChange: (levelFilter: [number, number]) => void;
}

const levelFilterRange: [number, number] = [0, 48000];
const levelStep = 6000;

const LevelFilter = ({ onLevelFilterChange }: Props) => {
  const [filterValue, setFilterValue] =
    useState<[number, number]>(levelFilterRange);
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hanldeApplyFilterChange = () => {
      if (!isDragging) return;
      onLevelFilterChange(filterValue);
      setIsDragging(false);
    };
    const handlePointerDown = () => setIsDragging(true);
    const slider = ref.current;

    slider?.addEventListener("pointerdown", handlePointerDown);

    if (isDragging) {
      document?.addEventListener("pointerup", hanldeApplyFilterChange);
    }

    return () => {
      slider?.removeEventListener("pointerdown", handlePointerDown);

      if (isDragging) {
        document?.removeEventListener("pointerup", hanldeApplyFilterChange);
      }
    };
  }, [filterValue, onLevelFilterChange, isDragging]);

  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <Typography>Altitude Range</Typography>
      <Typography>{`${filterValue[0]} feet - ${filterValue[1]} feet`}</Typography>
      <Slider
        ref={ref}
        getAriaLabel={() => "Altitude Range"}
        value={filterValue}
        min={levelFilterRange[0]}
        max={levelFilterRange[1]}
        step={1000}
        disableSwap={true}
        onChange={(_, value, activeThumb) => {
          if (value[1] - value[0] < levelStep) {
            if (activeThumb === 0) {
              const clamped = Math.min(
                value[0],
                levelFilterRange[1] - levelStep
              );
              setFilterValue([clamped, clamped + levelStep]);
            } else {
              const clamped = Math.max(value[1], levelStep);
              setFilterValue([clamped - levelStep, clamped]);
            }
          } else {
            setFilterValue(value as [number, number]);
          }
        }}
      />
    </Box>
  );
};

export default LevelFilter;
