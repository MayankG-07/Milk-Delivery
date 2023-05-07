import { Register } from "./Register";
import { Login } from "./Login";
import { Box, Button, Card, Divider } from "@mui/material";
import { useState } from "react";

const Home = () => {
  const [isRegistered, setIsRegistered] = useState(true);
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
          {isRegistered ? (
            <>
              <Login />
              <Button
                sx={{ marginTop: 1, marginBottom: 0.5 }}
                onClick={() => setIsRegistered(!isRegistered)}
              >
                Don't have an account? Register
              </Button>
            </>
          ) : (
            <Register />
          )}
        </Card>
      </Box>
    </div>
  );
};

export default Home;
