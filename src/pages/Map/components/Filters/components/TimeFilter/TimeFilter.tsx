import { useState } from "react";
import { Box, Slider, Typography } from "@mui/material";
import { format } from "date-fns";

interface Props {
  onDateFilterChange: (dateFilter: number) => void;
}

const timeFilterRange: [number, number] = [-24, 6];

const TimeFilter = ({ onDateFilterChange }: Props) => {
  const [hoursChange, setHoursChange] = useState<number>(0);

  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <Typography>Time Filter</Typography>
      <Typography>
        {hoursChange === 0 ? "Current time" : `${hoursChange} hours`}
      </Typography>
      <Slider
        defaultValue={0}
        min={timeFilterRange[0]}
        max={timeFilterRange[1]}
        step={1}
        aria-label="Time Filter"
        valueLabelDisplay="auto"
        onChangeCommitted={(_, value) => {
          setHoursChange(value as number);
          onDateFilterChange(value as number);
        }}
      />
      <Typography>
        Current time: {format(new Date(), "dd/MM/yyyy, hh:mm a")}
      </Typography>
    </Box>
  );
};

export default TimeFilter;
