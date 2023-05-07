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
  const [otp, setOtp] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleLoginPassword = () => {
    if (showPassword) {
      setShowPassword(false);
    }

    if (!houseNo || !password) {
      alert("Enter valid house no and password");
      return;
    }

    let _wing = wing;
    let _houseNo = houseNo;
    let _password = password;

    setWing("");
    setHouseNo("");
    setPassword("");

    axios
      .patch(`${url}/api/login/password`, {
        wing: _wing,
        houseno: _houseNo,
        password: _password,
      })
      .then((res) => {
        console.log(res);
        if (res.data.success) {
          alert("Login successful");
          return;
        } else if (res.data.error === "INVALID_CREDS") {
          alert("Invalid details");
        } else {
          console.log(res.data);
          alert("Error occurred");
        }
      })
      .catch((error) => {
        alert("An error occurred");
        console.log(error);
      });
  };

  const handleSendOtp = () => {
    setOtpLoading(true);
  };

  const handleLoginWithOtp = () => {
    if (!loginWithOtp) {
      setLoginWithOtp(true);
    }
  };

  return (
    <Box>
      <Typography sx={{ paddingY: 2 }} variant="h5">
        Login
      </Typography>
      <Divider sx={{ marginBottom: 1 }} />
      <FormControl>
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
        onChange={(event) => setHouseNo(event.target.value)}
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
            value={password}
            label="OTP"
            onChange={(event) => setPassword(event.target.value)}
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

          <Button
            variant="contained"
            onClick={handleLoginPassword}
            sx={{ marginY: 1, width: "87%" }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            onClick={handleLoginWithOtp}
            sx={{ marginY: 0.15, width: "87%" }}
          >
            Login with OTP
          </Button>
        </>
      )}
    </Box>
  );
};
