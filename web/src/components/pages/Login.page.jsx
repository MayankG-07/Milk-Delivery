/* eslint-disable no-unused-vars */
// import { DevTool } from "@hookform/devtools";
import {
  Box,
  Typography,
  Divider,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Timer } from "../misc/Timer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { url } from "../../assets/res";
import { AlertDialog } from "../misc/AlertDialog";
import { UserContext } from "../../context/userContext";

export const Login = () => {
  const { userDetails, fetchNewUserDetails, verifyTokenData } =
    useContext(UserContext);

  const [wing, setWing] = useState(null);
  const [houseno, setHouseno] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loginType, setLoginType] = useState("otp");
  const [showPassword, setShowPassword] = useState(false);
  const [otpProps, setOtpProps] = useState({
    sent: false,
    sendAgain: false,
    time: null,
  });
  const [loginData, setLoginData] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register: formRegister,
    handleSubmit,
    // control,
    formState: {
      errors,
      isValid,
      isSubmitting,
      isSubmitted,
      isSubmitSuccessful,
    },
    reset: formReset,
  } = useForm({ mode: "onChange" });

  const [queries, setQueries] = useState({
    getHouseIdQuery: {
      queryKey: ["getHouseId"],
      queryFn: async (wing, houseno) => {
        return await axios({
          method: "GET",
          url: `${url}/house/details`,
          params: {
            wing,
            houseno,
          },
        });
      },
      resultData: null,
      enabled: false,
    },
    getUserNamesQuery: {
      queryKey: ["getUserNames"],
      queryFn: async (userIds) => {
        let users = [];
        userIds.forEach((userId) => users.push({ id: userId, name: null }));
        for (let i = 0; i < users.length; i++) {
          await axios({
            method: "GET",
            url: `${url}/user/details`,
            params: {
              userid: users[i].id,
            },
          }).then((res) => {
            users[i].name = res.data.name;
          });
        }

        return users;
      },
      resultData: null,
      enabled: false,
    },
    sendOTPQuery: {
      queryKey: ["sendOTP"],
      queryFn: async (userid) => {
        return await axios({
          method: "POST",
          url: `${url}/user/send-otp`,
          params: { userid },
        });
      },
      resultData: null,
      enabled: false,
    },
    loginQuery: {
      queryKey: ["login"],
      queryFn: async (loginData) => {
        const { userid, otp, password } = loginData;

        let passwordString;
        if (password === undefined || password === null) {
          passwordString = JSON.stringify({ type: "otp", otp });
        } else {
          passwordString = JSON.stringify({ type: "password", password });
        }

        let bodyFormData = new FormData();
        bodyFormData.append("username", userid);
        bodyFormData.append("password", passwordString);

        return await axios({
          method: "POST",
          url: `${url}/user/login`,
          data: bodyFormData,
          headers: { "Content-Type": "multipart/form-data" },
        });
      },
      resultData: null,
      enabled: false,
    },
  });

  const [
    {
      isFetching: getHouseIdQueryIsFetching,
      data: getHouseIdQueryData,
      isError: getHouseIdQueryIsError,
      error: getHouseIdQueryError,
      isSuccess: getHouseIdQueryIsSuccess,
    },
    {
      isFetching: getUserNamesQueryIsFetching,
      data: getUserNamesQueryData,
      isError: getUserNamesQueryIsError,
      error: getUserNamesQueryError,
      isSuccess: getUserNamesQueryIsSuccess,
    },
    {
      isFetching: sendOTPQueryIsFetching,
      data: sendOTPQueryData,
      isError: sendOTPQueryIsError,
      error: sendOTPQueryError,
      isSuccess: sendOTPQueryIsSuccess,
    },
    {
      isFetching: loginQueryIsFetching,
      data: loginQueryData,
      isError: loginQueryIsError,
      error: loginQueryError,
      isSuccess: loginQueryIsSuccess,
    },
  ] = [
    useQuery({
      queryKey: queries.getHouseIdQuery.queryKey,
      queryFn: async () => await queries.getHouseIdQuery.queryFn(wing, houseno),
      enabled: queries.getHouseIdQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (_err) => {
        setUserId(null);
        setQueries((prevQueries) => ({
          ...prevQueries,
          getUserNamesQuery: {
            ...prevQueries.getUserNamesQuery,
            enabled: false,
          },
        }));
        queryClient.removeQueries({
          queryKey: queries.getUserNamesQuery.queryKey,
        });
        setOtpProps({ sent: false, sendAgain: false, time: null });
      },
      onSuccess: (_res) => {
        // setUserIds(res.data.members);
        setQueries((prevQueries) => ({
          ...prevQueries,
          getUserNamesQuery: {
            ...prevQueries.getUserNamesQuery,
            enabled: true,
          },
        }));
      },
    }),
    useQuery({
      queryKey: queries.getUserNamesQuery.queryKey,
      queryFn: async () =>
        await queries.getUserNamesQuery.queryFn(
          getHouseIdQueryData?.data?.members
        ),
      enabled: queries.getUserNamesQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (err) => console.log(err),
    }),
    useQuery({
      queryKey: queries.sendOTPQuery.queryKey,
      queryFn: async () => queries.sendOTPQuery.queryFn(userId),
      enabled: queries.sendOTPQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (err) => console.log(err),
      onSuccess: (_res) => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + 300);
        setOtpProps((prevProps) => ({
          ...prevProps,
          sendAgain: false,
          time,
          sent: true,
        }));

        setQueries((prevQueries) => ({
          ...prevQueries,
          sendOTPQuery: {
            ...prevQueries.sendOTPQuery,
            enabled: false,
          },
        }));
      },
    }),
    useQuery({
      queryKey: queries.loginQuery.queryKey,
      queryFn: async () => await queries.loginQuery.queryFn(loginData),
      enabled: queries.loginQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (err) => console.log(err),
      onSuccess: (res) => {
        console.log(res.data);
        fetchNewUserDetails({ userid: res.data.userid });
        verifyTokenData({ token_data: res.data.token_data });
        navigate("/dashboard");
      },
    }),
  ];

  const onSubmit = (formData) => {
    const { otp, password } = formData;
    setLoginData(
      loginType === "otp"
        ? { userid: userId, otp }
        : { userid: userId, password }
    );
    setQueries((prevQueries) => ({
      ...prevQueries,
      loginQuery: { ...prevQueries.loginQuery, enabled: true },
    }));
  };

  return (
    <>
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
          <FormControl sx={{ mb: 1 }} disabled={sendOTPQueryIsFetching}>
            <RadioGroup
              row
              value={wing}
              onChange={(e) => {
                setWing(e.target.value);
                if (houseno !== null && !isNaN(houseno) && houseno !== "") {
                  setQueries((prevQueries) => ({
                    ...prevQueries,
                    getHouseIdQuery: {
                      ...prevQueries.getHouseIdQuery,
                      enabled: true,
                    },
                  }));
                  queryClient.removeQueries({
                    queryKey: queries.getHouseIdQuery.queryKey,
                    exact: true,
                  });
                }
              }}
            >
              <FormControlLabel label="A" value="a" control={<Radio />} />
              <FormControlLabel label="B" value="b" control={<Radio />} />
            </RadioGroup>
          </FormControl>
        </Box>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ width: "100%", maxWidth: "460px" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
            }}
          >
            <TextField
              sx={{
                marginY: 1,
                width: "87%",
                maxWidth: "400px",
                color: "primary",
              }}
              label="House no"
              disabled={sendOTPQueryIsFetching}
              {...formRegister("houseno", {
                required: {
                  value: true,
                  message: "Please enter a house number.",
                },
                valueAsNumber: true,
                onChange: (e) => {
                  if (!isNaN(parseInt(e.target.value))) {
                    setHouseno(e.target.value);
                    if (
                      wing !== null &&
                      houseno !== null &&
                      !isNaN(houseno) &&
                      houseno !== ""
                    ) {
                      setQueries((prevQueries) => ({
                        ...prevQueries,
                        getHouseIdQuery: {
                          ...prevQueries.getHouseIdQuery,
                          enabled: true,
                        },
                      }));
                      queryClient.removeQueries({
                        queryKey: queries.getHouseIdQuery.queryKey,
                        exact: true,
                      });
                    }
                  }
                },
                validate: (value) =>
                  isNaN(parseInt(value))
                    ? "Please enter a valid house number."
                    : true,
              })}
              error={!!errors.houseno}
              helperText={errors.houseno?.message}
              InputProps={
                loginType === "otp"
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          {!otpProps.sendAgain && otpProps.sent ? (
                            <Timer expiryTimestamp={otpProps.time}>
                              {(minutes, seconds, isRunning) => {
                                if (isRunning) {
                                  return (
                                    <Chip
                                      sx={{ color: "primary" }}
                                      label={`Resend in ${minutes}:${seconds}`}
                                      disabled={true}
                                    />
                                  );
                                } else {
                                  setOtpProps((prevProps) => ({
                                    ...prevProps,
                                    sendAgain: true,
                                    time: null,
                                  }));

                                  queryClient.removeQueries({
                                    queryKey: queries.sendOTPQuery.queryKey,
                                    exact: true,
                                  });
                                }
                              }}
                            </Timer>
                          ) : (
                            <Chip
                              sx={{ color: "primary" }}
                              label={
                                sendOTPQueryIsFetching
                                  ? "Sending..."
                                  : otpProps.sent
                                  ? "Resend OTP"
                                  : "Send OTP"
                              }
                              disabled={
                                userId === null || sendOTPQueryIsFetching
                              }
                              clickable={!sendOTPQueryIsFetching}
                              onClick={() =>
                                setQueries((prevQueries) => ({
                                  ...prevQueries,
                                  sendOTPQuery: {
                                    ...prevQueries.sendOTPQuery,
                                    enabled: true,
                                  },
                                }))
                              }
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
              disabled={
                getUserNamesQueryData === undefined || sendOTPQueryIsFetching
              }
            >
              <InputLabel id="select-member-label">
                {getUserNamesQueryData !== undefined
                  ? "Select member"
                  : getUserNamesQueryIsFetching
                  ? "Loading members..."
                  : "Enter a valid house no"}
              </InputLabel>
              <Select
                labelId="select-member-label"
                label={
                  getUserNamesQueryData !== undefined
                    ? "Select member"
                    : getUserNamesQueryIsFetching
                    ? "Loading members..."
                    : "Enter a valid house no to select member"
                }
                value={userId === null ? "" : userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                {getUserNamesQueryData !== undefined
                  ? getUserNamesQueryData.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))
                  : []}
              </Select>
            </FormControl>
            {loginType === "otp" ? (
              <TextField
                sx={{
                  marginY: 1,
                  width: "87%",
                  maxWidth: "400px",
                  color: "primary",
                }}
                label="OTP"
                disabled={
                  sendOTPQueryIsSuccess === undefined || !sendOTPQueryIsSuccess
                }
                {...formRegister("otp", {
                  required: {
                    value: loginType === "otp",
                    message: "Please enter an OTP.",
                  },
                  valueAsNumber: true,
                  validate: (value) =>
                    isNaN(parseInt(value)) ||
                    parseInt(value) < 1111 ||
                    parseInt(value) > 9999
                      ? "Please enter a valid OTP."
                      : true,
                })}
                error={!!errors.otp}
                helperText={errors.otp?.message}
              />
            ) : (
              <TextField
                sx={{
                  marginY: 1,
                  width: "87%",
                  maxWidth: "400px",
                  color: "primary",
                }}
                label="Password"
                type={showPassword ? "text" : "password"}
                disabled={userId === null}
                {...formRegister("password", {
                  required: {
                    value: loginType === "password",
                    message: "Please enter a password.",
                  },
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        disabled={userId === null}
                        onClick={() => setShowPassword((prevShow) => !prevShow)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
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
                  type="submit"
                  sx={{
                    marginY: 1,
                    width: "87%",
                    maxWidth: "400px",
                    color: "primary",
                  }}
                  disabled={!isValid || loginQueryIsFetching}
                >
                  Login
                </Button>
                {loginQueryIsFetching && (
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
                  setLoginType((prevLoginType) =>
                    prevLoginType === "otp" ? "password" : "otp"
                  )
                }
                sx={{
                  marginTop: { xs: 0.5, sm: 0.5, md: 1 },
                  width: "87%",
                  maxWidth: "400px",
                  color: "primary",
                }}
              >
                {loginType === "otp" ? (
                  <>Login with Password</>
                ) : (
                  <>Login with OTP</>
                )}
              </Button>

              <Button
                sx={{
                  marginY: 1,
                  width: "87%",
                  maxWidth: "400px",
                  color: "primary",
                }}
                onClick={() => navigate("/register/user")}
              >
                New User? Register Here
              </Button>
            </Box>
          </Box>
        </form>

        <AlertDialog
          open={loginQueryIsError}
          title="Log in failed"
          content={
            <Typography variant="body2">
              {loginQueryError?.response?.status === 400
                ? loginQueryError?.response?.data.detail === "Invalid data"
                  ? "An error occurred. Please try again after sometime."
                  : "The credentials that you entered are incorrect. Please check them again and try again."
                : "An error occurred. Please try again after some time."}
            </Typography>
          }
          showActions={true}
          actions={[
            {
              text: "OK",
              onclick: () => {
                formReset();
                setWing(null);
                setUserId(null);
                setQueries((prevQueries) => ({
                  ...prevQueries,
                  getHouseIdQuery: {
                    ...prevQueries.getHouseIdQuery,
                    enabled: false,
                  },
                  getUserNamesQuery: {
                    ...prevQueries.getUserNamesQuery,
                    enabled: false,
                  },
                  sendOTPQuery: { ...prevQueries.sendOTPQuery, enabled: false },
                  loginQuery: { ...prevQueries.loginQuery, enabled: false },
                }));

                queryClient.removeQueries({
                  queryKey: queries.getHouseIdQuery.queryKey,
                  exact: true,
                });
                queryClient.removeQueries({
                  queryKey: queries.getUserNamesQuery.queryKey,
                  exact: true,
                });
                queryClient.removeQueries({
                  queryKey: queries.sendOTPQuery.queryKey,
                  exact: true,
                });
                queryClient.removeQueries({
                  queryKey: queries.loginQuery.queryKey,
                  exact: true,
                });
              },
            },
          ]}
        />
      </Box>

      {/* <DevTool control={control} /> */}
    </>
  );
};
