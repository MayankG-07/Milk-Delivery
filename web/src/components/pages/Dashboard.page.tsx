import { Box, Typography, Divider } from "@mui/material";
// import { House } from "../House";

export const Dashboard = () => {
  const houses: {
    wing: "a" | "b";
    houseno: number;
  }[] = [
    {
      wing: "a",
      houseno: 618,
    },
    {
      wing: "b",
      houseno: 1609,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: { xs: "center", sm: "flex-start" },
        marginTop: 12,
        marginLeft: { sm: 8 },
      }}
    >
      <Typography sx={{ paddingY: 2 }} variant="h5">
        Dashboard
      </Typography>
      <Divider
        sx={{
          display: { xs: "flex" },
          marginBottom: { xs: 0.5, sm: 2 },
          width: { sx: "80%", sm: "40%" },
        }}
      />
      <Typography sx={{ paddingY: 2, fontSize: 17 }} variant="subtitle1">
        Your Houses
      </Typography>
      <Box sx={{ display: "flex" }}>
        {/* {houses.map((house) => (
          <House
            key={house.houseno}
            wing={house.wing}
            houseno={house.houseno}
          />
        ))} */}
      </Box>
    </Box>
  );
};
