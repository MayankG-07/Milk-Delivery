import { forwardRef } from "react";

import { PropTypes } from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Slide,
  Box,
} from "@mui/material";

export const Loader = ({ loading }) => {
  return (
    <Dialog
      open={loading}
      TransitionComponent={Transition}
      keepMounted
      aria-describedby="alert-dialog-slide-description"
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle>{"Loading..."}</DialogTitle>
      <DialogContent>
        <Box>
          <LinearProgress />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

Loader.propTypes = {
  loading: PropTypes.bool.isRequired,
};
