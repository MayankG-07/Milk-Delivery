import axios from "axios";
import { url } from "../../assets/res";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { PropTypes } from "prop-types";

export const Sub = ({
  subid,
  milkid = 0,
  sub_start = new Date(),
  current = false,
}) => {
  const [subDetails, setSubDetails] = useState({});

  useEffect(() => {
    console.log("useEffect called");
    // axios.get(`${url}`).then(res => console.log(res.data.))
    axios
      .put(`${url}/admin/query`, {
        query: `SELECT * FROM subs WHERE subid=${subid}`,
      })
      .then((res) => {
        console.log("query run");
        console.log(res);
        setSubDetails({
          ...subDetails,
          sub: { id: res.data.data[0], type: res.data.data[1] },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  return (
    <>
      <Box>{JSON.stringify(subDetails)}</Box>
    </>
  );
};

Sub.propTypes = {
  subid: PropTypes.number,
  milkid: PropTypes.number,
  sub_start: PropTypes.instanceOf(Date),
  current: PropTypes.bool,
};
