import { useState, useEffect } from "react";
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Timer } from "../misc/Timer";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [details, setDetails] = useState({
    houseid: null,
    wing: null,
    houseno: null,
    memberId: null,
    password: { value: null, show: false },
  });

  const [memberDetails, setMemberDetails] = useState({
    loading: false,
    members: [],
    called: false,
  });

  useEffect(() => {
    // get house id from db
    if (
      !(details.wing === null) &&
      !(details.houseno === null) &&
      details.houseid === null
    ) {
      axios
        .put(`${url}/misc/sql-query`, null, {
          params: {
            query: `SELECT houseid FROM houses WHERE wing='${details.wing}' AND houseno=${details.houseno}`,
          },
        })
        .then((res) => {
          if (!(res.data.data.length === 0)) {
            const houseid = res.data.data[0][0];
            setDetails((prevDetails) => ({ ...prevDetails, houseid }));
          }
        })
        .catch((err) => console.log(err));
    }

    // get members from db
    if (!(details.houseid === null) && !memberDetails.called) {
      let called = false;
      setMemberDetails((prevDetails) => ({
        ...prevDetails,
        loading: true,
      }));
      axios
        .get(`${url}/house/${details.houseid}/details`)
        .then((res) => {
          const memberIds = res.data.members;
          let members = [];

          memberIds.forEach((memberId) => {
            members.push({
              id: memberId,
              name: null,
            });
          });

          setMemberDetails((prevDetails) => ({
            ...prevDetails,
            members,
          }));
        })
        .catch((err) => {
          console.log(err);
          setMemberDetails((prevDetails) => ({
            ...prevDetails,
            loading: false,
          }));
        });

      // getting member names
      if (memberDetails.loading) {
        for (let i = 0; i < memberDetails.members.length; i++) {
          called = true;
          if (!memberDetails.loading) {
            break;
          }
          const userid = memberDetails.members[i].id;
          console.log("call for user details", userid);
          axios
            .get(`${url}/user/${userid}/details`)
            .then((res) => {
              setMemberDetails((prevDetails) => ({
                ...prevDetails,
                members: prevDetails.members.map((item) =>
                  item.id === userid
                    ? {
                        id: item.id,
                        name: res.data.name,
                        email: res.data.email,
                      }
                    : item
                ),
              }));
            })
            .catch((err) => {
              console.log(err);
              setMemberDetails((prevDetails) => ({
                ...prevDetails,
                loading: false,
              }));
            });
        }

        setMemberDetails((prevDetails) => ({
          ...prevDetails,
          loading: false,
          called,
        }));
      }
    }
  }, [
    details.wing,
    details.houseno,
    details.houseid,
    memberDetails.called,
    memberDetails.loading,
    memberDetails.members,
  ]);

  const [otp, setOtp] = useState({
    sent: false,
    loading: false,
    sendAgain: false,
    time: null,
    value: null,
  });

  const [loginType, setLoginType] = useState({ loading: false, withOtp: true });

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setOtp((prevOtp) => ({ ...prevOtp, loading: true }));

    await axios({
      method: "POST",
      url: `${url}/user/${details.memberId}/send-otp`,
    })
      .then((res) => {
        setOtp((prevOtp) => ({ ...prevOtp, loading: false }));

        if (res.status === 204) {
          const time = new Date();
          time.setSeconds(time.getSeconds() + 300);

          setOtp((prevOtp) => ({
            ...prevOtp,
            sent: true,
            sendAgain: false,
            time,
          }));
          return;
        }
      })
      .catch((error) => {
        setOtp((prevOtp) => ({ ...prevOtp, loading: false }));

        if (
          error.response.status === 400 &&
          error.response.data.detail === "Invalid userid"
        ) {
          alert("This member does not exist. Please contact the admin.");
        }
      });
  };

  const handleLoginOtp = async () => {
    setLoginType({ ...loginType, loading: true });
    var otpFormData = new FormData();
    let email = "";
    for (let i = 0; i < memberDetails.members.length; i++) {
      if (memberDetails.members[i].id === details.memberId) {
        email = memberDetails.members[i].email;
      }
    }

    otpFormData.append("username", email);
    otpFormData.append("password", otp.value);
    await axios({
      method: "POST",
      url: `${url}/user/login/otp`,
      data: otpFormData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        setLoginType((prevLoginType) => ({ ...prevLoginType, loading: false }));
        if (
          res.data.access_token &&
          res.data.refresh_token &&
          res.status === 200
        ) {
          login();
          return;
        }
      })
      .catch((error) => {
        setLoginType((prevLoginType) => ({ ...prevLoginType, loading: false }));
        if (
          error.response.status === 400 &&
          error.response.data.detail === "Invalid OTP"
        ) {
          alert(
            "The OTP you entered is invalid. Please check the OTP you have entered."
          );
        }

        return;
      });
  };

  const handleLoginPassword = async () => {
    if (details.password.show) {
      setDetails((prevDetails) => ({
        ...prevDetails,
        password: { ...prevDetails.password, show: false },
      }));
    }

    setLoginType((prevLoginType) => ({ ...prevLoginType, loading: true }));

    var passwordFormData = new FormData();
    let email = "";
    for (let i = 0; i < memberDetails.members.length; i++) {
      if (memberDetails.members[i].id === details.memberId) {
        email = memberDetails.members[i].email;
      }
    }

    passwordFormData.append("username", email);
    passwordFormData.append("password", details.password.value);
    await axios({
      method: "POST",
      url: `${url}/user/login/password`,
      data: passwordFormData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        setLoginType((prevLoginType) => ({ ...prevLoginType, loading: false }));

        if (
          res.status === 200 &&
          res.data.access_token &&
          res.data.refresh_token
        ) {
          login();
          return;
        }
      })
      .catch((error) => {
        setLoginType((prevLoginType) => ({ ...prevLoginType, loading: false }));

        if (
          error.response.status === 400 &&
          error.response.data.detail === "Invalid password"
        ) {
          alert(
            "The house details or password you have entered is/are incorrect. Please check the details or password you have entered."
          );
        }
        return;
      });
  };

  const login = async () => {
    // TODO login redirect code goes here
    console.log("Logged in successfully");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: { xs: "center", sm: "flex-start" },
        marginTop: { xs: "22%", sm: 12 },
        marginLeft: { sm: 10 },
      }}
    >
      <Typography sx={{ paddingY: 2 }} variant="h5">
        Login
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
        <FormControl disabled={otp.loading} sx={{ marginBottom: 1 }}>
          <RadioGroup
            value={details.wing ? details.wing : ""}
            onChange={(_event, newValue) => {
              setDetails((prevDetails) => ({
                ...prevDetails,
                wing: newValue,
                houseid: null,
                memberId: null,
              }));
              setMemberDetails((prevDetails) => ({
                ...prevDetails,
                members: [],
                called: false,
              }));
              setOtp({
                sent: false,
                loading: false,
                sendAgain: false,
                time: null,
                value: null,
                sentValue: null,
              });
            }}
            row
          >
            <FormControlLabel value="a" control={<Radio />} label="A" />
            <FormControlLabel value="b" control={<Radio />} label="B" />
          </RadioGroup>
        </FormControl>
      </Box>
      <TextField
        sx={{ marginY: 1, width: "87%", maxWidth: "400px", color: "primary" }}
        value={details.houseno ? details.houseno : ""}
        label="House No"
        onChange={(event) => {
          if (!isNaN(parseInt(event.target.value))) {
            setDetails((prevDetails) => ({
              ...prevDetails,
              houseno: parseInt(event.target.value),
            }));
          } else if (event.target.value === "") {
            setDetails((prevDetails) => ({ ...prevDetails, houseno: null }));
          }
          setDetails((prevDetails) => ({
            ...prevDetails,
            houseid: null,
            memberId: null,
          }));
          setMemberDetails((prevDetails) => ({
            ...prevDetails,
            members: [],
            called: false,
          }));
          setOtp({
            sent: false,
            loading: false,
            sendAgain: false,
            time: null,
            value: null,
            sentValue: null,
          });
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
                            setOtp((prevOtp) => ({
                              ...prevOtp,
                              sendAgain: true,
                              time: null,
                            }));
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
                        disabled={otp.loading || details.memberId === null}
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
      <FormControl
        sx={{ width: "87%", maxWidth: "400px", marginY: 1 }}
        disabled={!memberDetails.called || otp.loading}
      >
        <InputLabel id="member-select-label">
          {memberDetails.loading && details.houseid
            ? "Loading Members..."
            : "Select Member"}
        </InputLabel>
        <Select
          labelId="member-select-label"
          id="member-select"
          value={!(details.memberId === null) ? details.memberId : ""}
          label={
            memberDetails.loading && details.houseid
              ? "Loading Members..."
              : "Select Member"
          }
          onChange={(event) =>
            setDetails((prevDetails) => ({
              ...prevDetails,
              memberId: event.target.value,
            }))
          }
        >
          {!memberDetails.loading && details.houseid
            ? memberDetails.members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))
            : []}
        </Select>
      </FormControl>
      {loginType.withOtp ? (
        <>
          <TextField
            sx={{
              marginY: 1,
              width: "87%",
              maxWidth: "400px",
              color: "primary",
            }}
            value={otp.value ? otp.value : ""}
            label="OTP"
            onChange={(event) => {
              if (!isNaN(parseInt(event.target.value))) {
                setOtp((prevOtp) => ({
                  ...prevOtp,
                  value: parseInt(event.target.value),
                }));
              } else if (event.target.value === "") {
                setOtp((prevOtp) => ({ ...prevOtp, value: null }));
              }
            }}
            disabled={!otp.sent}
          />
        </>
      ) : (
        <>
          <TextField
            sx={{
              marginY: 1,
              width: "87%",
              maxWidth: "400px",
              color: "primary",
            }}
            value={details.password.value ? details.password.value : ""}
            label="Password"
            type={details.password.show ? "text" : "password"}
            disabled={!details.memberId}
            onChange={(event) =>
              setDetails((prevDetails) => ({
                ...prevDetails,
                password: {
                  ...prevDetails.password,
                  value: event.target.value,
                },
              }))
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    disabled={!details.memberId}
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
        </>
      )}

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
            onClick={loginType.withOtp ? handleLoginOtp : handleLoginPassword}
            sx={{
              marginY: 1,
              width: "87%",
              maxWidth: "400px",
              color: "primary",
            }}
            disabled={
              loginType.loading
                ? true
                : loginType.withOtp
                ? !details.houseid ||
                  !otp.value ||
                  otp.value < 1000 ||
                  otp.value > 9999
                : !details.houseid || !details.password.value
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
                left: { xs: "50%", sm: "200px" },
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Box>
        <Button
          variant="outlined"
          onClick={() =>
            setLoginType((prevLoginType) => ({
              ...prevLoginType,
              withOtp: !prevLoginType.withOtp,
            }))
          }
          sx={{
            marginTop: { xs: 0.5, sm: 0.5, md: 1 },
            width: "87%",
            maxWidth: "400px",
            color: "primary",
          }}
        >
          {loginType.withOtp ? <>Login with Password</> : <>Login with OTP</>}
        </Button>

        <Button
          sx={{
            marginY: 1,
            width: "87%",
            maxWidth: "400px",
            color: "primary",
          }}
          onClick={() => navigate("/register")}
        >
          New User? Register Here
        </Button>
      </Box>
    </Box>
  );
};
