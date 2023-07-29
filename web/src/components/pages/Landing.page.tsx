import { Box, Stack, Typography } from "@mui/material";
import { RoundedButton } from "../misc/RoundedButton";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

export const LandingPage = () => {
  const { userDetails } = useContext(AuthContext);

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mt: 12,
      }}
    >
      <Stack direction="column">
        <Typography variant="h4" sx={{ mb: 1 }}>
          {userDetails
            ? `Hello, ${userDetails.name.split(" ")[0]}!`
            : "Welcome to Milk Delivery"}
        </Typography>
        {userDetails ? (
          <RoundedButton
            text="go to dashboard"
            sx={{ mt: 2 }}
            onClick={(_e) => navigate("/dashboard")}
          />
        ) : (
          <Stack direction="row" sx={{ justifyContent: "center", mt: 2 }}>
            <RoundedButton
              sx={{ mr: 1.5 }}
              text="login"
              onClick={(_e) => navigate("/login")}
            />
            <RoundedButton
              text="sign up"
              onClick={(_e) => navigate("/register/user")}
            />
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
