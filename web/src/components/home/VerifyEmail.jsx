import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { PropTypes } from "prop-types";
import { useState } from "react";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import axios from "axios";
import { url } from "../../assets/res";
import { Timer } from "../misc/Timer";

export const VerifyEmail = ({ justAfterRegister = false }) => {
  const userContext = useContext(UserContext);
  const { userDetails } = userContext;

  if (Object.entries(userDetails).length === 0) {
    alert("Please login first");
    // TODO redirect to login page code here
  }

  const [otp, setOtp] = useState({
    sent: false,
    value: null,
    loading: false,
    sentValue: null,
    sendAgain: false,
    time: null,
  });
  const [emailLoading, setEmailLoading] = useState(false);

  const handleSendOtp = () => {
    setOtp({ ...otp, loading: true });

    axios
      .patch(`${url}/api/get_otp`, {
        wing: userDetails.wing,
        houseno: userDetails.houseno,
      })
      .then((res) => {
        setOtp({ ...otp, loading: false });
        if (res.data.success) {
          const time = new Date();
          time.setSeconds(time.getSeconds() + 300);
          setOtp({
            ...otp,
            sent: true,
            sentValue: res.data.data.otp,
            time,
            sendAgain: false,
          });
        } else {
          console.log(res.data.error);
          alert("An error occurred");
        }
      })
      .catch((error) => {
        setOtp({ ...otp, loading: false });
        console.log(error);
        alert("An error occurred");
      });
  };

  const handleVerifyEmail = () => {
    setEmailLoading(true);
    axios
      .patch(`${url}/api/login/otp`, {
        wing: userDetails.wing,
        houseno: userDetails.houseno,
        otp: otp.value,
      })
      .then((res) => {
        setEmailLoading(false);
        if (res.data.success) {
          verifyEmail();
          return;
        } else if (res.data.error === "INVALID_OTP") {
          alert("Invalid OTP");
          return;
        } else {
          alert("An error occurred");
          console.log(res.data.error);
          return;
        }
      })
      .catch((error) => {
        setEmailLoading(false);
        alert("An error occurred");
        console.log(error);
        return;
      });
  };

  const verifyEmail = () => {
    setEmailLoading(true);

    axios
      .patch(`${url}/api/verify_email`, {
        wing: userDetails.wing,
        houseno: userDetails.houseno,
      })
      .then((res) => {
        setEmailLoading(false);
        if (res.data.success) {
          // TODO redirect after email verify code here
          return;
        } else {
          alert("An error occurred");
          console.log(res.data.error);
          return;
        }
      })
      .catch((error) => {
        setEmailLoading(false);
        alert("An error occurred");
        console.log(error);
        return;
      });
  };

  return (
    <Box
      sx={{
        width: "inherit",
        height: "inherit",
      }}
    >
      {justAfterRegister ? (
        <>
          <Typography variant="h6" sx={{ marginY: 2 }}>
            Thank you for joining us!
          </Typography>
          <Divider sx={{ marginBottom: 1.5 }} />
        </>
      ) : (
        <></>
      )}
      <Typography variant="body1" sx={{ marginY: 1, alignContent: "center" }}>
        {otp.sent ? <>OTP sent!</> : <>We will send an OTP to your email.</>}
      </Typography>
      {otp.sent ? (
        <TextField
          label="OTP"
          value={!otp.value ? "" : otp.value}
          onChange={(event) => {
            if (!isNaN(parseInt(event.target.value))) {
              setOtp({ ...otp, value: event.target.value });
            } else if (event.target.value === "") {
              setOtp({ ...otp, value: "" });
            }
          }}
          sx={{ marginY: 1, width: justAfterRegister ? "87%" : "300px" }}
        />
      ) : (
        <></>
      )}
      <Box sx={{ position: "relative" }}>
        <Button
          variant="contained"
          sx={{ marginY: 1, width: justAfterRegister ? "87%" : "300px" }}
          onClick={otp.sent ? handleVerifyEmail : handleSendOtp}
          disabled={
            otp.loading ||
            emailLoading ||
            (otp.sent && (otp.value < 1000 || otp.value > 9999))
          }
        >
          {otp.sent ? <>Verify Email</> : <>Send OTP</>}
        </Button>
        {((otp.loading && !otp.sent) || emailLoading) && (
          <CircularProgress
            size={24}
            sx={{
              color: "primary",
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-12px",
              marginLeft: "-12px",
            }}
          />
        )}
      </Box>
      {otp.sent ? (
        <Box sx={{ position: "relative" }}>
          <Button
            variant="outlined"
            sx={{ marginY: 0.15, width: justAfterRegister ? "87%" : "300px" }}
            onClick={handleSendOtp}
            disabled={!otp.sendAgain || emailLoading || otp.loading}
          >
            {otp.time ? (
              <Timer expiryTimestamp={otp.time}>
                {(minutes, seconds, isRunning) => {
                  if (isRunning) {
                    return (
                      <>
                        Send again in {minutes}:{seconds}
                      </>
                    );
                  } else {
                    setOtp({ ...otp, sendAgain: true, time: null });
                  }
                }}
              </Timer>
            ) : (
              <>Send again</>
            )}
          </Button>
          {otp.loading && (
            <CircularProgress
              size={24}
              sx={{
                color: "primary",
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};

VerifyEmail.propTypes = {
  justAfterRegister: PropTypes.bool,
};