import { createContext, useState } from "react";
import { PropTypes } from "prop-types";

export const UserContext = createContext({
  details: null,
  handleDetailsChange: (newDetails) => {},
});

export const UserContextProvider = ({ children }) => {
  const [details, setDetails] = useState({
    userid:
      localStorage.getItem("userid") === "undefined"
        ? null
        : localStorage.getItem("userid"),
  });

  const handleDetailsChange = (newDetails) => {
    console.log(newDetails);
    setDetails(newDetails);
    // console.log(details);
    localStorage.setItem("userid", newDetails.userid);
  };

  const contextValue = {
    userDetails: details,
    handleDetailsChange,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

UserContextProvider.propTypes = {
  children: PropTypes.node,
};
