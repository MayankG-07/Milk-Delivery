import { forwardRef, useState } from "react";
import { PropTypes } from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Button,
} from "@mui/material";
import { useEffect } from "react";

export const AlertDialog = ({
  open,
  title = "Alert",
  content,
  showActions = false,
  actions = [],
  onClose = () => {},
}) => {
  //   const [dialogOpen, setDialogOpen] = useState(open);
  let dialogOpen = open;
  const [stateDialogOpen, setStateDialogOpen] = useState(dialogOpen);

  useEffect(() => {
    setStateDialogOpen(dialogOpen);
  }, [dialogOpen]);

  //   console.log(dialogOpen, stateDialogOpen);

  return (
    <Dialog
      open={dialogOpen && stateDialogOpen}
      TransitionComponent={Transition}
      keepMounted
      aria-describedby="alert-dialog-slide-description"
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle>{title}</DialogTitle>
      {/* <Divider sx={{ display: titleDivider ? "block" : "none" }} /> */}
      <DialogContent>{content}</DialogContent>
      {showActions ? (
        <DialogActions>
          {actions.map((item) => (
            <Button
              key={item.text}
              onClick={
                item.onclick === "closeDialog"
                  ? () => {
                      console.log("clicked");
                      dialogOpen = false;
                      setStateDialogOpen(false);
                      onClose();
                    }
                  : () => {
                      item.onclick();
                      onClose();
                    }
              }
            >
              {item.text}
            </Button>
          ))}
        </DialogActions>
      ) : (
        <></>
      )}
    </Dialog>
  );
};

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

AlertDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  content: PropTypes.node,
  //   divider: PropTypes.bool,
  showActions: PropTypes.bool,
  actions: PropTypes.array,
  onClose: PropTypes.func,
};
