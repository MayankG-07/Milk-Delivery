import { useState } from "react";
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

export const Login = () => {
  const [houseNo, setHouseNo] = useState("");
  const [password, setPassword] = useState("");
  const [wing, setWing] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loginWithOtp, setLoginWithOtp] = useState(true);
  const [otpSent, setOtpSent] = useState({ isOtpSent: false, value: null });
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleSendOtp = () => {
    if (!houseNo) {
      alert("Enter valid details");
      return;
    }

    setOtpLoading(true);
    axios
      .patch(`${url}/api/get_otp`, {
        wing: wing,
        houseno: houseNo,
      })
      .then((res) => {
        if (res.data.success) {
          setOtpLoading(false);
          setOtpSent({ isOtpSent: true, value: res.data.data.otp });
        } else if (res.data.error === "INVALID_CREDS") {
          setOtpLoading(false);
          alert("Invalid details");
        } else {
          setOtpLoading(false);
          alert("An error occurred");
          console.log(res.data.error);
        }
      })
      .catch((error) => {
        setOtpLoading(false);
        alert("An error occurred");
        console.log(error);
      });
  };

  const handleLoginOtp = () => {
    setLoginLoading(true);
    axios
      .patch(`${url}/api/login/otp`, {
        wing: wing,
        houseno: houseNo,
        otp: otp,
      })
      .then((res) => {
        if (res.data.success) {
          login();
          return;
        } else if (res.data.error === "INVALID_OTP") {
          setLoginLoading(false);
          alert("Invalid OTP");
          return;
        } else {
          setLoginLoading(false);
          alert("An error occurred");
          console.log(res.data.error);
          return;
        }
      })
      .catch((error) => {
        setLoginLoading(false);
        alert("An error occurred");
        console.log(error);
        return;
      });
  };

  const handleLoginPassword = () => {
    if (showPassword) {
      setShowPassword(false);
    }

    if (!houseNo || !password) {
      alert("Enter valid house no and password");
      return;
    }

    // let _wing = wing;
    // let _houseNo = houseNo;
    // let _password = password;

    // setWing("");
    // setHouseNo("");
    // setPassword("");

    setLoginLoading(true);

    axios
      .patch(`${url}/api/login/password`, {
        wing: wing,
        houseno: houseNo,
        password: password,
      })
      .then((res) => {
        console.log(res);
        if (res.data.success) {
          login();
          return;
        } else if (res.data.error === "INVALID_CREDS") {
          setLoginLoading(false);
          alert("Invalid details");
          return;
        } else {
          setLoginLoading(false);
          console.log(res.data);
          alert("Error occurred");
          return;
        }
      })
      .catch((error) => {
        setLoginLoading(false);
        alert("An error occurred");
        console.log(error);
        return;
      });
  };

  const login = () => {
    setLoginLoading(false);
    // alert("Login successful");
    // TODO login code goes here
  };

  return (
    <Box>
      <Typography sx={{ paddingY: 2 }} variant="h5">
        Login
      </Typography>
      <Divider sx={{ marginBottom: 1 }} />
      <FormControl disabled={otpLoading}>
        <FormLabel>Wing:</FormLabel>
        <RadioGroup
          value={wing}
          onChange={(_event, newValue) => setWing(newValue)}
          row
        >
          <FormControlLabel value="a" control={<Radio />} label="A" />
          <FormControlLabel value="b" control={<Radio />} label="B" />
        </RadioGroup>
      </FormControl>
      <TextField
        sx={{ marginLeft: 2, marginRight: 2, marginY: 1, width: "87%" }}
        value={houseNo}
        label="House No"
        onChange={(event) => {
          if (!isNaN(parseInt(event.target.value))) {
            setHouseNo(parseInt(event.target.value));
          } else if (event.target.value === "") {
            setHouseNo("");
          }
        }}
        disabled={otpLoading}
        InputProps={
          loginWithOtp
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip
                      color="primary"
                      label={
                        otpSent.isOtpSent
                          ? "OTP Sent"
                          : otpLoading
                          ? "Sending..."
                          : "Send OTP"
                      }
                      clickable
                      disabled={otpSent.isOtpSent || otpLoading}
                      onClick={handleSendOtp}
                    />
                  </InputAdornment>
                ),
              }
            : {}
        }
      />
      {loginWithOtp ? (
        <>
          <TextField
            sx={{ marginLeft: 2, marginRight: 2, marginY: 1, width: "87%" }}
            value={otp}
            label="OTP"
            onChange={(event) => {
              if (!isNaN(parseInt(event.target.value))) {
                setOtp(parseInt(event.target.value));
              }
            }}
            disabled={!otpSent.isOtpSent}
          />
        </>
      ) : (
        <>
          <TextField
            sx={{ marginLeft: 2, marginRight: 2, marginY: 1, width: "87%" }}
            value={password}
            label="Password"
            type={showPassword ? "text" : "password"}
            onChange={(event) => setPassword(event.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
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
          onClick={loginWithOtp ? handleLoginOtp : handleLoginPassword}
          sx={{ marginY: 1, width: "87%" }}
          disabled={
            loginLoading
              ? true
              : loginWithOtp
              ? !houseNo || !otp || otp < 1000 || otp > 9999
              : !houseNo || !password
          }
        >
          Login
        </Button>
        {loginLoading && (
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
          loginWithOtp
            ? () => setLoginWithOtp(false)
            : () => setLoginWithOtp(true)
        }
        sx={{ marginY: 0.15, width: "87%" }}
      >
        {loginWithOtp ? <>Login with Password</> : <>Login with OTP</>}
      </Button>
    </Box>
  );
};
