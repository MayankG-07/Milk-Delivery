import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/home/Home";
// import { Test } from "./components/misc/Test";
import { NotFound404 } from "./components/misc/404";
import { Login } from "./components/home/Login";
import { Register } from "./components/home/Register";
import { CssBaseline } from "@mui/material";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Navbar } from "./components/misc/Navbar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { VerifyEmail } from "./components/home/VerifyEmail";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = () => {
  // const userContext = useContext(UserContext);
  // const { userDetails } = userContext;
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="verify" element={<VerifyEmail />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
