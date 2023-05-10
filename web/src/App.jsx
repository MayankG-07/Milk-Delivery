import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/home/Home";
// import { Test } from "./components/misc/Test";
import { NotFound404 } from "./components/misc/404";
import { Login } from "./components/home/Login";
import { Register } from "./components/home/Register";
import { Box } from "@mui/material";

const App = () => {
  return (
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
  );
};

export default App;
