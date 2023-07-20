import { Box, Typography, Divider } from "@mui/material";
import { House } from "../dashboard.page/House";
import { SessionExpiredAlert } from "../misc/SessionExpiredAlert";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { url } from "../../assets/res";

export const Dashboard = () => {
  const { userDetails } = useContext(AuthContext);
  const userid = userDetails?.userid;

  const [queries, setQueries] = useState({
    fetchHouses: {
      queryKey: ["fetchHouses", userid],
      queryFn: async (userId: number): Promise<number[]> => {
        return await axios({
          method: "GET",
          url: `${url}/user/details`,
          params: { userid: userId },
        }).then((res) => res.data.houseids);
      },
      enabled: true,
    },
  });

  const {
    // isFetching: fetchHousesIsFetching,
    // isSuccess: fetchHousesIsSuccess,
    // isError: fetchHousesIsError,
    data: fetchHousesData,
    // error: fetchHousesError,
  } = useQuery({
    queryKey: queries.fetchHouses.queryKey,
    queryFn: async () => await queries.fetchHouses.queryFn(userid!),
    enabled: queries.fetchHouses.enabled,
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
          Dashboard
        </Typography>
        <Divider
          sx={{
            display: { xs: "flex" },
            marginBottom: { xs: 0.5, sm: 2 },
            width: { sx: "80%", sm: "40%" },
          }}
        />

        <Typography sx={{ paddingY: 2, fontSize: 17 }} variant="subtitle1">
          Your Houses
        </Typography>

        <Box sx={{ display: "flex" }}>
          {fetchHousesData?.map((houseid) => (
            <House key={houseid} houseid={houseid} />
          ))}
        </Box>
      </Box>

      <SessionExpiredAlert />
    </>
  );
};
