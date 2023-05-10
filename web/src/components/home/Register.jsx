import {
  Box,
  Typography,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { url } from "../../assets/res";

export const Register = () => {
  const [details, setDetails] = useState({
    wing: "",
    houseNo: "",
    email: "",
    password: { value: "", show: false },
    confirmPassword: { value: "", show: false },
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleRegister = () => {
    if (!details.wing || !details.houseNo || !details.email) {
      alert("Please enter valid details");
      return;
    } else if (details.password.value !== details.confirmPassword.value) {
      alert("Passwords do not match");
      return;
    }

    setRegisterLoading(true);

    axios
      .post(`${url}/api/register`, {
        wing: details.wing,
        houseno: details.houseNo,
        email: details.email,
        password: details.password.value,
      })
      .then((res) => {
        setRegisterLoading(false);
        if (res.data.success) {
          register();
          return;
        } else if (res.data.error === "DUPLICATE_HOUSENO") {
          alert("User already exists");
          return;
        } else {
          alert("An error occurred");
          console.log(res.data.error);
          return;
        }
      })
      .catch((error) => {
        setRegisterLoading(false);
        alert("An error occurred");
        console.log(error);
      });
  };

  const register = () => {
    // TODO register redirect code goes here
  };

  return (
    <Box>
      <Typography sx={{ paddingY: 2 }} variant="h5">
        Register
      </Typography>
      <Divider sx={{ marginBottom: 1 }} />
      <FormControl>
        <FormLabel>Wing:</FormLabel>
        <RadioGroup
          value={useState.wing}
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
        sx={{ marginY: 1, width: "87%" }}
        value={details.houseNo}
        label="House No"
        onChange={(event) => {
          if (!isNaN(parseInt(event.target.value))) {
            setDetails({ ...details, houseNo: parseInt(event.target.value) });
          } else if (event.target.value === "") {
            setDetails({ ...details, houseNo: "" });
          }
        }}
      />
      <TextField
        sx={{ marginY: 1, width: "87%" }}
        value={details.email}
        label="Email"
        type="email"
        onChange={(event) =>
          setDetails({ ...details, email: event.target.value })
        }
      />
      <TextField
        sx={{ marginY: 1, width: "87%" }}
        value={details.password.value}
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
      <TextField
        sx={{ marginY: 1, width: "87%" }}
        value={details.confirmPassword.value}
        label="Confirm Password"
        type={details.confirmPassword.show ? "text" : "password"}
        onChange={(event) =>
          setDetails({
            ...details,
            confirmPassword: {
              ...details.confirmPassword,
              value: event.target.value,
            },
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
                    confirmPassword: {
                      ...details.confirmPassword,
                      show: !details.confirmPassword.show,
                    },
                  })
                }
              >
                {details.confirmPassword.show ? (
                  <VisibilityOff />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ position: "relative" }}>
        <Button
          variant="contained"
          onClick={handleRegister}
          sx={{ marginY: 1, width: "87%" }}
          disabled={registerLoading}
        >
          Register
        </Button>
        {registerLoading && (
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
    </Box>
  );
};
