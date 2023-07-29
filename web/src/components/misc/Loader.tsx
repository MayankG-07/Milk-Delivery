import { LinearProgress, Box } from "@mui/material";
import { AlertDialog } from "./AlertDialog";

type LoaderProps = {
  loading: boolean;
};

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
