import { DevTool } from "@hookform/devtools";
import {
  Box,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { url } from "./../../assets/res";
import { useNavigate } from "react-router-dom";
import { AlertDialog } from "../misc/AlertDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FetchError } from "../../classes/fetchError";

export const RegisterUser = () => {
  const fetchRegisterUser = async () => {
    return await axios({
      method: "POST",
      url: `${url}/user/register`,
      data: queries.registerUserQuery.data,
    }).then((res) => {
      if (res.status === 201) {
        return res.data;
      } else {
        throw new FetchError(res);
      }
    });
  };

  const [pwd, setPwd] = useState({
    password: { value: null, show: false },
    confirmPassword: { value: null, show: false },
  });

  const queryClient = useQueryClient();
  const [queries, setQueries] = useState({
    registerUserQuery: {
      queryKey: ["/user/register"],
      enabled: false,
      data: {
        name: "",
        email: "",
        phone: "",
        password: "",
      },
    },
  });

  const {
    isFetching: registerUserQueryIsFetching,
    // data: registerUserQueryData,
    isError: registerUserQueryIsError,
    // error: registerUserQueryError,
    isSuccess: registerUserQueryIsSuccess,
  } = useQuery({
    queryKey: queries.registerUserQuery.queryKey,
    queryFn: fetchRegisterUser,
    enabled: queries.registerUserQuery.enabled,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.log(err.response?.status);
      console.log(err.response?.data.detail);
      // setError("errorBlock", {
      //   type: "api-error",
      //   message: JSON.stringify(err.data),
      // });
    },
  });

  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    control,
    formState: {
      errors,
      isValid,
      isSubmitting,
      // isSubmitted,
      // isSubmitSuccessful,
    },
    // setError,
    reset,
  } = useForm({ mode: "onChange" });

  const onSubmit = async (formData) => {
    setQueries((prevQueries) => ({
      ...prevQueries,
      registerUserQuery: {
        ...prevQueries.registerUserQuery,
        enabled: true,
        data: formData,
      },
    }));
  };

  return (
    <>
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
          Register User
        </Typography>
        <Divider
          sx={{
            display: { xs: "flex" },
            marginBottom: { xs: 0.5, sm: 2 },
            width: { sx: "80%", sm: "40%" },
          }}
        />
        <form
          onSubmit={handleSubmit(async (data) => await onSubmit(data))}
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
              label="Name"
              {...formRegister("name", {
                required: {
                  value: true,
                  message: "Please enter a name",
                },
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              sx={{
                marginY: 1,
                width: "87%",
                maxWidth: "400px",
                color: "primary",
              }}
              label="Email"
              {...formRegister("email", {
                required: {
                  value: true,
                  message: "Please enter an email",
                },
                pattern: {
                  value:
                    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                  message: "Please enter a valid email",
                },
                validate: async (value) => {
                  let found;
                  await axios({
                    method: "GET",
                    url: `${url}/user/details`,
                    params: { email: value },
                  })
                    .then((res) => {
                      found = true
                        ? res.status === 200 && res.data.userid
                        : found;
                    })
                    .catch((err) => {
                      found = false
                        ? err.response.status === 404 &&
                          err.response.data.detail === "User not found"
                        : found;
                    });

                  return found ? "User with this email already exists" : true;
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              sx={{
                marginY: 1,
                width: "87%",
                maxWidth: "400px",
                color: "primary",
              }}
              label="Phone"
              {...formRegister("phone", {
                required: {
                  value: true,
                  message: "Please enter a phone number",
                },
                pattern: {
                  value: /^\d+$/,
                  message: "Please enter a valid phone number",
                },
                validate: {
                  fetchPhone: async (value) => {
                    let found;
                    await axios({
                      method: "GET",
                      url: `${url}/user/details`,
                      params: { phone: value.toString() },
                    })
                      .then((res) => {
                        found = true
                          ? res.status === 200 && res.data.userid
                          : found;
                      })
                      .catch((err) => {
                        found = false
                          ? err.response.status === 404 &&
                            err.response.data.detail === "User not found"
                          : found;
                      });

                    return found ? "User with this phone already exists" : true;
                  },
                  phoneLength: (value) =>
                    value.length === 10 || "Please enter a valid phone number",
                },
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
            <TextField
              sx={{
                marginY: 1,
                width: "87%",
                maxWidth: "400px",
                color: "primary",
              }}
              id="password"
              type={pwd.password.show ? "text" : "password"}
              label="Password"
              {...formRegister("password", {
                required: {
                  value: true,
                  message: "Please enter a password",
                },
                onChange: (e) =>
                  setPwd((prevPwd) => ({
                    ...prevPwd,
                    password: { ...prevPwd.password, value: e.target.value },
                  })),
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() =>
                        setPwd((prevPwd) => ({
                          ...prevPwd,
                          password: {
                            ...prevPwd.password,
                            show: !prevPwd.password.show,
                          },
                        }))
                      }
                    >
                      {pwd.password.show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              sx={{
                marginY: 1,
                width: "87%",
                maxWidth: "400px",
                color: "primary",
              }}
              type={pwd.confirmPassword.show ? "text" : "password"}
              id="confirmPassword"
              label="Confirm Password"
              {...formRegister("confirmPassword", {
                required: {
                  value: true,
                  message: "Please enter a password",
                },
                onChange: (e) =>
                  setPwd((prevPwd) => ({
                    ...prevPwd,
                    confirmPassword: {
                      ...prevPwd.confirmPassword,
                      value: e.target.value,
                    },
                  })),
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() =>
                        setPwd((prevPwd) => ({
                          ...prevPwd,
                          confirmPassword: {
                            ...prevPwd.confirmPassword,
                            show: !prevPwd.confirmPassword.show,
                          },
                        }))
                      }
                    >
                      {pwd.confirmPassword.show ? (
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
                  type="submit"
                  sx={{
                    marginY: 1,
                    width: "87%",
                    maxWidth: "400px",
                    color: "primary",
                  }}
                  disabled={
                    isSubmitting ||
                    !isValid ||
                    pwd.password.value !== pwd.confirmPassword.value ||
                    registerUserQueryIsFetching
                  }
                >
                  Register
                </Button>
                {isSubmitting || registerUserQueryIsFetching ? (
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
                ) : (
                  <></>
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
        </form>
      </Box>

      <AlertDialog
        open={registerUserQueryIsSuccess}
        title="Sign Up Successful"
        content={
          <Typography variant="body2">
            You have been registered successfully as a resident. You will now be
            redirect to the login page. Please proceed with registering your
            house after logging in.
          </Typography>
        }
        showActions={true}
        actions={[
          {
            text: "OK",
            onclick: "closeDialog",
          },
        ]}
        onClose={() => {
          // window.location.reload();
          // setRegistered(true);
          queryClient.removeQueries({
            queryKey: queries.registerUserQuery.queryKey,
            exact: true,
          });
          navigate("/login");
        }}
      />

      <AlertDialog
        open={registerUserQueryIsError}
        title="Sign Up Failed"
        content={
          <Typography variant="body2">
            There was an error while signing up. Please try again after some
            time.
          </Typography>
        }
        showActions={true}
        actions={[
          {
            text: "OK",
            onclick: () => {
              reset();
              setPwd({
                password: { value: null, show: false },
                confirmPassword: { value: null, show: false },
              });
              setQueries((prevQueries) => ({
                ...prevQueries,
                registerUserQuery: {
                  ...prevQueries.registerUserQuery,
                  enabled: false,
                  data: { name: "", email: "", phone: "", password: "" },
                },
                validateEmailQuery: {
                  ...prevQueries.validateEmailQuery,
                  enabled: false,
                  params: { email: "" },
                },
              }));
              queryClient.removeQueries({
                queryKey: queries.registerUserQuery.queryKey,
                exact: true,
              });
            },
          },
        ]}
      />

      <DevTool control={control} />
    </>
  );
};
