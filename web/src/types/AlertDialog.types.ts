export type ActionType = {
  text: string;
  onclick: "close" | (() => void);
};

export type AlertDialogProps = {
  open: boolean;
  title: string;
  content: string | React.ReactNode;
  showActions?: boolean;
  actions?: ActionType[];
};
