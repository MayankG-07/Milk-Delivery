import { Register } from "./Register";
import { Login } from "./Login";
import { Box, Button, Card } from "@mui/material";
import { useState } from "react";
import { VerifyEmail } from "./VerifyEmail";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import { Dashboard } from "../dashboard/Dashboard";

const Home = () => {
  const userContext = useContext(UserContext);
  const { userDetails } = userContext;

  // console.log(userDetails, userDetails.length);
  return (
    <>
      {Object.keys(userDetails).length === 0 ? (
        <Box>
          <Login
            boxStyles={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10,
              flexDirection: "column",
            }}
          />
        </Box>
      ) : (
        <Box>
          <Dashboard />
        </Box>
      )}
    </>
  );
};

export default Home;
