import { useContext, useEffect, useState } from "react";
import { AlertDialog } from "./AlertDialog";
import { AuthContext } from "../../context/authContext";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const SessionExpiredAlert = () => {
  const navigate = useNavigate();
  const { userDetails, fetchNewUserDetails } = useContext(AuthContext);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    setLoggedIn(
      userDetails !== null &&
        userDetails !== undefined &&
        userDetails.token_data! !== null
    );
  }, [userDetails]);

  return (
    <AlertDialog
      open={!loggedIn}
      title="Login session expired"
      content={
        <Typography variant="body2">
          The login session has expired. Please log in again.
        </Typography>
      }
      showActions={true}
      actions={[
        {
          text: "OK",
          onclick: () => {
            fetchNewUserDetails({ logout: true });
            navigate("/login");
          },
        },
      ]}
    />
  );
};
