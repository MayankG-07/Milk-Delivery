import { useContext, useState } from "react";
import axios from "axios";
import { url } from "./../../assets/res";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Timer } from "../misc/Timer";
import { useNavigate } from "react-router-dom";
import { PropTypes } from "prop-types";
import { UserContext } from "../../context/userContext";

export const Login = ({ boxStyles }) => {
  const [details, setDetails] = useState({
    wing: null,
    houseno: null,
    password: { value: null, show: false },
  });

  const [otp, setOtp] = useState({
    sent: false,
    loading: false,
    sendAgain: false,
    time: null,
    value: null,
    sentValue: null,
  });

  const [loginType, setLoginType] = useState({ loading: false, withOtp: true });

  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const { handleDetailsChange } = userContext;

  const handleSendOtp = () => {
    if (!details.houseno) {
      alert("Enter valid details");
      return;
    }

    setOtp({ ...otp, loading: true });

    axios
      .patch(`${url}/api/get_otp`, {
        wing: details.wing,
        houseno: details.houseno,
      })
      .then((res) => {
        setOtp({ ...otp, loading: false });
        if (res.data.success) {
          const time = new Date();
          time.setSeconds(time.getSeconds() + 300);

          setOtp({
            sent: true,
            sentValue: res.data.data.otp,
            sendAgain: false,
            time,
          });
          return;
        } else if (res.data.error === "INVALID_CREDS") {
          alert("Invalid details");
          return;
        } else {
          alert("An error occurred");
          console.log(res.data.error);
          return;
        }
      })
      .catch((error) => {
        setOtp({ ...otp, loading: false });
        alert("An error occurred");
        console.log(error);
      });
  };

  const handleLoginOtp = () => {
    setLoginType({ ...loginType, loading: true });
    axios
      .patch(`${url}/api/login/otp`, {
        wing: details.wing,
        houseno: details.houseno,
        otp: otp.value,
      })
      .then((res) => {
        setLoginType({ ...loginType, loading: false });
        if (res.data.success) {
          login();
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
        setLoginType({ ...loginType, loading: false });
        alert("An error occurred");
        console.log(error);
        return;
      });
  };

  const handleLoginPassword = () => {
    if (details.password.show) {
      setDetails({
        ...details,
        password: { ...details.password, show: false },
      });
    }

    if (!details.houseno || !details.password.value) {
      alert("Enter valid house no and password");
      return;
    }

    setLoginType({ ...loginType, loading: true });

    axios
      .patch(`${url}/api/login/password`, {
        wing: details.wing,
        houseno: details.houseno,
        password: details.password.value,
      })
      .then((res) => {
        setLoginType({ ...loginType, loading: false });
        console.log(res);
        if (res.data.success) {
          login();
          return;
        } else if (res.data.error === "INVALID_CREDS") {
          alert("Invalid details");
          return;
        } else {
          console.log(res.data);
          alert("Error occurred");
          return;
        }
      })
      .catch((error) => {
        setLoginType({ ...loginType, loading: false });
        alert("An error occurred");
        console.log(error);
        return;
      });
  };

  const login = () => {
    // TODO login redirect code goes here
    // console.log(details.wing, details.houseno);
    handleDetailsChange({ wing: details.wing, houseno: details.houseno });
    navigate("/home");
    location.reload();
  };

  return (
    <Box sx={boxStyles}>
      <Typography sx={{ paddingY: 2 }} variant="h5">
        Login
      </Typography>
      <Divider sx={{ marginBottom: 1 }} />
      <FormControl disabled={otp.loading}>
        <FormLabel>Wing:</FormLabel>
        <RadioGroup
          value={details.wing ? details.wing : ""}
          onChange={(_event, newValue) =>
            setDetails({ ...details, wing: newValue })
          }
          row
        >
          <FormControlLabel value="a" control={<Radio />} label="A" />
          <FormControlLabel value="b" control={<Radio />} label="B" />
        </RadioGroup>
      </FormControl>
      <TextField
        sx={{ marginY: 1, width: "87%", color: "primary" }}
        value={details.houseno ? details.houseno : ""}
        label="House No"
        onChange={(event) => {
          if (!isNaN(parseInt(event.target.value))) {
            setDetails({ ...details, houseno: parseInt(event.target.value) });
          } else if (event.target.value === "") {
            setDetails({ ...details, houseno: null });
          }
        }}
        disabled={otp.loading}
        InputProps={
          loginType.withOtp
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    {!otp.sendAgain && otp.sent && !otp.loading ? (
                      <Timer expiryTimestamp={otp.time}>
                        {(minutes, seconds, isRunning) => {
                          if (isRunning) {
                            return (
                              <Chip
                                sx={{ color: "primary" }}
                                label={`${minutes}:${seconds}`}
                                disabled={true}
                              />
                            );
                          } else {
                            setOtp({ ...otp, sendAgain: true, time: null });
                            return <></>;
                          }
                        }}
                      </Timer>
                    ) : (
                      <Chip
                        sx={{ color: "primary" }}
                        label={
                          otp.loading
                            ? "Sending..."
                            : otp.sent
                            ? "Resend OTP"
                            : "Send OTP"
                        }
                        disabled={otp.loading}
                        clickable={!otp.loading}
                        onClick={handleSendOtp}
                      />
                    )}
                  </InputAdornment>
                ),
              }
            : {}
        }
      />
      {loginType.withOtp ? (
        <>
          <TextField
            sx={{ marginY: 1, width: "87%", color: "primary" }}
            value={otp.value ? otp.value : ""}
            label="OTP"
            onChange={(event) => {
              if (!isNaN(parseInt(event.target.value))) {
                setOtp({ ...otp, value: parseInt(event.target.value) });
              } else if (event.target.value === "") {
                setOtp({ ...otp, value: null });
              }
            }}
            disabled={!otp.sent}
          />
        </>
      ) : (
        <>
          <TextField
            sx={{ marginY: 1, width: "87%", color: "primary" }}
            value={details.password.value ? details.password.value : ""}
            label="Password"
            type={details.password.show ? "text" : "password"}
            onChange={(event) =>
              setDetails({
                ...details,
                password: { ...details.password, value: event.target.value },
              })
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() =>
                      setDetails({
                        ...details,
                        password: {
                          ...details.password,
                          show: !details.password.show,
                        },
                      })
                    }
                  >
                    {details.password.show ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </>
      )}

      <Box sx={{ position: "relative" }}>
        <Button
          variant="contained"
          onClick={loginType.withOtp ? handleLoginOtp : handleLoginPassword}
          sx={{ marginY: 1, width: "87%", color: "primary" }}
          disabled={
            loginType.loading
              ? true
              : loginType.withOtp
              ? !details.houseno ||
                !otp.value ||
                otp.value < 1000 ||
                otp.value > 9999
              : !details.houseno || !details.password.value
          }
        >
          Login
        </Button>
        {loginType.loading && (
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
      <Button
        variant="outlined"
        onClick={
          loginType.withOtp
            ? () => setLoginType({ ...loginType, withOtp: false })
            : () => setLoginType({ ...loginType, withOtp: true })
        }
        sx={{ marginY: 0.15, width: "87%", color: "primary" }}
      >
        {loginType.withOtp ? <>Login with Password</> : <>Login with OTP</>}
      </Button>

      <Button
        sx={{ marginY: 1, width: "87%", color: "primary" }}
        onClick={() => navigate("/register")}
      >
        New User? Register Here
      </Button>
    </Box>
  );
};

Login.propTypes = {
  boxStyles: PropTypes.object,
};
