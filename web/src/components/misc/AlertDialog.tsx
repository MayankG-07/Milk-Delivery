import React, { forwardRef, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Theme,
  type SxProps,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

type ActionType = {
  text: string;
  onclick: "close" | (() => void);
  sx?: SxProps<Theme>;
};

type AlertDialogProps = {
  open: boolean;
  title: string;
  content: string | React.ReactNode;
  showActions?: boolean;
  actions?: ActionType[];
};

const Transition: React.JSXElementConstructor<
  TransitionProps & {
    children: React.ReactElement<any, any>;
  }
> = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const AlertDialog = ({
  open,
  title = "Alert",
  content,
  showActions = false,
  actions,
}: AlertDialogProps) => {
  let dialogOpen = open;

  const [stateDialogOpen, setStateDialogOpen] = useState(dialogOpen);

  useEffect(() => {
    setStateDialogOpen(dialogOpen);
  }, [dialogOpen]);

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
      <DialogContent>{content}</DialogContent>
      {showActions ? (
        <DialogActions>
          {actions?.map((action: ActionType) => (
            <Button
              key={action.text}
              onClick={() => {
                if (action.onclick !== "close") {
                  action.onclick();
                }
                dialogOpen = false;
                setStateDialogOpen(false);
              }}
              sx={action.sx}
            >
              {action.text}
            </Button>
          ))}
        </DialogActions>
      ) : (
        <></>
      )}
    </Dialog>
  );
};
