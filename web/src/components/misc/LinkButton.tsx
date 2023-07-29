import { Button, Theme, type SxProps } from "@mui/material";

export const LinkButton = ({
  sx,
  onClick,
  children,
}: {
  sx?: SxProps<Theme>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children?: React.ReactNode;
}) => (
  <Button
    disableRipple
    disableFocusRipple
    disableTouchRipple
    sx={{
      textTransform: "lowercase",
      fontWeight: "normal",
      width: "auto",
      mb: 0.2,
      "&:hover": {
        background: "transparent",
        textDecoration: "underline",
      },
      ...sx,
    }}
    onClick={(event) => onClick!(event)}
  >
    {children}
  </Button>
);
