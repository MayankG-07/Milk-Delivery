import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Home } from "./components/pages/Home.page";
import { NotFound404 } from "./components/pages/404.page";
import { Login } from "./components/pages/Login.page";
import { RegisterHouse } from "./components/pages/RegisterHouse.page";
import { CssBaseline } from "@mui/material";
import { Dashboard } from "./components/pages/Dashboard.page";
import { Navbar } from "./components/misc/Navbar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { VerifyEmail } from "./components/VerifyEmail";
import { RegisterUser } from "./components/pages/RegisterUser.page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserContextProvider } from "./context/userContext";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const queryClient = new QueryClient();

const App = () => {
  // const userContext = useContext(UserContext);
  // const { userDetails } = userContext;
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <UserContextProvider>
          <CssBaseline />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register/user" element={<RegisterUser />} />
            <Route path="register/house" element={<RegisterHouse />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="verify" element={<VerifyEmail />} />
            <Route path="*" element={<NotFound404 />} />
          </Routes>
        </UserContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
