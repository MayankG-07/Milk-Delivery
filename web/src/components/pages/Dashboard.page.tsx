import { Box, Typography, Divider } from "@mui/material";
import { House } from "../dashboard.page/House";
import { SessionExpiredAlert } from "../misc/SessionExpiredAlert";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/authContext";

export const Dashboard = () => {
  const { userDetails } = useContext(AuthContext);
  const [loggedIn, setLoggedIn] = useState(true);

  const houseids: number[] = [1];

  useEffect(() => {
    setLoggedIn(
      userDetails !== null &&
        userDetails !== undefined &&
        "token_data" in userDetails
    );
  }, [userDetails]);

  return (
    <>
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
          {houseids.map((houseid) => (
            <House key={houseid} houseid={houseid} />
          ))}
        </Box>
      </Box>

      <SessionExpiredAlert open={!loggedIn} />
    </>
  );
};
