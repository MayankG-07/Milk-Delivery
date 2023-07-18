import { createContext, useState } from "react";
import axios from "axios";
import { url } from "../assets/res";
import {
  detailsTypes,
  fetchNewUserDetailsProps,
  tokenDataTypes,
  verifyTokenDataProps,
} from "../types/userContext.types";

export const MILK_DELIVERY_USER = "MILK_DELIVERY_USER";
type initialContext = {
  userDetails: detailsTypes | null;
  fetchNewUserDetails: (props: fetchNewUserDetailsProps) => Promise<void>;
  verifyTokenData: (props?: verifyTokenDataProps) => Promise<void>;
};

const initialContextValue: initialContext = {
  userDetails: null,
  fetchNewUserDetails: ({ logout: _logout, userid: _userid }) =>
    Promise.resolve(),
  verifyTokenData: (_props?) => Promise.resolve(),
};

export const AuthContext = createContext(initialContextValue);

// stored object = {
//   userid: int,
//   token_data: {
//     access_token: string,
//     token_type: string
//   }
// }

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const prevDetails = localStorage.getItem(MILK_DELIVERY_USER);
  const [details, setDetails] = useState<detailsTypes | null>(
    prevDetails !== undefined && prevDetails !== null
      ? JSON.parse(prevDetails)
      : null
  );

  const fetchNewUserDetails = async ({
    logout,
    userid,
  }: fetchNewUserDetailsProps) => {
    console.log(logout, userid);
    if (!logout) {
      await axios({
        method: "GET",
        url: `${url}/user/details`,
        params: { userid },
      })
        .then((res) => {
          const prevData =
            localStorage.getItem(MILK_DELIVERY_USER) !== undefined &&
            localStorage.getItem(MILK_DELIVERY_USER) !== null
              ? JSON.parse(localStorage.getItem(MILK_DELIVERY_USER)!)
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
          } else {
            console.log(err);
          }
        });
    } else {
      setDetails(null);
      localStorage.removeItem(MILK_DELIVERY_USER);
    }
  };

  const verifyTokenData = async (passedTokenParams?: verifyTokenDataProps) => {
    let token_data: tokenDataTypes | undefined;
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
          setDetails((prevDetails: detailsTypes) => ({
            ...prevDetails!,
            token_data,
          }));
          const data = JSON.parse(localStorage.getItem(MILK_DELIVERY_USER)!);
          localStorage.setItem(
            MILK_DELIVERY_USER,
            JSON.stringify({ ...data, token_data })
          );
        })
        .catch((err) => {
          if (err.response.status === 401) {
            setDetails((prevDetails: detailsTypes) => ({
              ...prevDetails!,
              token_data: null,
            }));
            const data = JSON.parse(localStorage.getItem(MILK_DELIVERY_USER)!);
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
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
