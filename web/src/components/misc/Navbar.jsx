import { useState, useContext } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Button,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./../../context/userContext";

const drawerWidth = 250;
// const navItems = ["Home", "Login"];
// const paths = ["/home", "/login"];

export const Navbar = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const { userDetails, fetchNewUserDetails, verifyTokenData } =
    useContext(UserContext);

  console.log(userDetails);
  const loggedIn =
    userDetails !== null && userDetails !== undefined && verifyTokenData();

  // console.log(userDetails);
  // console.log(loggedIn);
  // const verified = loggedIn ? userDetails.verified : null;

  //   const handleNavigate = (item) => {
  //     navigate(paths[navItems.indexOf(item)]);
  //   };

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Milk Delivery
      </Typography>
      <Divider />
      <List>
        {!loggedIn ? (
          <ListItem disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => navigate("/home")}
            >
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
        ) : (
          <></>
        )}
        {loggedIn ? (
          <ListItem disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => navigate("/dashboard")}
            >
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
        ) : (
          <></>
        )}

        {/* {loggedIn && !verified ? (
          <ListItem disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => navigate("/verify")}
            >
              <ListItemText primary="Verify Email" />
            </ListItemButton>
          </ListItem>
        ) : (
          <></>
        )} */}

        {loggedIn ? (
          <ListItem disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => {
                fetchNewUserDetails({ logout: true });
                navigate("/home");
              }}
            >
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        ) : (
          <></>
        )}
        {!loggedIn ? (
          <ListItem disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => navigate("/login")}
            >
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        ) : (
          <></>
        )}
        {loggedIn ? (
          <ListItem disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => navigate("register/house")}
            >
              <ListItemText primary="Register House" />
            </ListItemButton>
          </ListItem>
        ) : (
          <ListItem disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => navigate("register/user")}
            >
              <ListItemText primary="Register User" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                display: { xs: "none", sm: "block" },
                ml: 4,
                mr: 3,
              }}
            >
              Milk Delivery
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
              mt: 0.5,
              mr: "5%",
              flexGrow: 0,
              // alignItems: "flex-end",
            }}
          >
            {!loggedIn ? (
              <Button sx={{ color: "#fff" }} onClick={() => navigate("/home")}>
                Home
              </Button>
            ) : (
              <></>
            )}
            {!loggedIn ? (
              <Button sx={{ color: "#fff" }} onClick={() => navigate("/login")}>
                Login
              </Button>
            ) : (
              <></>
            )}
            {loggedIn ? (
              <Button
                sx={{ color: "#fff" }}
                onClick={() => navigate("register/house")}
              >
                Register House
              </Button>
            ) : (
              <Button
                sx={{ color: "#fff" }}
                onClick={() => navigate("register/user")}
              >
                Register User
              </Button>
            )}
            {loggedIn ? (
              <Button
                sx={{ color: "#fff" }}
                onClick={() => {
                  fetchNewUserDetails({ logout: true });
                  navigate("/home");
                }}
              >
                Logout
              </Button>
            ) : (
              <></>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
};

Navbar.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};
