import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/home/Home";
// import { Test } from "./components/misc/Test";
import { NotFound404 } from "./components/misc/404";
import { Login } from "./components/home/Login";
import { Register } from "./components/home/Register";
import { Box, CssBaseline } from "@mui/material";
import { useContext } from "react";
import { UserContext } from "./context/userContext";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Navbar } from "./components/misc/Navbar";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = () => {
  const userContext = useContext(UserContext);
  const { userDetails } = userContext;
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Navbar />
      <div>
        <center>
          <Box sx={{ alignItems: "center", justifyContent: "center" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="*" element={<NotFound404 />} />
            </Routes>
          </Box>
        </center>
      </div>
    </ThemeProvider>
  );
};

export default App;
