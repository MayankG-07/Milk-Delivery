import {
  Box,
  Typography,
  Divider,
  FormControl,
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
import { useNavigate } from "react-router-dom";

export const RegisterHouse = () => {
  const [details, setDetails] = useState({
    wing: "",
    houseNo: "",
    email: "",
    password: { value: "", show: false },
    confirmPassword: { value: "", show: false },
  });

  const [registerLoading, setRegisterLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegisterHouse = () => {
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: { xs: "center", sm: "flex-start" },
        marginTop: 12,
        marginLeft: { sm: 10 },
      }}
    >
      <Typography sx={{ paddingY: 2 }} variant="h5">
        Register House
      </Typography>
      <Divider
        sx={{
          display: { xs: "flex" },
          marginBottom: { xs: 0.5, sm: 2 },
          width: { sx: "80%", sm: "40%" },
        }}
      />
      <Box sx={{ display: "flex", flexDirection: "row", width: "auto" }}>
        <Typography
          variant="body1"
          color="text.primary"
          sx={{
            marginTop: 1,
            marginRight: 1.5,
          }}
        >
          Wing:
        </Typography>
        <FormControl sx={{ marginBottom: 1 }}>
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
      </Box>
      <TextField
        sx={{ marginY: 1, width: "87%", maxWidth: "400px", color: "primary" }}
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
        sx={{ marginY: 1, width: "87%", maxWidth: "400px", color: "primary" }}
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
        sx={{ marginY: 1, width: "87%", maxWidth: "400px", color: "primary" }}
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
        sx={{ marginY: 1, width: "87%", maxWidth: "400px", color: "primary" }}
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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: { xs: "center", sm: "flex-start" },
          justifyContent: { xs: "center", md: "center" },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "inherit",
            display: { xs: "flex", sm: "block" },
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={handleRegisterHouse}
            sx={{
              marginY: 1,
              width: "87%",
              maxWidth: "400px",
              color: "primary",
            }}
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
                left: { xs: "50%", sm: "200px" },
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Box>

        <Button
          sx={{
            marginTop: { xs: 0.5, sm: 0.5, md: 1 },
            width: "87%",
            maxWidth: "400px",
            color: "primary",
          }}
          onClick={() => navigate("/login")}
          variant="outlined"
        >
          Existing User? Login Here
        </Button>
      </Box>
    </Box>
  );
};
