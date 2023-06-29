import { useState } from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";

const drawerWidth = 240;
// const navItems = ["Home", "Login"];
// const paths = ["/home", "/login"];

export const Navbar = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const userContext = useContext(UserContext);
  const { userDetails, handleDetailsChange } = userContext;
  const loggedIn = Object.keys(userDetails).length !== 0;

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
        <ListItem disablePadding>
          <ListItemButton
            sx={{ textAlign: "center" }}
            onClick={() => navigate("/home")}
          >
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ textAlign: "center" }}
            onClick={
              loggedIn
                ? () => {
                    handleDetailsChange({});
                    navigate("/home");
                    location.reload();
                  }
                : () => navigate("/login")
            }
          >
            <ListItemText primary={loggedIn ? "Logout" : "Login"} />
          </ListItemButton>
        </ListItem>
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
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: { xs: "none", sm: "block" },
              marginLeft: { md: "10%", sm: "5%" },
            }}
          >
            Milk Delivery
          </Typography>
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
              marginLeft: { md: "55%", sm: "45%" },
            }}
          >
            <Button sx={{ color: "#fff" }} onClick={() => navigate("/home")}>
              Home
            </Button>
            <Button
              sx={{ color: "#fff" }}
              onClick={
                loggedIn
                  ? () => {
                      handleDetailsChange({});
                      navigate("/home");
                      location.reload();
                    }
                  : () => navigate("/login")
              }
            >
              {loggedIn ? <>Logout</> : <>Login</>}
            </Button>
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
