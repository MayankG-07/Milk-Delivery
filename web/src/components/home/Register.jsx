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
import { PropTypes } from "prop-types";
import { useNavigate } from "react-router-dom";

export const Register = ({ boxStyles }) => {
  const [details, setDetails] = useState({
    wing: "",
    houseNo: "",
    email: "",
    password: { value: "", show: false },
    confirmPassword: { value: "", show: false },
  });

  const [registerLoading, setRegisterLoading] = useState(false);

  const navigate = useNavigate();

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
    <Box sx={boxStyles}>
      <Typography sx={{ paddingY: 2 }} variant="h5">
        Register
      </Typography>
      <Divider sx={{ marginBottom: 1, width: "87%" }} />
      <FormControl sx={{ width: "87%" }}>
        <FormLabel>Wing:</FormLabel>
        <RadioGroup
          value={useState.wing}
          onChange={(_event, newValue) =>
            setDetails((prevDetails) => ({ ...prevDetails, wing: newValue }))
          }
          sx={{ alignItems: "center", justifyContent: "center" }}
          row
        >
          <FormControlLabel value="a" control={<Radio />} label="A" />
          <FormControlLabel value="b" control={<Radio />} label="B" />
        </RadioGroup>
      </FormControl>
      <TextField
        sx={{ marginY: 1, width: "42.5%", marginX: 1 }}
        value={details.houseNo}
        label="House No"
        onChange={(event) => {
          if (!isNaN(parseInt(event.target.value))) {
            setDetails((prevDetails) => ({
              ...prevDetails,
              houseNo: parseInt(event.target.value),
            }));
          } else if (event.target.value === "") {
            setDetails((prevDetails) => ({ ...prevDetails, houseNo: "" }));
          }
        }}
      />
      <TextField
        sx={{ marginY: 1, width: "42.5%", marginX: 1 }}
        value={details.email}
        label="Email"
        type="email"
        onChange={(event) =>
          setDetails((prevDetails) => ({
            ...prevDetails,
            email: event.target.value,
          }))
        }
      />
      <TextField
        sx={{ marginY: 1, width: "42.5%", marginX: 1 }}
        value={details.password.value}
        label="Password"
        type={details.password.show ? "text" : "password"}
        onChange={(event) =>
          setDetails((prevDetails) => ({
            ...prevDetails,
            password: { ...prevDetails.password, value: event.target.value },
          }))
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() =>
                  setDetails((prevDetails) => ({
                    ...prevDetails,
                    password: {
                      ...prevDetails.password,
                      show: !prevDetails.password.show,
                    },
                  }))
                }
              >
                {details.password.show ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        sx={{ marginY: 1, width: "42.5%", marginX: 1 }}
        value={details.confirmPassword.value}
        label="Confirm Password"
        type={details.confirmPassword.show ? "text" : "password"}
        onChange={(event) =>
          setDetails((prevDetails) => ({
            ...prevDetails,
            confirmPassword: {
              ...prevDetails.confirmPassword,
              value: event.target.value,
            },
          }))
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() =>
                  setDetails((prevDetails) => ({
                    ...prevDetails,
                    confirmPassword: {
                      ...prevDetails.confirmPassword,
                      show: !prevDetails.confirmPassword.show,
                    },
                  }))
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

      <Button
        sx={{ marginY: 1, width: "87%" }}
        onClick={() => navigate("/login")}
      >
        Existing User? Login Here
      </Button>
    </Box>
  );
};

Register.propTypes = {
  boxStyles: PropTypes.object,
};
