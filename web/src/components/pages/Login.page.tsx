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
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Timer } from "../misc/Timer";
import {
  // UseQueryResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { AxiosError } from "axios";
import { url } from "../../assets/res";
import { AlertDialog } from "../misc/AlertDialog";
import { AuthContext } from "../../context/authContext";
import {
  LoginFormValues,
  getHouseIdQueryData,
  getUserIdByEmailQueryData,
  getUserNamesQueryData,
  loginQueryData,
} from "../../types/Login.types";

export const Login = () => {
  const { fetchNewUserDetails, verifyTokenData } = useContext(AuthContext);

  const [wing, setWing] = useState<"a" | "b" | null>(null);
  const [houseno, setHouseno] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number>(NaN);
  const [loginType, setLoginType] = useState<{
    secret: "otp" | "password";
    using: "house" | "email";
  }>({ secret: "otp", using: "house" });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otpProps, setOtpProps] = useState<{
    sent: boolean;
    sendAgain: boolean;
    time: Date | null;
  }>({
    sent: false,
    sendAgain: false,
    time: null,
  });
  const [loginData, setLoginData] = useState<{
    userid: number;
    otp?: number;
    password?: string;
  }>({ userid: NaN });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register: formRegister,
    handleSubmit,
    // control,
    formState: {
      errors,
      isValid,
      // isSubmitting,
      // isSubmitted,
      // isSubmitSuccessful,
    },
    reset: formReset,
  } = useForm<LoginFormValues>({ mode: "onChange" });

  const [queries, setQueries] = useState({
    getHouseIdQuery: {
      queryKey: ["getHouseId"],
      queryFn: async (
        wing: "a" | "b",
        houseno: number
      ): Promise<getHouseIdQueryData> => {
        return await axios({
          method: "GET",
          url: `${url}/house/details`,
          params: {
            wing,
            houseno,
          },
        }).then((res) => res.data);
      },
      resultData: null,
      enabled: false,
    },
    getUserIdByEmailQuery: {
      queryKey: ["getUserIdByEmail"],
      queryFn: async (email: string): Promise<getUserIdByEmailQueryData> => {
        return await axios({
          method: "GET",
          url: `${url}/user/details`,
          params: {
            email,
          },
        }).then((res) => {
          setUserId(res.data.userid);
          return res.data;
        });
      },
      resultData: null,
      enabled: false,
    },
    getUserNamesQuery: {
      queryKey: ["getUserNames"],
      queryFn: async (
        userIds: number[] | undefined
      ): Promise<getUserNamesQueryData> => {
        let users: getUserNamesQueryData = [];
        userIds?.forEach((userId) => users.push({ id: userId, name: "" }));
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
      queryFn: async (userid: number): Promise<void> => {
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
      queryFn: async (loginData: {
        userid: number;
        otp?: number;
        password?: string;
      }): Promise<loginQueryData> => {
        const { userid, otp, password } = loginData;

        let passwordString: string;
        if (password === undefined || password === null) {
          passwordString = JSON.stringify({ type: "otp", otp });
        } else {
          passwordString = JSON.stringify({ type: "password", password });
        }

        let bodyFormData = new FormData();
        bodyFormData.append("username", userid.toString());
        bodyFormData.append("password", passwordString);

        return await axios({
          method: "POST",
          url: `${url}/user/login`,
          data: bodyFormData,
          headers: { "Content-Type": "multipart/form-data" },
        }).then((res) => res.data);
      },
      resultData: null,
      enabled: false,
    },
  });

  const [
    {
      // isFetching: getHouseIdQueryIsFetching,
      data: getHouseIdQueryData,
      // isError: getHouseIdQueryIsError,
      // error: getHouseIdQueryError,
      // isSuccess: getHouseIdQueryIsSuccess,
    },
    {
      // isFetching: getUserIdByEmailQueryIsFetching,
      // data: getUserIdByEmailQueryData,
      isError: getUserIdByEmailQueryIsError,
      error: getUserIdByEmailQueryError,
      // isSuccess: getUserIdByEmailQueryIsSuccess,
    },
    {
      isFetching: getUserNamesQueryIsFetching,
      data: getUserNamesQueryData,
      // isError: getUserNamesQueryIsError,
      // error: getUserNamesQueryError,
      // isSuccess: getUserNamesQueryIsSuccess,
    },
    {
      isFetching: sendOTPQueryIsFetching,
      // data: sendOTPQueryData,
      // isError: sendOTPQueryIsError,
      // error: sendOTPQueryError,
      isSuccess: sendOTPQueryIsSuccess,
    },
    {
      isFetching: loginQueryIsFetching,
      // data: loginQueryData,
      isError: loginQueryIsError,
      error: loginQueryError,
      // isSuccess: loginQueryIsSuccess,
    },
  ] = [
    useQuery({
      queryKey: queries.getHouseIdQuery.queryKey,
      queryFn: async () => {
        if (wing !== null && houseno !== null) {
          return await queries.getHouseIdQuery.queryFn(wing, houseno);
        } else {
          const sample: getHouseIdQueryData = {};
          return Promise.resolve(sample);
        }
      },
      enabled: queries.getHouseIdQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (_err) => {
        setUserId(NaN);
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
      queryKey: queries.getUserIdByEmailQuery.queryKey,
      queryFn: async () => {
        if (email !== null) {
          return await queries.getUserIdByEmailQuery.queryFn(email);
        } else {
          const sample: getUserIdByEmailQueryData = {};
          return Promise.resolve(sample);
        }
      },
      enabled: queries.getUserIdByEmailQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (_err) => setUserId(NaN),
    }),
    useQuery({
      queryKey: queries.getUserNamesQuery.queryKey,
      queryFn: async (): Promise<getUserNamesQueryData> => {
        if (getHouseIdQueryData !== undefined) {
          return await queries.getUserNamesQuery.queryFn(
            getHouseIdQueryData.members
          );
        } else {
          const sample: getUserNamesQueryData = [];
          return Promise.resolve(sample);
        }
      },
      enabled: queries.getUserNamesQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (err) => console.log(err),
    }),
    useQuery({
      queryKey: queries.sendOTPQuery.queryKey,
      queryFn: async () => {
        if (!isNaN(userId)) {
          return await queries.sendOTPQuery.queryFn(userId);
        } else {
          return Promise.resolve();
        }
      },
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
      queryFn: async () => {
        if (loginData !== null && loginData.userid !== null) {
          return await queries.loginQuery.queryFn(loginData);
        } else {
          const sample: loginQueryData = {};
          return Promise.resolve(sample);
        }
      },
      enabled: queries.loginQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (err) => console.log(err),
      onSuccess: async (data) => {
        await fetchNewUserDetails({ userid: data.userid });
        await verifyTokenData({ token_data: data.token_data });
        navigate("/dashboard");
        // window.location.reload();
      },
    }),
  ];

  const onSubmit: SubmitHandler<LoginFormValues> = (formData) => {
    const { otp, password } = formData;
    if (!isNaN(userId)) {
      setLoginData(
        loginType.secret === "otp"
          ? { userid: userId, otp, password }
          : { userid: userId, password, otp }
      );
      setQueries((prevQueries) => ({
        ...prevQueries,
        loginQuery: { ...prevQueries.loginQuery, enabled: true },
      }));
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "center", sm: "flex-start" },
          marginTop: 12,
          marginLeft: { sm: 8 },
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
            Login using:
          </Typography>
          <FormControl
            disabled={sendOTPQueryIsFetching || loginQueryIsFetching}
          >
            <RadioGroup
              row
              value={loginType.using}
              onChange={(e) => {
                setLoginType((prevLoginType) => ({
                  ...prevLoginType,
                  using: e.target.value === "house" ? "house" : "email",
                }));
              }}
            >
              <FormControlLabel
                label="House details"
                value="house"
                control={<Radio />}
              />
              <FormControlLabel
                label="Email"
                value="email"
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>
        </Box>
        {loginType.using === "house" ? (
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
            <FormControl
              sx={{ mb: 1 }}
              disabled={sendOTPQueryIsFetching || loginQueryIsFetching}
            >
              <RadioGroup
                row
                value={wing}
                onChange={(e) => {
                  setWing(e.target.value === "a" ? "a" : "b");
                  if (houseno !== null && !isNaN(houseno)) {
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
        ) : (
          <></>
        )}
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
            {loginType.using === "house" ? (
              <>
                <TextField
                  sx={{
                    marginY: 1,
                    width: "87%",
                    maxWidth: "400px",
                    color: "primary",
                  }}
                  label="House no"
                  disabled={sendOTPQueryIsFetching || loginQueryIsFetching}
                  {...formRegister("houseno", {
                    required: {
                      value: loginType.using === "house",
                      message: "Please enter a house number.",
                    },
                    valueAsNumber: true,
                    onChange: (e) => {
                      if (!isNaN(parseInt(e.target.value))) {
                        setHouseno(e.target.value);
                        if (
                          wing !== null &&
                          houseno !== null &&
                          !isNaN(houseno)
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
                    // validate: (value) =>
                    //   isNaN(parseInt(value))
                    //     ? "Please enter a valid house number."
                    //     : true,
                  })}
                  error={!!errors.houseno}
                  helperText={errors.houseno?.message}
                />
                <FormControl
                  sx={{ width: "87%", maxWidth: "400px", marginY: 1 }}
                  disabled={
                    getUserNamesQueryData === undefined ||
                    sendOTPQueryIsFetching
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
                    value={isNaN(userId) ? "" : userId}
                    onChange={(e) => setUserId(e.target.value as number)}
                  >
                    {getUserNamesQueryData !== undefined
                      ? getUserNamesQueryData.map((user) => (
                          <MenuItem key={user.id!} value={user.id!}>
                            {user.name}
                          </MenuItem>
                        ))
                      : []}
                  </Select>
                </FormControl>
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
                  label="Email"
                  disabled={sendOTPQueryIsFetching || loginQueryIsFetching}
                  {...formRegister("email", {
                    required: {
                      value: loginType.using === "email",
                      message: "Please enter an email.",
                    },
                    pattern: {
                      value:
                        /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                      message: "Please enter a valid email.",
                    },
                    onChange: (e) => {
                      setEmail(e.target.value);
                      if (!errors.email) {
                        setQueries((prevQueries) => ({
                          ...prevQueries,
                          getUserIdByEmailQuery: {
                            ...prevQueries.getUserIdByEmailQuery,
                            enabled: true,
                          },
                        }));
                        queryClient.removeQueries({
                          queryKey: queries.getUserIdByEmailQuery.queryKey,
                          exact: true,
                        });
                      }
                    },
                  })}
                  error={!!errors.email}
                  helperText={
                    !!errors.email
                      ? errors.email?.message
                      : getUserIdByEmailQueryIsError &&
                        getUserIdByEmailQueryError instanceof AxiosError &&
                        getUserIdByEmailQueryError?.response?.status === 404 &&
                        getUserIdByEmailQueryError?.response?.data?.detail ===
                          "User not found"
                      ? "User with this email does not exist. Please register first."
                      : null
                  }
                />
              </>
            )}
            {loginType.secret === "otp" ? (
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
                    value: loginType.secret === "otp",
                    message: "Please enter an OTP.",
                  },
                  valueAsNumber: true,
                  validate: (value) =>
                    // isNaN(parseInt(value)) ||
                    value! < 1111 || value! > 9999
                      ? "Please enter a valid OTP."
                      : true,
                })}
                error={!!errors.otp}
                helperText={errors.otp?.message}
                InputProps={
                  loginType.secret === "otp"
                    ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            {!otpProps.sendAgain && otpProps.sent ? (
                              <Timer expiryTimestamp={otpProps.time!}>
                                {(isRunning, minutes, seconds) => {
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
                                  isNaN(userId) || sendOTPQueryIsFetching
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
                disabled={isNaN(userId)}
                {...formRegister("password", {
                  required: {
                    value: loginType.secret === "password",
                    message: "Please enter a password.",
                  },
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        disabled={isNaN(userId)}
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
                  setLoginType((prevLoginType) => ({
                    ...prevLoginType,
                    secret: prevLoginType.secret === "otp" ? "password" : "otp",
                  }))
                }
                sx={{
                  marginTop: { xs: 0.5, sm: 0.5, md: 1 },
                  width: "87%",
                  maxWidth: "400px",
                  color: "primary.main",
                }}
              >
                {loginType.secret === "otp" ? (
                  <>Login with Password</>
                ) : (
                  <>Login with OTP</>
                )}
              </Button>
            </Box>
          </Box>
        </form>

        <Button
          sx={{
            marginY: 1,
            width: "87%",
            maxWidth: "400px",
            color: "primary.main",
          }}
          onClick={() => navigate("/register/user")}
        >
          New User? Register Here
        </Button>

        <AlertDialog
          open={loginQueryIsError}
          title="Log in failed"
          content={
            <Typography variant="body2">
              {loginQueryError instanceof AxiosError &&
              loginQueryError?.response?.status === 400
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
                setUserId(NaN);
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
