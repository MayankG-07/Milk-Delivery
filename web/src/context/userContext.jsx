import { createContext, useState } from "react";
import { PropTypes } from "prop-types";

export const UserContext = createContext({
  details: null,
  onDetailsChange: (newDetails) => {},
});

export const UserContextProvider = ({ children }) => {
  const [details, setDetails] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  const handleDetailsChange = (newDetails) => {
    setDetails({ ...details, ...newDetails });
    localStorage.setItem("user", JSON.stringify(details));
  };

  const contextValue = {
    userDetails: details,
    onDetailsChange: handleDetailsChange,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

UserContextProvider.propTypes = {
  children: PropTypes.node,
};
