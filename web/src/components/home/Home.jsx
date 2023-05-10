import { Register } from "./Register";
import { Login } from "./Login";
import { Box, Button, Card } from "@mui/material";
import { useState } from "react";
import { VerifyEmail } from "./VerifyEmail";

const Home = () => {
  const [choice, setChoice] = useState("LOGIN");
  return (
    <div>
      <Box height="500px" width="300px">
        <Card
          sx={{
            minHeight: "350px",
            marginY: "90px",
          }}
          elevation={4}
        >
          {choice === "LOGIN" ? (
            <>
              <Login />
            </>
          ) : (
            <Register />
          )}
          <Button
            sx={{ marginTop: 1, marginBottom: 0.5, width: "87%" }}
            onClick={() => setChoice(choice === "LOGIN" ? "REGISTER" : "LOGIN")}
          >
            {choice === "LOGIN" ? (
              <>New User? Register Here</>
            ) : (
              <>Existing User? Login</>
            )}
          </Button>
          {/* <VerifyEmail justAfterRegister={true} /> */}
        </Card>
      </Box>
    </div>
  );
};

export default Home;
