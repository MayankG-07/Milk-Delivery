import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./components/pages/Home.page";
import { NotFound404 } from "./components/pages/NotFound404.page";
import { Login } from "./components/pages/Login.page";
import { RegisterHouse } from "./components/pages/RegisterHouse.page";
import { Dashboard } from "./components/pages/Dashboard.page";
import { Navbar } from "./components/misc/Navbar";
import { RegisterUser } from "./components/pages/RegisterUser.page";

const App = () => {
  // const userContext = useContext(UserContext);
  // const { userDetails } = userContext;
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register/user" element={<RegisterUser />} />
        <Route path="register/house" element={<RegisterHouse />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="404" element={<NotFound404 />} />
        <Route path="*" element={<Navigate to="404" />} />
      </Routes>
    </>
  );
};

export default App;
