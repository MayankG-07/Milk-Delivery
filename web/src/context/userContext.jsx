/* eslint-disable no-unused-vars */
import { createContext, useState } from "react";
import { PropTypes } from "prop-types";
import axios from "axios";
import { url } from "./../assets/res";

export const MILK_DELIVERY_USER = "MILK_DELIVERY_USER";

export const UserContext = createContext({
  userDetails: null,
  fetchNewUserDetails: ({ _logout, _userid, _token_data }) => {},
  verifyTokenData: (_passedTokenParams) => {},
});

// stored object = {
//   userid: int,
//   token_data: {
//     access_token: string,
//     token_type: string
//   }
// }

export const UserContextProvider = ({ children }) => {
  const prevDetails = localStorage.getItem(MILK_DELIVERY_USER);
  const [details, setDetails] = useState(
    prevDetails !== undefined && prevDetails !== null
      ? JSON.parse(prevDetails)
      : null
  );

  const fetchNewUserDetails = async ({ logout, userid }) => {
    if (!logout) {
      await axios({
        method: "GET",
        url: `${url}/user/details`,
        params: { userid },
      })
        .then((res) => {
          // console.log(res);
          // console.log(localStorage.getItem(MILK_DELIVERY_USER));
          const prevData =
            localStorage.getItem(MILK_DELIVERY_USER) !== undefined &&
            localStorage.getItem(MILK_DELIVERY_USER) !== null
              ? JSON.parse(localStorage.getItem(MILK_DELIVERY_USER))
              : null;

          // console.log(prevData);
          // console.log(
          //   prevData === null ? res.data : { ...prevData, ...res.data }
          // );

          setDetails(
            prevData === null ? res.data : { ...prevData, ...res.data }
          );
          // console.log(details);
          localStorage.setItem(
            MILK_DELIVERY_USER,
            JSON.stringify(
              prevData === null ? res.data : { ...prevData, ...res.data }
            )
          );
        })
        .catch((err) => {
          if (err.response.status === 404) {
            localStorage.removeItem(MILK_DELIVERY_USER);
          }
        });
    } else {
      setDetails(null);
      localStorage.removeItem(MILK_DELIVERY_USER);
    }
  };

  const verifyTokenData = async (passedTokenParams) => {
    let token_data;
    if (passedTokenParams === undefined || passedTokenParams === null) {
      const item = localStorage.getItem(MILK_DELIVERY_USER);
      if (item !== undefined && item !== null) {
        const data = JSON.parse(item);
        if ("token_data" in data) {
          token_data = data.token_data;
        }
      } else {
        return;
      }
    } else {
      token_data = passedTokenParams.token_data;
    }

    if (token_data !== undefined && token_data !== null) {
      await axios({
        method: "GET",
        url: `${url}/misc/verify-token`,
        params: { token: token_data.access_token },
      })
        .then((_res) => {
          setDetails((prevDetails) => ({ ...prevDetails, token_data }));
          const data = JSON.parse(localStorage.getItem(MILK_DELIVERY_USER));
          localStorage.setItem(
            MILK_DELIVERY_USER,
            JSON.stringify({ ...data, token_data })
          );
        })
        .catch((err) => {
          if (err.response.status === 401) {
            setDetails((prevDetails) => ({ ...prevDetails, token_data: null }));
            const data = JSON.parse(localStorage.getItem(MILK_DELIVERY_USER));
            localStorage.setItem(
              MILK_DELIVERY_USER,
              JSON.stringify({ ...data, token_data: null })
            );
          }
        });
    } else {
      fetchNewUserDetails({ logout: true });
    }
  };

  const contextValue = {
    userDetails: details,
    fetchNewUserDetails,
    verifyTokenData,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

UserContextProvider.propTypes = {
  children: PropTypes.node,
};
