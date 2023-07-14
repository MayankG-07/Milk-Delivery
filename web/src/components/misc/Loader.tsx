import { LinearProgress, Box } from "@mui/material";
import { AlertDialog } from "./AlertDialog";
import { LoaderProps } from "../../types/Loader.types";

export const Loader = ({ loading }: LoaderProps) => {
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
