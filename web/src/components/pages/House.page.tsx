import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { SessionExpiredAlert } from "../misc/SessionExpiredAlert";
import {
  calculateNetAmountForSub,
  dateTimeFromString,
  dateToQueryString,
  days,
  prettyDate,
  prettyDateTime,
  subIsPaused,
  url,
} from "../../assets/res";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LinkButton } from "../misc/LinkButton";
import { AuthContext } from "../../context/authContext";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PauseIcon from "@mui/icons-material/Pause";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { AlertDialog } from "../misc/AlertDialog";
import { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";

type HouseDetails = {
  houseid: number;
  wing: "a" | "b";
  houseno: number;
  members: number[];
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

type BillDetails = {
  billid: number;
  billGenTime: Date;
  billAmt: number;
  paid: boolean;
  subid: number;
  houseid: number;
};

type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const HousePage = () => {
  const { state } = useLocation();
  const { houseid }: { houseid: number } = state;

  const navigate = useNavigate();

  const { userDetails } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [milkids, setMilkids] = useState<number[] | null>(null);
  const [pauseAlertOpen, setPauseAlertOpen] = useState<boolean>(false);
  const [pausedSubDetailsAlert, setPausedSubDetailsAlert] = useState<{
    open: boolean;
    details: { amount: number | null } | null;
  }>({ open: false, details: null });

  const [subToPause, setSubToPause] = useState<number | null>(null);
  const [pauseDate, setPauseDate] = useState<Dayjs | null>(null);
  const [resumeDate, setResumeDate] = useState<Dayjs | null>(null);

  const [queries, setQueries] = useState({
    fetchHouse: {
      queryKey: ["fetchHouse", houseid],
      queryFn: async (houseid: number): Promise<HouseDetails> =>
        await axios({
          method: "GET",
          url: `${url}/house/details`,
          params: { houseid },
        }).then((res) => res.data),
      enabled: true,
    },
    fetchDueBills: {
      queryKey: ["fetchDueBills", houseid],
      queryFn: async (): Promise<BillDetails[]> =>
        await axios({
          method: "GET",
          url: `${url}/house/${houseid}/due-details`,
        }).then((res) => {
          const data: {
            billid: number;
            billGenTime: string;
            billAmt: number;
            paid: boolean;
            subid: number;
            houseid: number;
          }[] = res.data.data;

          const billDetails: BillDetails[] = [];
          for (const bill of data) {
            billDetails.push({
              ...bill,
              billGenTime: dateTimeFromString(bill.billGenTime),
            });
          }

          return billDetails;
        }),
      enabled: true,
    },
    fetchActiveSubs: {
      queryKey: ["fetchActiveSubs", houseid],
      queryFn: async (houseid: number): Promise<SubDetails[]> =>
        await axios({
          method: "GET",
          url: `${url}/house/${houseid}/subs-details`,
          headers: {
            Authorization: `Bearer ${userDetails?.token_data?.access_token}`,
          },
        }).then((res) => {
          const allSubs: {
            subid: number;
            milkids: number[];
            sub_start: string;
            sub_end: string;
            days: Day[];
            pause_date: string;
            resume_date: string;
            delivered: string[];
            not_delivered: string[];
            active: boolean;
            houseid: number;
          }[] = res.data.subs;
          const activeSubs = allSubs
            .filter((sub, _index, _array) => sub.active)
            .map((sub) => ({
              ...sub,
              sub_start: new Date(sub.sub_start),
              sub_end: new Date(sub.sub_end),
              pause_date: new Date(sub.pause_date),
              resume_date: new Date(sub.resume_date),
              delivered: sub.delivered.map((date) => new Date(date)),
              not_delivered: sub.not_delivered.map((date) => new Date(date)),
            }));
          return activeSubs;
        }),
      enabled: true,
    },
    fetchMilks: {
      queryKey: ["fetchMilks", houseid],
      queryFn: async (
        milkIds: number[]
      ): Promise<
        {
          milkid: number;
          company: string;
          type: string;
          qty_kg: number;
          price: number;
        }[]
      > => {
        const milkDetails: {
          milkid: number;
          company: string;
          type: string;
          qty_kg: number;
          price: number;
        }[] = [];

        for (let i = 0; i < milkIds.length; i++) {
          await axios({
            method: "GET",
            url: `${url}/misc/milk-details/${milkIds[i]}`,
          }).then((res) => milkDetails.push(res.data));
        }

        return milkDetails;
      },
      enabled: false,
    },

    fetchMembers: {
      queryKey: ["fetchMembers", houseid],
      queryFn: async (
        memberIds: number[]
      ): Promise<
        {
          userid: number;
          name: string;
          email: string;
          phone: string;
          imgUrl: string | null;
          houseids: number[];
          verified: boolean;
        }[]
      > => {
        const members: {
          userid: number;
          name: string;
          email: string;
          phone: string;
          imgUrl: string | null;
          houseids: number[];
          verified: boolean;
        }[] = [];

        for (let i = 0; i < memberIds.length; i++) {
          await axios({
            method: "GET",
            url: `${url}/user/details`,
            params: {
              userid: memberIds[i],
            },
          }).then((res) => members.push(res.data));
        }

        return members;
      },
      enabled: false,
    },
    pauseSub: {
      queryKey: ["pauseSub", houseid, new Date()],
      queryFn: async (
        subid: number,
        pause_date: Date,
        resume_date: Date
      ): Promise<SubDetails> => {
        pause_date.setDate(pause_date.getDate() + 1);
        resume_date.setDate(resume_date.getDate() + 1);
        return await axios({
          method: "PUT",
          url: `${url}/sub/${subid}/pause`,
          data: {
            pause_date: dateToQueryString(pause_date),
            resume_date: dateToQueryString(resume_date),
          },
          headers: {
            Authorization: `Bearer ${userDetails?.token_data?.access_token}`,
          },
        }).then((res) => {
          const sub: SubDetails = res.data;
          return sub;
        });
      },
      enabled: false,
    },
  });

  const {
    isFetching: fetchHouseIsFetching,
    isSuccess: fetchHouseIsSuccess,
    isError: fetchHouseIsError,
    data: fetchHouseData,
    error: fetchHouseError,
  } = useQuery({
    queryKey: queries.fetchHouse.queryKey,
    queryFn: async () => await queries.fetchHouse.queryFn(houseid),
    enabled: queries.fetchHouse.enabled,
    refetchOnWindowFocus: false,
    onSuccess: (_data) =>
      setQueries((prevQueries) => ({
        ...prevQueries,
        fetchMembers: { ...prevQueries.fetchMembers, enabled: true },
      })),
  });

  const {
    isFetching: fetchDueBillsIsFetching,
    isSuccess: fetchDueBillsIsSuccess,
    isError: fetchDueBillsIsError,
    data: fetchDueBillsData,
    error: fetchDueBillsError,
  } = useQuery({
    queryKey: queries.fetchDueBills.queryKey,
    queryFn: async () => await queries.fetchDueBills.queryFn(),
    enabled: queries.fetchDueBills.enabled,
    refetchOnWindowFocus: false,
  });

  const {
    isFetching: fetchActiveSubsIsFetching,
    isSuccess: fetchActiveSubsIsSuccess,
    isError: fetchActiveSubsIsError,
    data: fetchActiveSubsData,
    error: fetchActiveSubsError,
  } = useQuery({
    queryKey: queries.fetchActiveSubs.queryKey,
    queryFn: async () => await queries.fetchActiveSubs.queryFn(houseid),
    enabled: queries.fetchActiveSubs.enabled,
    refetchOnWindowFocus: false,
    onSuccess: (_data) =>
      setQueries((prevQueries) => ({
        ...prevQueries,
        fetchMilks: { ...prevQueries.fetchMilks, enabled: true },
      })),
  });

  const {
    isFetching: fetchMembersIsFetching,
    isSuccess: fetchMembersIsSuccess,
    isError: fetchMembersIsError,
    data: fetchMembersData,
    error: fetchMembersError,
  } = useQuery({
    queryKey: queries.fetchMembers.queryKey,
    queryFn: async () =>
      await queries.fetchMembers.queryFn(
        fetchHouseData ? fetchHouseData.members : []
      ),
    enabled: queries.fetchMembers.enabled,
    refetchOnWindowFocus: false,
  });

  const {
    isFetching: fetchMilksIsFetching,
    isSuccess: fetchMilksIsSuccess,
    isError: fetchMilksIsError,
    data: fetchMilksData,
    error: fetchMilksError,
  } = useQuery({
    queryKey: queries.fetchMilks.queryKey,
    queryFn: async () =>
      await queries.fetchMilks.queryFn(milkids ? milkids : []),
    enabled: queries.fetchMilks.enabled,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const milkids_repeated: number[] = [];
    fetchActiveSubsData?.forEach((sub) => {
      milkids_repeated.push(...sub.milkids);
    });

    setMilkids(
      milkids_repeated.filter(
        (milkid, index) => milkids_repeated.indexOf(milkid) === index
      )
    );
  }, [fetchActiveSubsData]);

  const {
    isFetching: pauseSubIsFetching,
    isSuccess: pauseSubIsSuccess,
    isError: pauseSubIsError,
    data: pauseSubData,
    error: pauseSubError,
  } = useQuery({
    queryKey: queries.pauseSub.queryKey,
    queryFn: async () =>
      await queries.pauseSub.queryFn(
        subToPause!,
        pauseDate?.toDate()!,
        resumeDate?.toDate()!
      ),
    enabled: queries.pauseSub.enabled,
    refetchOnWindowFocus: false,
    onSuccess: (_data) => {
      console.log(pauseDate, resumeDate);
      setQueries((prevQueries) => ({
        ...prevQueries,
        fetchActiveSubs: { ...prevQueries.fetchActiveSubs, enabled: false },
      }));
      queryClient.removeQueries({
        queryKey: queries.fetchActiveSubs.queryKey,
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: queries.pauseSub.queryKey,
        exact: true,
      });
      setQueries((prevQueries) => ({
        ...prevQueries,
        pauseSub: { ...prevQueries.pauseSub, enabled: false },
        fetchActiveSubs: { ...prevQueries.fetchActiveSubs, enabled: true },
      }));
    },
  });

  return (
    <>
      {fetchHouseIsFetching ||
      fetchDueBillsIsFetching ||
      fetchActiveSubsIsFetching ||
      fetchMilksIsFetching ||
      fetchMembersIsFetching ||
      pauseSubIsFetching ? (
        <>Loading...</>
      ) : fetchHouseIsError ||
        fetchDueBillsIsError ||
        fetchActiveSubsIsError ||
        fetchMilksIsError ||
        fetchMembersIsError ||
        pauseSubIsError ? (
        <>Error</>
      ) : (
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
              Manage House:{" "}
              {`${fetchHouseData?.wing.toUpperCase()} - ${
                fetchHouseData?.houseno
              }`}
            </Typography>
            <Divider
              sx={{
                display: { xs: "flex" },
                marginBottom: { xs: 0.5, sm: 2 },
                width: { sx: "80%", sm: "40%" },
              }}
            />

            {fetchDueBillsData?.length === 0 ? (
              <Typography
                sx={{ paddingY: 2, fontSize: 17 }}
                variant="subtitle1"
              >
                You do not have any due bills.
              </Typography>
            ) : (
              <>
                <Typography
                  sx={{ paddingY: 2, fontSize: 17 }}
                  variant="subtitle1"
                >
                  Pending Bills
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: "#e0e0e2",
                    width: "80%",
                    minWidth: "450px",
                    mb: 4,
                  }}
                >
                  <Table aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subscription</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Generated on</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fetchDueBillsData?.map((bill) => (
                        <TableRow
                          key={bill.billid}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell>
                            <LinkButton
                              onClick={(_e) =>
                                navigate("/sub/manage", {
                                  state: {
                                    subid: bill.subid,
                                  },
                                })
                              }
                            >
                              <Typography variant="body1" sx={{ fontSize: 15 }}>
                                view details
                              </Typography>
                            </LinkButton>
                          </TableCell>
                          <TableCell>
                            &#x20B9; {bill.billAmt.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {prettyDateTime(bill.billGenTime)}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={(_e) => alert("pay bill " + bill.billid)}
                              variant="contained"
                              sx={{ mb: 1 }}
                            >
                              Pay
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {fetchActiveSubsData?.length === 0 ? (
              <Typography sx={{ paddingY: 2, fontSize: 17 }} variant="body2">
                You do not have any active subscriptions.
              </Typography>
            ) : (
              <>
                <Typography
                  sx={{ paddingY: 2, fontSize: 17 }}
                  variant="subtitle1"
                >
                  Active Subscriptions
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: "#e0e0e2",
                    width: "80%",
                    minWidth: "450px",
                    mb: 4,
                  }}
                >
                  <Table aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Days</TableCell>
                        <TableCell>Milks</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fetchActiveSubsData?.map((sub) => (
                        <TableRow
                          key={sub.subid}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell>
                            {sub.days.map((day) =>
                              sub.days.indexOf(day) === sub.days.length - 1
                                ? days.get(day)?.short
                                : days.get(day)?.short + ", "
                            )}
                          </TableCell>
                          <TableCell>
                            {fetchMilksIsSuccess &&
                              sub.milkids.map((milkid) => {
                                const { company, type, qty_kg } =
                                  fetchMilksData?.find(
                                    (milk) => milk.milkid === milkid
                                  )!;
                                return `${type}: ${qty_kg}kg (${company})`;
                              })}
                          </TableCell>
                          <TableCell>{prettyDate(sub.sub_start)}</TableCell>
                          <TableCell>{prettyDate(sub.sub_end)}</TableCell>
                          <TableCell align="right" sx={{ pr: 4 }}>
                            {subIsPaused(sub) ? (
                              <>
                                <b>Paused</b>
                                <Tooltip title="Details" arrow placement="top">
                                  <IconButton
                                    onClick={async (_e) => {
                                      const amount =
                                        await calculateNetAmountForSub(sub);
                                      setPausedSubDetailsAlert({
                                        open: true,
                                        details: { amount },
                                      });
                                    }}
                                  >
                                    <InfoOutlinedIcon
                                      fontSize="small"
                                      sx={{
                                        color: "text.secondary",
                                        mb: 0.5,
                                      }}
                                    />
                                  </IconButton>
                                </Tooltip>

                                <AlertDialog
                                  open={pausedSubDetailsAlert.open}
                                  title="Paused Subscription Details"
                                  content={
                                    <Box>
                                      <Typography variant="body1">
                                        Paused on:{" "}
                                        <b>{prettyDate(sub.pause_date!)}</b>
                                      </Typography>
                                      <Typography variant="body1">
                                        To be resumed on:{" "}
                                        <b>{prettyDate(sub.resume_date!)}</b>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          sx={{ ml: 1, mb: 0.5 }}
                                          onClick={(_e) =>
                                            alert("Pause sub " + sub.subid)
                                          }
                                        >
                                          resume now
                                        </Button>
                                      </Typography>
                                      <Typography variant="body1">
                                        Ends automatically on:{" "}
                                        <b>{prettyDate(sub.sub_end!)}</b>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="error"
                                          sx={{
                                            ml: 1,
                                            mb: 0.5,
                                          }}
                                          onClick={(_e) =>
                                            alert("End sub " + sub.subid)
                                          }
                                        >
                                          end now
                                        </Button>
                                      </Typography>
                                      <Typography variant="body1">
                                        Net amount till now:
                                        <b style={{ marginLeft: 6 }}>
                                          &#8377;
                                          {pausedSubDetailsAlert.details?.amount?.toFixed(
                                            2
                                          )}
                                        </b>
                                      </Typography>
                                    </Box>
                                  }
                                  showActions={true}
                                  actions={[
                                    {
                                      text: "ok",
                                      onclick: () =>
                                        setPausedSubDetailsAlert({
                                          open: false,
                                          details: null,
                                        }),
                                    },
                                  ]}
                                />
                              </>
                            ) : (
                              <>
                                <Tooltip title="Edit" arrow placement="top">
                                  <IconButton
                                    onClick={(_e) =>
                                      alert("Edit sub " + sub.subid)
                                    }
                                  >
                                    <EditIcon
                                      fontSize="small"
                                      sx={{
                                        color: "text.secondary",
                                        mb: 0.5,
                                      }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Pause" arrow placement="top">
                                  <IconButton
                                    onClick={(_e) => setPauseAlertOpen(true)}
                                  >
                                    <PauseIcon
                                      fontSize="small"
                                      sx={{
                                        color: "text.secondary",
                                        mb: 0.5,
                                      }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                <AlertDialog
                                  open={pauseAlertOpen}
                                  title="Pause Subscription"
                                  content={
                                    <Box sx={{ mt: 1 }}>
                                      <DatePicker
                                        label="Pause Date"
                                        value={pauseDate}
                                        onChange={(date) => setPauseDate(date)}
                                        sx={{ mr: 1.3 }}
                                      />
                                      <DatePicker
                                        label="Resume Date"
                                        value={resumeDate}
                                        onChange={(date) => setResumeDate(date)}
                                      />
                                    </Box>
                                  }
                                  showActions={true}
                                  actions={[
                                    {
                                      text: "cancel",
                                      onclick: () => setPauseAlertOpen(false),
                                      sx: { color: "text.secondary" },
                                    },
                                    {
                                      text: "confirm",
                                      onclick: () => {
                                        setSubToPause(sub.subid);
                                        setQueries((prevQueries) => ({
                                          ...prevQueries,
                                          pauseSub: {
                                            ...prevQueries.pauseSub,
                                            enabled: true,
                                          },
                                        }));
                                        setPauseAlertOpen(false);
                                      },
                                    },
                                  ]}
                                />
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            <Typography sx={{ paddingY: 2, fontSize: 17 }} variant="subtitle1">
              Members{" "}
              <LinkButton onClick={(_e) => alert("Add member")}>
                add member
              </LinkButton>
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "#e0e0e2",
                width: "80%",
                minWidth: "450px",
                mb: 4,
              }}
            >
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email ID</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fetchMembersData?.map((user) => (
                    <TableRow
                      key={user.userid}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell sx={{ width: 10 }}>
                        {user.imgUrl !== null ? (
                          <Avatar
                            sx={{ width: 35, height: 35, mb: 0.5, left: 10 }}
                            src={user.imgUrl}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              backgroundColor: "text.secondary",
                              width: 35,
                              height: 35,
                              mb: 0.5,
                              left: 10,
                            }}
                          >{`${user.name[0].toUpperCase()}`}</Avatar>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.name +
                          (user.userid === userDetails?.userid ? " (You)" : "")}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell align="right" sx={{ pr: 4 }}>
                        {user.userid !== userDetails?.userid ? (
                          <>
                            <Tooltip title="Message" arrow placement="top">
                              <IconButton
                                onClick={(_e) =>
                                  alert("Message user " + user.userid)
                                }
                              >
                                <ChatIcon
                                  fontSize="small"
                                  sx={{
                                    mb: 0.3,
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove" arrow placement="top">
                              <IconButton
                                onClick={(_e) =>
                                  alert("Delete user " + user.userid)
                                }
                              >
                                <DeleteIcon
                                  fontSize="small"
                                  color="error"
                                  sx={{
                                    mb: 0.8,
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Edit" arrow placement="top">
                            <IconButton
                              onClick={(_e) => alert("Edit yourself")}
                            >
                              <EditIcon
                                fontSize="small"
                                sx={{
                                  color: "text.secondary",
                                  mb: 0.8,
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography sx={{ paddingY: 2, fontSize: 17 }} variant="subtitle1">
              House Settings
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                House Number:{" "}
                <b>
                  {fetchHouseData?.wing.toUpperCase()} -{" "}
                  {fetchHouseData?.houseno}
                </b>{" "}
                <LinkButton
                  sx={{ right: 10, ml: 0, pl: 0 }}
                  onClick={(_e) => alert("Edit house")}
                >
                  edit
                </LinkButton>
              </Typography>

              <Typography variant="body1">
                Created By:{" "}
                <b>
                  {fetchMembersData?.find(
                    (user) => user.userid === fetchHouseData?.members[0]
                  )?.name +
                    (fetchHouseData?.members[0] === userDetails?.userid
                      ? " (You)"
                      : "")}
                </b>{" "}
                <LinkButton
                  sx={{ right: 5 }}
                  onClick={() => alert("Created by details")}
                >
                  details
                </LinkButton>
              </Typography>
            </Box>

            <Typography sx={{ paddingY: 2, fontSize: 17 }} variant="subtitle1">
              Danger Zone
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Button variant="contained" color="error">
                Delete House
              </Button>
            </Box>
          </Box>
        </>
      )}
      <SessionExpiredAlert />
    </>
  );
};
