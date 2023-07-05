import { useContext } from "react";
import { UserContext } from "./../../context/userContext";
import { useMutation } from "react-query";
import axios from "axios";
import { url } from "./../../assets/res";

const fetchUserDetails = (queryData) => {
  return axios.put(`${url}/admin/query`, queryData);
};

export const Account = () => {
  const userContext = useContext(UserContext);
  const { userDetails } = userContext;
  const { wing, houseno } = userDetails;
  const { mutate: getDetails } = useMutation(fetchUserDetails);
  getDetails({
    query: `SELECT wing, houseno, email FROM users WHERE wing=${wing} N`,
  });

  return <div>Account</div>;
};
