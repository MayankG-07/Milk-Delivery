import { useContext, useEffect } from "react";
import { Navbar } from "./components/misc/Navbar";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthContext } from "./context/authContext";

const App = () => {
  const { verifyTokenData } = useContext(AuthContext);

  useEffect(() => {
    verifyTokenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar />
      <AppRoutes />
    </>
  );
};

export default App;
