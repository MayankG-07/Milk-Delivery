import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

export const SubPage = () => {
  const { state } = useLocation();
  const { subid }: { subid: number } = state;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mt: 10,
      }}
    >
      <h1>Sub Details for sub {subid}</h1>
    </Box>
  );
};
