// import { Register } from "./Register";
import { Login } from "./Login";
import { Box } from "@mui/material";
// import { useState } from "react";
// import { VerifyEmail } from "./VerifyEmail";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
// import { Dashboard } from "../dashboard/Dashboard";
// import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";

const Home = () => {
  const userContext = useContext(UserContext);
  const { userDetails } = userContext;
  // const navigate = useNavigate();

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
        <></>
      )}
    </>
  );
};

export default Home;
