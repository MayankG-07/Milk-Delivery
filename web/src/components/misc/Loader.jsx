import { PropTypes } from "prop-types";
import { LinearProgress, Box } from "@mui/material";
import { AlertDialog } from "./AlertDialog";

export const Loader = ({ loading }) => {
  // console.log(loading);
  return (
    <AlertDialog
      open={loading}
      title="Loading..."
      content={
        <Box>
          <LinearProgress />
        </Box>
      }
    />
  );
};

Loader.propTypes = {
  loading: PropTypes.bool.isRequired,
};
