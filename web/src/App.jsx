import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Home } from "./components/pages/Home.page";
// import { Test } from "./components/misc/Test";
import { NotFound404 } from "./components/pages/404.page";
import { Login } from "./components/pages/Login.page";
import { RegisterHouse } from "./components/pages/RegisterHouse.page";
import { CssBaseline } from "@mui/material";
import { Dashboard } from "./components/pages/Dashboard.page";
import { Navbar } from "./components/misc/Navbar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { VerifyEmail } from "./components/VerifyEmail";
import { RegisterUser } from "./components/pages/RegisterUser.page";

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
        <Route path="register/user" element={<RegisterUser />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="verify" element={<VerifyEmail />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
