/* eslint-disable no-unused-vars */
// import { DevTool } from "@hookform/devtools";
import { Box, Typography, Divider } from "@mui/material";
import { HouseLogin } from "../login/HouseLogin";

export const Login = () => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "center", sm: "flex-start" },
          marginTop: { xs: "22%", sm: 12 },
          marginLeft: { sm: 10 },
        }}
      >
        <Typography sx={{ paddingY: 2 }} variant="h5">
          Login
        </Typography>
        <Divider
          sx={{
            display: { xs: "flex" },
            marginBottom: { xs: 0.5, sm: 2 },
            width: { sx: "80%", sm: "40%" },
          }}
        />
        <HouseLogin />
      </Box>

      {/* <DevTool control={control} /> */}
    </>
  );
};
