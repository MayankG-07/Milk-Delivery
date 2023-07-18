import { useContext, useState } from "react";
import IconButton from "@mui/material/IconButton";
import {
  Stack,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Skeleton,
  Divider,
  Tooltip,
  Link,
} from "@mui/material";
import { HouseProps, fetchHouseDetailsData } from "../../types/House.types";
import HouseIcon from "@mui/icons-material/House";
import SettingsIcon from "@mui/icons-material/Settings";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { url } from "../../assets/res";
import { AuthContext } from "../../context/authContext";
import { Day } from "../../types/DaysActive.types";

export const House = (props: HouseProps) => {
  const { userDetails, verifyTokenData } = useContext(AuthContext);

  const [activeSubs, setActiveSubs] = useState<number>(0);

  const [queries, setQueries] = useState({
    fetchHouseDetails: {
      queryKey: ["fetchHouseDetails", JSON.stringify(props)],
      queryFn: async ({
        houseid = null,
        wing = null,
        houseno = null,
      }: {
        houseid?: number | null;
        wing?: number | null;
        houseno?: number | null;
      }): Promise<fetchHouseDetailsData> => {
        return await axios({
          method: "GET",
          url: `${url}/house/details`,
          params: { houseid, wing, houseno },
        }).then((res) => res.data);
      },
    },
    fetchHouseSubsDetails: {
      queryKey: ["fetchHouseSubsDetails", props.houseid.toString()],
      queryFn: async (
        houseid: number
      ): Promise<{
        subs: {
          subid: number;
          milkids: number[];
          sub_start: string;
          sub_end: string;
          days: Day[];
          pause_dates: string[];
          resume_dates: string[];
          delivered: string[];
          not_delivered: string[];
          active: boolean;
          houseid: number;
        }[];
      }> => {
        return await axios({
          method: "GET",
          url: `${url}/house/${houseid}/subs-details`,
          headers: {
            Authorization: `Bearer ${userDetails?.token_data?.access_token}`,
          },
        }).then((res) => res.data);
      },
      enabled: false,
    },
  });

  const {
    isFetching: fetchHouseDetailsIsFetching,
    isSuccess: fetchHouseDetailsIsSuccess,
    isError: fetchHouseDetailsIsError,
    data: fetchHouseDetailsData,
    // error: fetchHouseDetailsError,
  } = useQuery({
    queryKey: queries.fetchHouseDetails.queryKey,
    queryFn: async () =>
      await queries.fetchHouseDetails.queryFn({ houseid: props.houseid }),
    refetchOnWindowFocus: false,
    onSuccess: (_data) => {
      verifyTokenData();
      setQueries((prev) => ({
        ...prev,
        fetchHouseSubsDetails: {
          ...prev.fetchHouseSubsDetails,
          enabled: true,
        },
      }));
    },
  });

  const {
    isFetching: fetchHouseSubsDetailsIsFetching,
    isSuccess: fetchHouseSubsDetailsIsSuccess,
    isError: fetchHouseSubsDetailsIsError,
    // data: fetchHouseSubsDetailsData,
    // error: fetchHouseSubsDetailsError,
  } = useQuery({
    queryKey: queries.fetchHouseSubsDetails.queryKey,
    queryFn: async () =>
      await queries.fetchHouseSubsDetails.queryFn(props.houseid),
    refetchOnWindowFocus: false,
    enabled: queries.fetchHouseSubsDetails.enabled,
    onSuccess: (data) => {
      for (let i: number = 0; i < data.subs.length; i++) {
        if (data.subs[i].active) {
          setActiveSubs((c) => c + 1);
        }
      }
    },
  });

  return fetchHouseDetailsIsError || fetchHouseSubsDetailsIsError ? (
    <Typography variant="body1">An error occurred.</Typography>
  ) : fetchHouseDetailsIsFetching || fetchHouseSubsDetailsIsFetching ? (
    <Stack direction="column" sx={{ mr: 2 }}>
      <Stack direction="row">
        <Skeleton variant="circular" width={35} height={35} animation="wave" />
        <Skeleton sx={{ width: 80, ml: 1.5 }} />
      </Stack>
      <Skeleton
        variant="rounded"
        width={200}
        height={100}
        sx={{ mt: 1, ml: 0.2 }}
      />
    </Stack>
  ) : fetchHouseDetailsIsSuccess && fetchHouseSubsDetailsIsSuccess ? (
    <Card sx={{ maxWidth: 345, width: 250, backgroundColor: "#e0e0e2", mr: 2 }}>
      <CardHeader
        avatar={
          <Avatar
            sx={{ backgroundColor: "primary.main", width: 35, height: 35 }}
            aria-label="wing-avatar"
          >
            <HouseIcon sx={{ color: "background.default" }} fontSize="small" />
          </Avatar>
        }
        action={
          <Tooltip title="Manage" arrow placement="top">
            <IconButton aria-label="settings" onClick={() => alert("Settings")}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        }
        title={`${fetchHouseDetailsData?.wing.toUpperCase()} - ${
          fetchHouseDetailsData?.houseno
        }`}
        titleTypographyProps={{ fontSize: 17, fontWeight: "bold" }}
      />
      <Divider />
      <CardContent>
        <Link
          component="button"
          onClick={() => alert("Subscription")}
          underline="hover"
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexGrow: 1 }}
          >
            {activeSubs === 0 ? (
              <>No active subscriptions.</>
            ) : activeSubs === 1 ? (
              "1 active subscription"
            ) : (
              `${activeSubs} active subscriptions`
            )}
          </Typography>
        </Link>
      </CardContent>
    </Card>
  ) : (
    <></>
  );
};
