import { useState, useContext, useEffect } from "react";
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
import { AuthContext } from "../../context/authContext";

type NavbarProps = {
  window?: () => Window;
};

const drawerWidth = 250;

export const Navbar = (props: NavbarProps) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const navigate = useNavigate();

  const { userDetails, fetchNewUserDetails } = useContext(AuthContext);

  useEffect(() => {
    setLoggedIn(
      userDetails !== null &&
        userDetails !== undefined &&
        "token_data" in userDetails
    );
  }, [userDetails]);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h5" sx={{ my: 2, textDecoration: "bold" }}>
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
      <AppBar component="nav" sx={{ backgroundColor: "text.primary" }}>
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
              variant="h5"
              component="div"
              sx={{
                display: { xs: "none", sm: "block" },
                ml: 4,
                mr: 3,
                color: "background.default",
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
