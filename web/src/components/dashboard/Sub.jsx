import axios from "axios";
import { url } from "../../assets/res";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { PropTypes } from "prop-types";

export const Sub = ({ subid, milkid, start = new Date(), current = false }) => {
  const sub_start = start.toJSON().slice(0, 10);
  const [subDetails, setSubDetails] = useState({});

  useEffect(() => {
    // console.log("useEffect called");
    // axios.get(`${url}`).then((res) => console.log(res.data.message));
    axios
      .put(`${url}/admin/query`, {
        query: `SELECT * FROM subs WHERE subid=${subid}`,
      })
      .then((res) => {
        // console.log("query run");
        // console.log(res);
        const sub = res.data.data[0];
        setSubDetails((details) =>
          sub
            ? {
                ...details,
                sub: { id: sub[0], type: sub[1] },
              }
            : details
        );

        axios
          .put(`${url}/admin/query`, {
            query: `SELECT * FROM milks WHERE milkid=${milkid}`,
          })
          .then((res) => {
            // console.log("query run");
            // console.log(res);
            const milk = res.data.data[0];
            setSubDetails((details) =>
              milk
                ? {
                    ...details,
                    milk: {
                      id: milk[0],
                      company: milk[1],
                      type: milk[2],
                      quantity: milk[3],
                      price: milk[4],
                    },
                  }
                : details
            );
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });

    setSubDetails((details) => ({
      ...details,
      sub_start,
      current,
    }));
  }, [subid, milkid, sub_start, current]);

  console.log(subDetails);

  return (
    <>
      <Box>Hello Sub</Box>
    </>
  );
};

Sub.propTypes = {
  subid: PropTypes.number,
  milkid: PropTypes.number,
  start: PropTypes.instanceOf(Date),
  current: PropTypes.bool,
};
