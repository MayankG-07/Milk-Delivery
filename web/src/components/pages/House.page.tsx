import { useLocation } from "react-router-dom";
import { HouseDetails } from "../../types/House.page.types";
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
import { SubDetails } from "../../types/House.types";
import { SessionExpiredAlert } from "../misc/SessionExpiredAlert";
import { days, prettyDate, url } from "../../assets/res";
import { useContext, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { LinkButton } from "../misc/LinkButton";
import { AuthContext } from "../../context/authContext";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export const HousePage = () => {
  const { state } = useLocation();

  const {
    houseDetails,
    subs,
  }: { houseDetails: HouseDetails; subs: SubDetails[] } = state;

  let milkids: number[] = [];
  subs.forEach((sub) => {
    milkids.push(...sub.milkids);
  });

  milkids = milkids.filter(
    (milkid, index) => milkids.indexOf(milkid) === index
  );

  const { userDetails } = useContext(AuthContext);

  const [queries] = useState({
    fetchMilks: {
      queryKey: ["fetchMilks", subs],
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
      enabled: true,
    },
    fetchMembers: {
      queryKey: ["fetchMembers", houseDetails.members],
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
      enabled: true,
    },
  });

  const {
    // isFetching: fetchMilksIsFetching,
    isSuccess: fetchMilksIsSuccess,
    // isError: fetchMilksIsError,
    data: fetchMilksData,
    // error: fetchMilksError,
  } = useQuery({
    queryKey: queries.fetchMilks.queryKey,
    queryFn: async () => await queries.fetchMilks.queryFn(milkids),
    enabled: queries.fetchMilks.enabled,
    refetchOnWindowFocus: false,
  });

  const {
    // isFetching: fetchMembersIsFetching,
    // isSuccess: fetchMembersIsSuccess,
    // isError: fetchMembersIsError,
    data: fetchMembersData,
    // error: fetchMembersError,
  } = useQuery({
    queryKey: queries.fetchMembers.queryKey,
    queryFn: async () =>
      await queries.fetchMembers.queryFn(houseDetails.members),
    enabled: queries.fetchMembers.enabled,
    refetchOnWindowFocus: false,
  });

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
          Manage House:{" "}
          {`${houseDetails.wing.toUpperCase()} - ${houseDetails.houseno}`}
        </Typography>
        <Divider
          sx={{
            display: { xs: "flex" },
            marginBottom: { xs: 0.5, sm: 2 },
            width: { sx: "80%", sm: "40%" },
          }}
        />

        {subs.length === 0 ? (
          <Typography sx={{ paddingY: 2, fontSize: 17 }} variant="body2">
            You do not have any active subscriptions.
          </Typography>
        ) : (
          <>
            <Typography sx={{ paddingY: 2, fontSize: 17 }} variant="subtitle1">
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
                  {subs.map((sub) => (
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
                        {/* {sub.delivered.length}{" "} */}
                        <Tooltip title="Bill Details" arrow placement="top">
                          <IconButton
                            onClick={(_e) =>
                              alert("Bill details for sub " + sub.subid)
                            }
                          >
                            <CurrencyRupeeIcon
                              fontSize="small"
                              sx={{
                                color: "text.secondary",
                                mb: 0.5,
                              }}
                            />
                          </IconButton>
                        </Tooltip>
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
                        <IconButton onClick={(_e) => alert("Edit yourself")}>
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
              {houseDetails.wing.toUpperCase()} - {houseDetails.houseno}
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
                (user) => user.userid === houseDetails.members[0]
              )?.name +
                (houseDetails.members[0] === userDetails?.userid
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

      <SessionExpiredAlert />
    </>
  );
};
