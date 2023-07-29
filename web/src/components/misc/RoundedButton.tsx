import { Button, SxProps, Theme, Typography } from "@mui/material";
import React, { useState } from "react";

type RoundedButtonProps = {
  text: string;
  sx?: SxProps<Theme>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export const RoundedButton = (props: RoundedButtonProps) => {
  const [variant, setVariant] = useState<"outlined" | "contained" | "text">(
    "outlined"
  );

  return (
    <Button
      variant={variant}
      size="large"
      sx={{ borderRadius: 5, ...props.sx }}
      onClick={props.onClick}
      onMouseEnter={(_e) => setVariant("contained")}
      onMouseLeave={(_e) => setVariant("outlined")}
    >
      <Typography variant="caption" sx={{ fontSize: 17 }}>
        {props.text}
      </Typography>
    </Button>
  );
};
