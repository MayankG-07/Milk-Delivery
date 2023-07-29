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
} from "@mui/material";
import HouseIcon from "@mui/icons-material/House";
import SettingsIcon from "@mui/icons-material/Settings";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { url } from "../../assets/res";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import { LinkButton } from "../misc/LinkButton";

type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Wing = "a" | "b";

type HouseProps = {
  houseid: number;
};

type SubDetails = {
  subid: number;
  milkids: number[];
  sub_start: Date;
  sub_end: Date;
  days: Day[];
  pause_date: Date | null;
  resume_date: Date | null;
  delivered: Date[];
  not_delivered: Date[];
  active: boolean;
  houseid: number;
};

type fetchHouseDetailsData = {
  houseid: number;
  wing: Wing;
  houseno: number;
  members: number[];
};

export const House = (props: HouseProps, loading?: boolean) => {
  const { userDetails, verifyTokenData } = useContext(AuthContext);

  const [activeSubs, setActiveSubs] = useState<number>(0);

  const navigate = useNavigate();

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
      queryFn: async (houseid: number): Promise<SubDetails[]> => {
        return await axios({
          method: "GET",
          url: `${url}/house/${houseid}/subs-details`,
          headers: {
            Authorization: `Bearer ${userDetails?.token_data?.access_token}`,
          },
        }).then((res) => {
          const subs: {
            subid: number;
            milkids: number[];
            sub_start: string;
            sub_end: string;
            days: Day[];
            pause_date: string | null;
            resume_date: string | null;
            delivered: string[];
            not_delivered: string[];
            active: boolean;
            houseid: number;
          }[] = res.data.subs;
          const subsWithDate: SubDetails[] = [];

          subs.forEach((sub) => {
            subsWithDate.push({
              ...sub,
              sub_start: new Date(sub.sub_start),
              sub_end: new Date(sub.sub_end),
              pause_date: sub.pause_date ? new Date(sub.pause_date) : null,
              resume_date: sub.resume_date ? new Date(sub.resume_date) : null,
              delivered: sub.delivered.map((date) => new Date(date)),
              not_delivered: sub.not_delivered.map((date) => new Date(date)),
            });
          });

          return subsWithDate;
        });
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
      for (let i = 0; i < data.length; i++) {
        if (data[i].active) {
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
    <Card sx={{ width: 200, backgroundColor: "#e0e0e2", mr: 2 }}>
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
            <IconButton
              aria-label="settings"
              onClick={() =>
                navigate("/house/manage", {
                  state: {
                    houseid: fetchHouseDetailsData.houseid,
                  },
                })
              }
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        }
        title={`${fetchHouseDetailsData?.wing.toUpperCase()} - ${fetchHouseDetailsData?.houseno.toString()}`.trim()}
        titleTypographyProps={{ fontSize: 17, fontWeight: "bold" }}
      />
      <Divider />
      <CardContent>
        {activeSubs === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7 }}>
            No active subscriptions
          </Typography>
        ) : (
          <LinkButton onClick={() => alert("Subscription")}>
            <Typography variant="body2" color="primary.main">
              {activeSubs === 1
                ? "1 active subscription"
                : `${activeSubs} active subscriptions`}
            </Typography>
          </LinkButton>
        )}
      </CardContent>
    </Card>
  ) : (
    <></>
  );
};
