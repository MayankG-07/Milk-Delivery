import { Box } from "@mui/material";
import { Sub } from "./Sub";

export const Dashboard = () => {
  return (
    <Box>
      <Sub subid={1} milkid={1} start={new Date("2023-07-01")} current={true} />
    </Box>
  );
};
