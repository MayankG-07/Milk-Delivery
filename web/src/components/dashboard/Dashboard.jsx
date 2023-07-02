import { Box, Typography, Divider } from "@mui/material";
import { Sub } from "./Sub";

export const Dashboard = () => {
  return (
    <Box
      sx={{
        display: "flex",
        marginTop: 12,
        justifyContent: { xs: "center", sm: "flex-start" },
        flexWrap: "wrap",
        marginLeft: { sm: "10%" },
      }}
    >
      <Typography variant="h5" sx={{ marginLeft: { sm: "1%" } }}>
        Active Subscriptions
      </Typography>
      <Divider sx={{ width: { xs: "66%" }, marginTop: 1, marginBottom: 1.5 }} />
      <Sub subid={1} milkid={1} start={new Date("2023-07-04")} current={true} />
    </Box>
  );
};
