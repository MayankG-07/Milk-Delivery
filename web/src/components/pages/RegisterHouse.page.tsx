/* eslint-disable no-unused-vars */
import {
  Box,
  Typography,
  Divider,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { url } from "../../assets/res";
import { DevTool } from "@hookform/devtools";
import { AlertDialog } from "../misc/AlertDialog";
import { AuthContext } from "../../context/authContext";
import { SessionExpiredAlert } from "../misc/SessionExpiredAlert";
import { useNavigate } from "react-router-dom";

type RegisterHouseFormValues = {
  houseno: number;
};

type getHouseIdQueryData = {
  houseid?: number | null;
  wing?: "a" | "b" | null;
  houseno?: number | null;
  members?: number[];
};

type registerHouseQueryData = {
  houseid?: number;
  wing?: "a" | "b";
  houseno?: number;
  members?: number[];
};

export const RegisterHouse = () => {
  const [wing, setWing] = useState<"a" | "b" | null>(null);
  const [houseno, setHouseno] = useState<number | null>(null);

  const { userDetails, fetchNewUserDetails, verifyTokenData } =
    useContext(AuthContext);

  const [loggedIn, setLoggedIn] = useState(true);
  useEffect(() => {
    setLoggedIn(
      userDetails !== null &&
        userDetails !== undefined &&
        "token_data" in userDetails
    );
  }, [userDetails]);

  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    control,
    formState: {
      errors,
      isValid,
      isSubmitting,
      isSubmitted,
      isSubmitSuccessful,
    },
    reset: formReset,
  } = useForm<RegisterHouseFormValues>({ mode: "onChange" });

  const queryClient = useQueryClient();

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
        });
      },
      resultData: null,
      enabled: false,
    },
    registerHouseQuery: {
      queryKey: ["registerHouse"],
      queryFn: async (
        wing: "a" | "b",
        houseno: number
      ): Promise<registerHouseQueryData> => {
        return await axios({
          method: "POST",
          url: `${url}/house/register`,
          data: { wing, houseno },
          headers: {
            Authorization: `Bearer ${userDetails?.token_data?.access_token}`,
          },
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
      isFetching: registerHouseQueryIsFetching,
      data: registerHouseQueryData,
      isError: registerHouseQueryIsError,
      error: registerHouseQueryError,
      isSuccess: registerHouseQueryIsSuccess,
    },
  ] = [
    useQuery({
      queryKey: queries.getHouseIdQuery.queryKey,
      queryFn: async () => {
        if (wing !== null && houseno !== null) {
          return await queries.getHouseIdQuery.queryFn(wing, houseno);
        }
      },
      enabled: queries.getHouseIdQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (err) => {
        if (
          err instanceof AxiosError &&
          err.response?.status === 404 &&
          err.response?.data?.detail === "House not found"
        ) {
          setQueries((prevQueries) => ({
            ...prevQueries,
            registerHouseQuery: {
              ...prevQueries.registerHouseQuery,
              enabled: true,
            },
          }));
        }
      },
    }),
    useQuery({
      queryKey: queries.registerHouseQuery.queryKey,
      queryFn: async () => {
        if (wing !== null && houseno !== null) {
          return await queries.registerHouseQuery.queryFn(wing, houseno);
        }
      },
      enabled: queries.registerHouseQuery.enabled,
      refetchOnWindowFocus: false,
      retry: false,
    }),
  ];

  const onSubmit: SubmitHandler<RegisterHouseFormValues> = (_formData) => {
    verifyTokenData();
    if (userDetails !== null) {
      setQueries((prevQueries) => ({
        ...prevQueries,
        getHouseIdQuery: { ...prevQueries.getHouseIdQuery, enabled: true },
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
          marginTop: { xs: "22%", sm: 12 },
          marginLeft: { sm: 10 },
        }}
      >
        <Typography sx={{ paddingY: 2 }} variant="h5">
          Register a House
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
          <FormControl sx={{ mb: 1 }}>
            <RadioGroup
              row
              value={wing}
              onChange={(e) => {
                setWing(e.target.value === "a" ? "a" : "b");
              }}
            >
              <FormControlLabel label="A" value="a" control={<Radio />} />
              <FormControlLabel label="B" value="b" control={<Radio />} />
            </RadioGroup>
          </FormControl>
        </Box>
        <form
          style={{ width: "100%", maxWidth: "345px" }}
          onSubmit={handleSubmit(onSubmit)}
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
                maxWidth: "300px",
                color: "primary",
              }}
              label="House no"
              {...formRegister("houseno", {
                required: {
                  value: true,
                  message: "Please enter a house number.",
                },
                valueAsNumber: true,
                onChange: (e) => {
                  if (!isNaN(parseInt(e.target.value))) {
                    setHouseno(e.target.value);
                  }
                },
                validate: (value) =>
                  isNaN(value) ? "Please enter a valid house number." : true,
              })}
              error={!!errors.houseno}
              helperText={errors.houseno?.message}
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
                    maxWidth: "300px",
                    color: "primary",
                  }}
                  disabled={!isValid || wing === null}
                >
                  Register
                </Button>
                {getHouseIdQueryIsFetching && (
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
            </Box>
          </Box>
        </form>
      </Box>

      <AlertDialog
        open={getHouseIdQueryIsSuccess}
        title="Register house failed"
        content={
          <Typography variant="body2">
            {`The house ${wing?.toUpperCase()}-${houseno} already exists. Please
              check the details that you have entered.`}
          </Typography>
        }
        showActions={true}
        actions={[
          {
            text: "OK",
            onclick: () => {
              formReset();
              setWing(null);
              setQueries((prevQueries) => ({
                ...prevQueries,
                getHouseIdQuery: {
                  ...prevQueries.getHouseIdQuery,
                  enabled: false,
                },
              }));
              queryClient.removeQueries({
                queryKey: queries.getHouseIdQuery.queryKey,
                exact: true,
              });
            },
          },
        ]}
      />

      <AlertDialog
        open={registerHouseQueryIsSuccess}
        title="House registered successfully"
        content={
          <Typography variant="body2">
            {`The house ${wing?.toUpperCase()}-${houseno} has been registered successfully. You can now add members
              to your house.`}
          </Typography>
        }
        showActions={true}
        actions={[
          {
            text: "Add members",
            onclick: () => {
              setQueries((prevQueries) => ({
                ...prevQueries,
                getHouseIdQuery: {
                  ...prevQueries.getHouseIdQuery,
                  enabled: false,
                },
                registerHouseQuery: {
                  ...prevQueries.registerHouseQuery,
                  enabled: false,
                },
              }));

              queryClient.removeQueries({
                queryKey: queries.getHouseIdQuery.queryKey,
                exact: true,
              });
              queryClient.removeQueries({
                queryKey: queries.registerHouseQuery.queryKey,
                exact: true,
              });

              navigate("/house/add-members");
            },
          },
          {
            text: "Maybe later",
            onclick: () => {
              setQueries((prevQueries) => ({
                ...prevQueries,
                getHouseIdQuery: {
                  ...prevQueries.getHouseIdQuery,
                  enabled: false,
                },
                registerHouseQuery: {
                  ...prevQueries.registerHouseQuery,
                  enabled: false,
                },
              }));

              queryClient.removeQueries({
                queryKey: queries.getHouseIdQuery.queryKey,
                exact: true,
              });
              queryClient.removeQueries({
                queryKey: queries.registerHouseQuery.queryKey,
                exact: true,
              });
            },
          },
        ]}
      />

      <SessionExpiredAlert />

      <DevTool control={control} />
    </>
  );
};
