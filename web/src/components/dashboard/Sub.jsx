import axios from "axios";
import { images, milk_types, url } from "../../assets/res";
import { useEffect, useState } from "react";
import {
  Divider,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import EditIcon from "@mui/icons-material/Edit";
// import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
// import { red } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import { PropTypes } from "prop-types";

export const Sub = ({
  subid,
  milkid,
  start,
  current = false,
  isFav = false,
  children,
}) => {
  const [subDetails, setSubDetails] = useState({
    sub_start: start,
    current,
    milk: {},
    sub: {},
    isFav,
  });
  const [loading, setLoading] = useState(true);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const popoverOpen = Boolean(popoverAnchorEl);

  const [expanded, setExpanded] = useState(false);
  const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  }));

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

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
            const company = milk[1].toLowerCase();
            setSubDetails((details) =>
              milk
                ? {
                    ...details,
                    milk: {
                      id: milk[0],
                      company:
                        company.charAt(0).toUpperCase() + company.slice(1),
                      type: milk[2],
                      quantity: milk[3],
                      price: milk[4],
                    },
                  }
                : details
            );
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });

    // setSubDetails((details) => ({
    //   ...details,
    //   sub_start,
    //   current,
    // }));
  }, [subid, milkid]);

  // console.log(subDetails);

  return (
    <>
      <>{children(loading)}</>
      {current && !loading ? (
        <Card sx={{ maxWidth: 345 }}>
          <CardHeader
            avatar={<Avatar src={images.amul_full_cream} />}
            action={
              <>
                <IconButton
                  aria-label="more options"
                  onClick={(event) => setPopoverAnchorEl(event.currentTarget)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Popover
                  open={popoverOpen}
                  anchorEl={popoverAnchorEl}
                  onClose={() => setPopoverAnchorEl(null)}
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton>
                        <ListItemText primary="Generate Bill" />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                      <ListItemButton>
                        <ListItemText primary="End Subscription" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Popover>
              </>
            }
            title={`${subDetails.milk.company} - ${
              milk_types[subDetails.milk.type]
            } - ${subDetails.milk.quantity} kg`}
            subheader={`Start: ${subDetails.sub_start.toDateString()}`}
          />
          <Divider />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Company: {subDetails.milk.company}
              <br />
              Milk Type: {milk_types[subDetails.milk.type]}
              <br />
              Quantity: {subDetails.milk.quantity} kg
              <br />
              Price: Rs. {subDetails.milk.price}
            </Typography>
          </CardContent>
          <Divider />
          <CardActions disableSpacing>
            <IconButton
              aria-label="add to favorites"
              onClick={() =>
                setSubDetails((details) => ({
                  ...details,
                  isFav: !details.isFav,
                }))
              }
            >
              {subDetails.isFav ? (
                <FavoriteIcon />
              ) : (
                <FavoriteBorderOutlinedIcon />
              )}
            </IconButton>
            <IconButton aria-label="edit">
              <EditIcon />
            </IconButton>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Divider sx={{ display: expanded ? "block" : "none" }} />
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <Typography variant="body2">
                Days Per Week:
                <br />
                Ends on:
                <br />
                Auto Renew:
              </Typography>
            </CardContent>
          </Collapse>
        </Card>
      ) : (
        <></>
      )}
    </>
  );
};

Sub.propTypes = {
  subid: PropTypes.number,
  milkid: PropTypes.number,
  start: PropTypes.instanceOf(Date),
  current: PropTypes.bool,
  isFav: PropTypes.bool,
  children: PropTypes.func,
};
